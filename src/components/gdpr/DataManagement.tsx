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
                    <a href="mailto:privacy@findyourking.com" className="text-primary hover:underline">
                        privacy@findyourking.com
                    </a>
                </p>
            </div>
        </div>
    );
};
