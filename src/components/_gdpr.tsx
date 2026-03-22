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
import {useState} from 'react';
import {motion} from 'framer-motion';
import {AlertTriangle, CheckCircle, Clock, Download, FileText, Loader2, Shield, Trash2, XCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useGDPR} from '@/hooks/useGDPR';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {format} from 'date-fns';

export const DataManagement = () => {
    const {
        dataRequests,
        isLoading,
        hasPendingDeletion,
        scheduledDeletionDate,
        requestDataExport,
        requestAccountDeletion,
        cancelDeletionRequest,
        isRequesting
    } = useGDPR();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const pendingExport = dataRequests?.find(
        r => r.request_type === 'export' && ['pending', 'processing'].includes(r.status)
    );

    const completedExport = dataRequests?.find(
        r => r.request_type === 'export' && r.status === 'completed' && r.download_url
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary"/>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">Your Data Rights</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage your data in accordance with GDPR
                    </p>
                </div>
            </div>

            {/* Pending Deletion Warning */}
            {hasPendingDeletion && scheduledDeletionDate && (
                <motion.div
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    className="p-4 bg-destructive/10 rounded-xl border border-destructive/20"
                >
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5"/>
                        <div className="flex-1">
                            <h3 className="font-semibold text-destructive">Account Deletion Scheduled</h3>
                            <p className="text-sm text-destructive/80 mt-1">
                                Your account will be permanently deleted on{' '}
                                <strong>{format(new Date(scheduledDeletionDate), 'MMMM d, yyyy')}</strong>.
                                All your data will be erased and cannot be recovered.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => cancelDeletionRequest()}
                                className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                            >
                                <XCircle className="w-4 h-4 mr-2"/>
                                Cancel Deletion
                            </Button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Data Export */}
            <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Download className="w-5 h-5 text-blue-500"/>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Download Your Data</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Request a copy of all your personal data. This includes your profile,
                            messages, photos, and activity history.
                        </p>

                        {pendingExport ? (
                            <div className="flex items-center gap-2 mt-3 text-sm text-amber-500">
                                <Clock className="w-4 h-4 animate-pulse"/>
                                <span>Export in progress. You'll receive an email when ready.</span>
                            </div>
                        ) : completedExport?.download_url ? (
                            <div className="mt-3">
                                <a
                                    href={completedExport.download_url}
                                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                                >
                                    <FileText className="w-4 h-4"/>
                                    Download your data
                                </a>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Available
                                    until {format(new Date(completedExport.download_expires_at!), 'MMM d, yyyy')}
                                </p>
                            </div>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => requestDataExport()}
                                disabled={isRequesting}
                                className="mt-3"
                            >
                                <Download className="w-4 h-4 mr-2"/>
                                Request Data Export
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Account Deletion */}
            <div className="bg-card rounded-xl border border-border p-5">
                <div className="flex items-start gap-4">
                    <div
                        className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Trash2 className="w-5 h-5 text-destructive"/>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-foreground">Delete Your Account</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Permanently delete your account and all associated data.
                            This action cannot be undone after the 30-day grace period.
                        </p>

                        {!hasPendingDeletion && (
                            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="w-4 h-4 mr-2"/>
                                        Delete Account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-card border-border">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-foreground">
                                            Are you absolutely sure?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-muted-foreground">
                                            This will schedule your account for permanent deletion in 30 days.
                                            During this period, you can cancel the request. After 30 days,
                                            all your data will be permanently erased including:
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                <li>Your profile and photos</li>
                                                <li>All messages and conversations</li>
                                                <li>Favorites and matches</li>
                                                <li>All activity history</li>
                                            </ul>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={() => {
                                                requestAccountDeletion();
                                                setShowDeleteConfirm(false);
                                            }}
                                            className="bg-destructive hover:bg-destructive/90"
                                        >
                                            Yes, Delete My Account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                    </div>
                </div>
            </div>

            {/* Request History */}
            {dataRequests && dataRequests.length > 0 && (
                <div className="bg-card rounded-xl border border-border p-5">
                    <h3 className="font-semibold text-foreground mb-4">Request History</h3>
                    <div className="space-y-3">
                        {dataRequests.slice(0, 5).map((request) => (
                            <div
                                key={request.id}
                                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    {request.request_type === 'export' ? (
                                        <Download className="w-4 h-4 text-blue-500"/>
                                    ) : (
                                        <Trash2 className="w-4 h-4 text-destructive"/>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-foreground capitalize">
                                            {request.request_type} Request
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {format(new Date(request.requested_at), 'MMM d, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {request.status === 'completed' && (
                                        <span className="flex items-center gap-1 text-xs text-green-500">
                      <CheckCircle className="w-3 h-3"/>
                      Completed
                    </span>
                                    )}
                                    {request.status === 'pending' && (
                                        <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Clock className="w-3 h-3"/>
                      Pending
                    </span>
                                    )}
                                    {request.status === 'cancelled' && (
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <XCircle className="w-3 h-3"/>
                      Cancelled
                    </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Privacy Info */}
            <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-xs text-muted-foreground">
                    Your data rights are protected under the EU General Data Protection Regulation (GDPR).
                    For questions about your data, contact our Data Protection Officer at{' '}
                    <a href="mailto:privacy@fyking.men" className="text-primary hover:underline">
                        privacy@fyking.men
                    </a>
                </p>
            </div>
        </div>
    );
};
