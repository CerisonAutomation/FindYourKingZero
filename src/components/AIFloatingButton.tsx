import {useState} from 'react';
import {motion} from 'framer-motion';
import {Bot, Sparkles} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {AIAssistant} from '@/components/AIAssistant';

export const AIFloatingButton = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <motion.div
                initial={{scale: 0}}
                animate={{scale: 1}}
                className="fixed bottom-24 right-4 z-40"
            >
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 hover:scale-110 transition-transform"
                >
                    <motion.div
                        animate={{rotate: isOpen ? 180 : 0}}
                        transition={{duration: 0.3}}
                    >
                        {isOpen ? (
                            <Sparkles className="w-6 h-6"/>
                        ) : (
                            <Bot className="w-6 h-6"/>
                        )}
                    </motion.div>
                </Button>

                {/* Pulse animation */}
                {!isOpen && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-primary/30"
                        animate={{scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5]}}
                        transition={{duration: 2, repeat: Infinity}}
                    />
                )}
            </motion.div>

            <AIAssistant isOpen={isOpen} onClose={() => setIsOpen(false)}/>
        </>
    );
};
