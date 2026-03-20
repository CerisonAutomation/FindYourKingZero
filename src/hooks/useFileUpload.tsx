import {useCallback, useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from './useAuth';
import {useToast} from './use-toast';
import imageCompression from 'browser-image-compression';

interface UploadOptions {
    bucket: string;
    path?: string;
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    quality?: number;
}

interface UploadResult {
    url: string;
    path: string;
}

export function useFileUpload() {
    const {user} = useAuth();
    const {toast} = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const compressImage = async (
        file: File,
        maxSizeMB = 1,
        maxWidthOrHeight = 1920
    ): Promise<File> => {
        // Skip compression for small files or non-images
        if (file.size < maxSizeMB * 1024 * 1024 || !file.type.startsWith('image/')) {
            return file;
        }

        try {
            const compressed = await imageCompression(file, {
                maxSizeMB,
                maxWidthOrHeight,
                useWebWorker: true,
            });
            return new File([compressed], file.name, {type: file.type});
        } catch {
            console.warn('Image compression failed, using original');
            return file;
        }
    };

    const upload = useCallback(
        async (file: File, options: UploadOptions): Promise<UploadResult | null> => {
            if (!user) {
                toast({
                    title: 'Error',
                    description: 'Please sign in to upload files',
                    variant: 'destructive',
                });
                return null;
            }

            const {
                bucket,
                path = '',
                maxSizeMB = 2,
                maxWidthOrHeight = 1920,
            } = options;

            // Validate file size (max 10MB raw)
            if (file.size > 10 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'Maximum file size is 10MB',
                    variant: 'destructive',
                });
                return null;
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                toast({
                    title: 'Invalid file type',
                    description: 'Only JPEG, PNG, WebP, and GIF images are allowed',
                    variant: 'destructive',
                });
                return null;
            }

            setIsUploading(true);
            setProgress(10);

            try {
                // Compress image
                const compressedFile = await compressImage(file, maxSizeMB, maxWidthOrHeight);
                setProgress(30);

                // Generate unique filename
                const fileExt = file.name.split('.').pop() || 'jpg';
                const fileName = `${user.id}/${path ? path + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                setProgress(50);

                // Upload to Supabase storage
                const {data, error} = await supabase.storage
                    .from(bucket)
                    .upload(fileName, compressedFile, {
                        cacheControl: '31536000', // 1 year
                        upsert: false,
                    });

                if (error) throw error;

                setProgress(80);

                // Get public URL
                const {data: urlData} = supabase.storage
                    .from(bucket)
                    .getPublicUrl(data.path);

                setProgress(100);

                return {
                    url: urlData.publicUrl,
                    path: data.path,
                };
            } catch (error: any) {
                console.error('Upload error:', error);
                toast({
                    title: 'Upload failed',
                    description: error.message || 'Please try again',
                    variant: 'destructive',
                });
                return null;
            } finally {
                setIsUploading(false);
                setProgress(0);
            }
        },
        [user, toast]
    );

    const deleteFile = useCallback(
        async (bucket: string, path: string): Promise<boolean> => {
            try {
                const {error} = await supabase.storage.from(bucket).remove([path]);
                if (error) throw error;
                return true;
            } catch (error: any) {
                console.error('Delete error:', error);
                toast({
                    title: 'Delete failed',
                    description: error.message || 'Please try again',
                    variant: 'destructive',
                });
                return false;
            }
        },
        [toast]
    );

    return {
        upload,
        deleteFile,
        isUploading,
        progress,
    };
}

/**
 * Generate a signed URL for private files
 */
export async function getSignedUrl(
    bucket: string,
    path: string,
    expiresIn = 3600
): Promise<string | null> {
    try {
        const {data, error} = await supabase.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);

        if (error) throw error;
        return data.signedUrl;
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return null;
    }
}
