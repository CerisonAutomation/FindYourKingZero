import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Check, Cookie, Settings, Shield, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Switch} from '@/components/ui/switch';
import {ConsentState, useCookieConsent} from '@/hooks/useConsent';

interface CookiePreferencesProps {
    onSave?: (preferences: Partial<ConsentState>) => void;
}

export const CookiePreferences = ({onSave}: CookiePreferencesProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const {getStoredConsent, saveConsent, hasGivenConsent} = useCookieConsent();

    const [preferences, setPreferences] = useState<Partial<ConsentState>>({
        essential_cookies: true,
        analytics_cookies: false,
        marketing_cookies: false,
        personalization_cookies: false,
    });

    useEffect(() => {
        const stored = getStoredConsent();
        if (!stored) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        } else {
            setPreferences({
                essential_cookies: true,
                analytics_cookies: stored.analytics_cookies || false,
                marketing_cookies: stored.marketing_cookies || false,
                personalization_cookies: stored.personalization_cookies || false,
            });
        }
    }, [getStoredConsent]);

    const handleAcceptAll = () => {
        const allAccepted: Partial<ConsentState> = {
            essential_cookies: true,
            analytics_cookies: true,
            marketing_cookies: true,
            personalization_cookies: true,
        };
        saveConsent(allAccepted);
        onSave?.(allAccepted);
        setIsVisible(false);
    };

    const handleRejectAll = () => {
        const rejected: Partial<ConsentState> = {
            essential_cookies: true,
            analytics_cookies: false,
            marketing_cookies: false,
            personalization_cookies: false,
        };
        saveConsent(rejected);
        onSave?.(rejected);
        setIsVisible(false);
    };

    const handleSavePreferences = () => {
        saveConsent(preferences);
        onSave?.(preferences);
        setIsVisible(false);
        setShowDetails(false);
    };

    const cookieTypes = [
        {
            key: 'essential_cookies',
            name: 'Essential Cookies',
            description: 'Required for the website to function. Cannot be disabled.',
            required: true,
        },
        {
            key: 'analytics_cookies',
            name: 'Analytics Cookies',
            description: 'Help us understand how visitors interact with our website.',
            required: false,
        },
        {
            key: 'marketing_cookies',
            name: 'Marketing Cookies',
            description: 'Used to track visitors across websites for advertising purposes.',
            required: false,
        },
        {
            key: 'personalization_cookies',
            name: 'Personalization Cookies',
            description: 'Allow the website to remember your preferences and choices.',
            required: false,
        },
    ];

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
                        className="max-w-4xl mx-auto bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <Cookie className="w-5 h-5 text-primary"/>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Cookie Preferences</h3>
                                    <p className="text-xs text-muted-foreground">Find Your King respects your
                                        privacy</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowDetails(!showDetails)}
                            >
                                {showDetails ? <X className="w-5 h-5"/> : <Settings className="w-5 h-5"/>}
                            </Button>
                        </div>

                        {/* Simple View */}
                        <AnimatePresence mode="wait">
                            {!showDetails ? (
                                <motion.div
                                    key="simple"
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    exit={{opacity: 0}}
                                    className="p-4"
                                >
                                    <p className="text-sm text-muted-foreground mb-4">
                                        We use cookies to maintain your session, remember your preferences, and generate
                                        statistics.
                                        You can customize your preferences or accept all cookies.{' '}
                                        <a href="/cookies" className="text-primary hover:underline">
                                            Read our Cookie Policy
                                        </a>
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={handleRejectAll}
                                            className="w-full sm:w-auto border-border text-muted-foreground hover:bg-muted"
                                        >
                                            Reject All
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowDetails(true)}
                                            className="w-full sm:w-auto border-border text-muted-foreground hover:bg-muted"
                                        >
                                            <Settings className="w-4 h-4 mr-2"/>
                                            Customize
                                        </Button>
                                        <Button
                                            onClick={handleAcceptAll}
                                            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
                                        >
                                            <Check className="w-4 h-4 mr-2"/>
                                            Accept All
                                        </Button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="details"
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    exit={{opacity: 0}}
                                    className="p-4"
                                >
                                    <div className="space-y-4 mb-4">
                                        {cookieTypes.map((cookie) => (
                                            <div
                                                key={cookie.key}
                                                className="flex items-start justify-between p-3 bg-muted/30 rounded-lg"
                                            >
                                                <div className="flex-1 mr-4">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-sm font-medium text-foreground">{cookie.name}</h4>
                                                        {cookie.required && (
                                                            <span
                                                                className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                Required
                              </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-1">{cookie.description}</p>
                                                </div>
                                                <Switch
                                                    checked={preferences[cookie.key as keyof ConsentState] || false}
                                                    onCheckedChange={(checked) =>
                                                        setPreferences(prev => ({...prev, [cookie.key]: checked}))
                                                    }
                                                    disabled={cookie.required}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div
                                        className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 mb-4">
                                        <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0"/>
                                        <p className="text-xs text-emerald-200">
                                            Your privacy choices are stored locally and respected across all features.
                                        </p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowDetails(false)}
                                            className="flex-1"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            onClick={handleSavePreferences}
                                            className="flex-1 bg-primary hover:bg-primary/90"
                                        >
                                            Save Preferences
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
