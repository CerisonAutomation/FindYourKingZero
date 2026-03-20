import {useEffect, useRef, useState} from 'react';
import {cn} from '@/lib/utils';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    fallback?: string;
    blur?: boolean;
    aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
}

export function OptimizedImage({
                                   src,
                                   alt,
                                   className,
                                   fallback = '/placeholder.svg',
                                   blur = true,
                                   aspectRatio = 'auto',
                               }: OptimizedImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '50px',
                threshold: 0.01,
            }
        );

        if (imgRef.current) {
            observer.observe(imgRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const aspectClasses = {
        square: 'aspect-square',
        portrait: 'aspect-[3/4]',
        landscape: 'aspect-video',
        auto: '',
    };

    return (
        <div
            ref={imgRef}
            className={cn(
                'overflow-hidden bg-muted',
                aspectClasses[aspectRatio],
                className
            )}
        >
            {isInView && (
                <>
                    <img
                        src={hasError ? fallback : src}
                        alt={alt}
                        loading="lazy"
                        decoding="async"
                        className={cn(
                            'w-full h-full object-cover transition-all duration-500',
                            blur && !isLoaded && 'blur-sm scale-105',
                            isLoaded && 'blur-0 scale-100'
                        )}
                        onLoad={() => setIsLoaded(true)}
                        onError={() => {
                            setHasError(true);
                            setIsLoaded(true);
                        }}
                    />
                    {blur && !isLoaded && (
                        <div
                            className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent animate-pulse"/>
                    )}
                </>
            )}
        </div>
    );
}
