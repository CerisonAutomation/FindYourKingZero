import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Button} from '@/components/ui/button';

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('FIND YOUR KING_cookie_consent');
        if (!consent) {
            // Show after a short delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('FIND YOUR KING_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDeny = () => {
        localStorage.setItem('FIND YOUR KING_cookie_consent', 'denied');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{y: 100, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    exit={{y: 100, opacity: 0}}
                    transition={{duration: 0.3}}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4"
                >
                    <div
                        className="max-w-4xl mx-auto bg-[#141418] rounded-xl border border-[#2A2E35] p-4 sm:p-6 shadow-2xl">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[#B9BDC7] text-sm text-center sm:text-left">
                                We use cookies to maintain user session & generate statistics. Read our{' '}
                                <a
                                    href="https://FIND YOUR KING.com/legalfoot.php"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#E53945] hover:text-[#FF6B6B] underline transition-colors"
                                >
                                    Cookies policy
                                </a>
                            </p>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleDeny}
                                    className="border-[#2A2E35] text-[#B9BDC7] hover:bg-[#2A2E35] hover:text-white px-6"
                                >
                                    Deny
                                </Button>
                                <Button
                                    onClick={handleAccept}
                                    className="bg-[#E53945] hover:bg-[#FF6B6B] text-white font-semibold px-6"
                                >
                                    I understand
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
