import {useCallback, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Camera, CheckCircle, Loader2, RotateCcw, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useVerification} from '@/hooks/useVerification';

interface PhotoVerificationProps {
    onComplete?: () => void;
    onCancel?: () => void;
}

const POSES = [
    {instruction: 'Touch your nose with your right index finger', icon: '👆'},
    {instruction: 'Hold up 3 fingers on your left hand', icon: '✌️'},
    {instruction: 'Give a thumbs up with both hands', icon: '👍'},
    {instruction: 'Touch your right ear with your left hand', icon: '👂'},
    {instruction: 'Make a peace sign with your right hand', icon: '✌️'},
];

export const PhotoVerification = ({onComplete, onCancel}: PhotoVerificationProps) => {
    const [step, setStep] = useState<'intro' | 'camera' | 'review' | 'submitting' | 'success'>('intro');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [pose] = useState(() => POSES[Math.floor(Math.random() * POSES.length)]);
    const [cameraError, setCameraError] = useState<string>('');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const {submitVerification, uploadDocument, isSubmitting} = useVerification();

    const startCamera = useCallback(async () => {
        try {
            setCameraError('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {facingMode: 'user', width: 640, height: 480},
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setStep('camera');
        } catch (err) {
            setCameraError('Unable to access camera. Please ensure you have granted camera permissions.');
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const capturePhoto = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(video, 0, 0);
                const imageData = canvas.toDataURL('image/jpeg', 0.9);
                setCapturedImage(imageData);
                stopCamera();
                setStep('review');
            }
        }
    }, [stopCamera]);

    const retakePhoto = useCallback(() => {
        setCapturedImage(null);
        startCamera();
    }, [startCamera]);

    const submitPhoto = async () => {
        if (!capturedImage) return;

        setStep('submitting');

        try {
            // Convert base64 to blob
            const response = await fetch(capturedImage);
            const blob = await response.blob();
            const file = new File([blob], 'verification-selfie.jpg', {type: 'image/jpeg'});

            // Create verification request and upload photo
            submitVerification({
                type: 'photo',
                metadata: {pose_instruction: pose.instruction}
            }, {
                onSuccess: async (data) => {
                    if (data?.id) {
                        await uploadDocument(data.id, 'pose_photo', file);
                    }
                    setStep('success');
                    setTimeout(() => {
                        onComplete?.();
                    }, 2000);
                },
                onError: () => {
                    setStep('review');
                }
            });
        } catch {
            setStep('review');
        }
    };

    const handleCancel = () => {
        stopCamera();
        onCancel?.();
    };

    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <div className="bg-card rounded-2xl border border-border shadow-2xl max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">Photo Verification</h2>
                    <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <X className="w-5 h-5"/>
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {step === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{opacity: 0, y: 20}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -20}}
                                className="text-center space-y-4"
                            >
                                <div
                                    className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                    <Camera className="w-10 h-10 text-primary"/>
                                </div>
                                <h3 className="text-xl font-bold">Verify Your Identity</h3>
                                <p className="text-muted-foreground text-sm">
                                    Take a selfie while following the pose instruction to verify you're a real person.
                                </p>

                                <div className="bg-muted/50 rounded-xl p-4 text-left">
                                    <p className="text-xs text-muted-foreground mb-2">Your pose instruction:</p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{pose.icon}</span>
                                        <p className="text-sm font-medium text-foreground">{pose.instruction}</p>
                                    </div>
                                </div>

                                {cameraError && (
                                    <p className="text-sm text-destructive">{cameraError}</p>
                                )}

                                <Button onClick={startCamera} className="w-full">
                                    <Camera className="w-4 h-4 mr-2"/>
                                    Start Camera
                                </Button>
                            </motion.div>
                        )}

                        {step === 'camera' && (
                            <motion.div
                                key="camera"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                className="space-y-4"
                            >
                                <div className="bg-muted/50 rounded-lg p-3 text-center">
                                    <p className="text-sm font-medium text-foreground">{pose.instruction}</p>
                                </div>

                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black">
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    <div
                                        className="absolute inset-0 border-4 border-dashed border-primary/30 rounded-xl pointer-events-none"/>
                                </div>

                                <Button onClick={capturePhoto} className="w-full" size="lg">
                                    <Camera className="w-5 h-5 mr-2"/>
                                    Capture Photo
                                </Button>
                            </motion.div>
                        )}

                        {step === 'review' && capturedImage && (
                            <motion.div
                                key="review"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                className="space-y-4"
                            >
                                <p className="text-sm text-center text-muted-foreground">
                                    Review your photo. Make sure your face is clearly visible and you're doing the pose.
                                </p>

                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover"/>
                                </div>

                                <div className="flex gap-3">
                                    <Button variant="outline" onClick={retakePhoto} className="flex-1">
                                        <RotateCcw className="w-4 h-4 mr-2"/>
                                        Retake
                                    </Button>
                                    <Button onClick={submitPhoto} className="flex-1" disabled={isSubmitting}>
                                        <CheckCircle className="w-4 h-4 mr-2"/>
                                        Submit
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {step === 'submitting' && (
                            <motion.div
                                key="submitting"
                                initial={{opacity: 0}}
                                animate={{opacity: 1}}
                                exit={{opacity: 0}}
                                className="text-center py-8 space-y-4"
                            >
                                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto"/>
                                <p className="text-muted-foreground">Verifying your photo...</p>
                            </motion.div>
                        )}

                        {step === 'success' && (
                            <motion.div
                                key="success"
                                initial={{opacity: 0, scale: 0.9}}
                                animate={{opacity: 1, scale: 1}}
                                className="text-center py-8 space-y-4"
                            >
                                <div
                                    className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-8 h-8 text-green-500"/>
                                </div>
                                <h3 className="text-xl font-bold text-foreground">Verification Submitted!</h3>
                                <p className="text-muted-foreground text-sm">
                                    Your photo verification is being reviewed. You'll be notified once it's approved.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Hidden canvas for capture */}
                <canvas ref={canvasRef} className="hidden"/>
            </div>
        </motion.div>
    );
};
