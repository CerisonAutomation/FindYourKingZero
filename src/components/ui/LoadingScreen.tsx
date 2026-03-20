import {motion} from 'framer-motion';

interface LoadingScreenProps {
    message?: string;
}

export function LoadingScreen({message = 'Loading...'}: LoadingScreenProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-6">
                {/* Animated Logo */}
                <motion.div
                    className="relative"
                    animate={{scale: [1, 1.05, 1]}}
                    transition={{duration: 2, repeat: Infinity, ease: "easeInOut"}}
                >
                    <div
                        className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-lg glow">
                        <motion.span
                            className="text-3xl font-bold text-primary-foreground"
                            animate={{opacity: [0.7, 1, 0.7]}}
                            transition={{duration: 1.5, repeat: Infinity}}
                        >
                            ❤️
                        </motion.span>
                    </div>

                    {/* Orbiting dots */}
                    <motion.div
                        className="absolute inset-0"
                        animate={{rotate: 360}}
                        transition={{duration: 3, repeat: Infinity, ease: "linear"}}
                    >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary"/>
                    </motion.div>
                    <motion.div
                        className="absolute inset-0"
                        animate={{rotate: -360}}
                        transition={{duration: 4, repeat: Infinity, ease: "linear"}}
                    >
                        <div
                            className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent"/>
                    </motion.div>
                </motion.div>

                {/* Loading text */}
                <div className="flex flex-col items-center gap-2">
                    <motion.p
                        className="text-lg font-medium text-foreground"
                        animate={{opacity: [0.5, 1, 0.5]}}
                        transition={{duration: 1.5, repeat: Infinity}}
                    >
                        {message}
                    </motion.p>

                    {/* Progress bar */}
                    <div className="w-48 h-1 rounded-full bg-muted overflow-hidden">
                        <motion.div
                            className="h-full gradient-primary"
                            initial={{x: '-100%'}}
                            animate={{x: '100%'}}
                            transition={{duration: 1.5, repeat: Infinity, ease: "easeInOut"}}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
