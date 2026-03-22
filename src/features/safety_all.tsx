import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {Ban, ChevronLeft, UserX} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {useBlocks} from '@/hooks/useBlocks';
import {useQuery} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {EmptyState} from '@/components/ui/EmptyState';

export default function BlockedPage() {
    const navigate = useNavigate();
    const {blocks, unblockUser, isUnblocking} = useBlocks();

    const {data: blockedProfiles = []} = useQuery({
        queryKey: ['blocked-profiles', blocks.map((b) => b.blocked_id)],
        queryFn: async () => {
            if (blocks.length === 0) return [];
            const {data, error} = await supabase
                .from('profiles')
                .select('user_id, display_name, avatar_url')
                .in(
                    'user_id',
                    blocks.map((b) => b.blocked_id)
                );
            if (error) throw error;
            return data;
        },
        enabled: blocks.length > 0,
    });

    return (
        <div className="min-h-screen pb-24">
            <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1 as any)}>
                    <ChevronLeft className="w-5 h-5"/>
                </Button>
                <h1 className="text-lg font-bold flex items-center gap-2">
                    <Ban className="w-5 h-5 text-destructive"/>
                    Blocked Users
                </h1>
            </header>

            <div className="p-4">
                {blockedProfiles.length > 0 ? (
                    <div className="space-y-2">
                        {blockedProfiles.map((profile) => (
                            <motion.div
                                key={profile.user_id}
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50"
                            >
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={profile.avatar_url || ''}/>
                                    <AvatarFallback>{(profile.display_name || 'U')[0]}</AvatarFallback>
                                </Avatar>
                                <span className="flex-1 font-medium">{profile.display_name || 'User'}</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => unblockUser(profile.user_id)}
                                    disabled={isUnblocking}
                                >
                                    Unblock
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={UserX}
                        title="No blocked users"
                        description="Users you block will appear here."
                    />
                )}
            </div>
        </div>
    );
}
import {useNavigate} from 'react-router-dom';
import {ChevronLeft, Flag} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {useQuery} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '@/hooks/useAuth';
import {formatDistanceToNow} from 'date-fns';

export default function ReportsPage() {
    const navigate = useNavigate();
    const {user} = useAuth();

    const {data: reports = [], isLoading} = useQuery({
        queryKey: ['my-reports', user?.id],
        queryFn: async () => {
            if (!user) return [];
            const {data} = await supabase.from('reports').select('*').eq('reporter_id', user.id).order('created_at', {ascending: false});
            return data || [];
        },
        enabled: !!user,
    });

    const statusColors: Record<string, string> = {
        pending: 'text-yellow-500 border-yellow-500/20 bg-yellow-500/10',
        under_review: 'text-blue-500 border-blue-500/20 bg-blue-500/10',
        actioned: 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10',
        dismissed: 'text-muted-foreground border-border/40',
    };

    return (
        <div className="min-h-screen bg-background pb-28">
            <header
                className="sticky top-0 z-40 glass-heavy border-b border-[hsl(var(--glass-border))] px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full"
                        onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5"/></Button>
                <h1 className="text-lg font-bold flex items-center gap-2"><Flag className="w-5 h-5 text-primary"/>My
                    Reports</h1>
            </header>

            <div className="px-4 py-5">
                {isLoading ? (
                    <div className="space-y-3">{[1, 2, 3].map(i => <div key={i}
                                                                        className="h-20 rounded-2xl bg-card animate-pulse"/>)}</div>
                ) : reports.length === 0 ? (
                    <div className="flex flex-col items-center py-20 text-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center"><Flag
                            className="w-8 h-8 text-muted-foreground"/></div>
                        <div><p className="font-semibold">No reports submitted</p><p
                            className="text-sm text-muted-foreground mt-1">You can report users or content from any
                            profile or message.</p></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {reports.map((report: any) => (
                            <div key={report.id} className="p-4 rounded-2xl bg-card border border-border/40 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span
                                        className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(report.created_at), {addSuffix: true})}</span>
                                    <Badge variant="outline"
                                           className={`text-xs ${statusColors[report.status] || ''}`}>{report.status}</Badge>
                                </div>
                                {report.reason_text &&
                                    <p className="text-sm text-muted-foreground">{report.reason_text}</p>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {
    AlertTriangle,
    Ban,
    BookOpen,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Flag,
    HelpCircle,
    Phone,
    Send,
    Shield,
    XCircle,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {useReports} from '@/hooks/useReports';
import {REPORT_REASONS} from '@/lib/constants';
import {cn} from '@/lib/utils';
import {formatDistanceToNow} from 'date-fns';

type View = 'hub' | 'my-reports' | 'report-form';

const STATUS_META: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
    pending: {
        label: 'Under Review',
        icon: Clock,
        className: 'text-[hsl(var(--gold))] bg-[hsl(var(--gold)/0.1)] border-[hsl(var(--gold)/0.2)]'
    },
    reviewed: {label: 'Reviewed', icon: HelpCircle, className: 'text-primary bg-primary/10 border-primary/20'},
    resolved: {
        label: 'Resolved',
        icon: CheckCircle2,
        className: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
    },
    dismissed: {label: 'Dismissed', icon: XCircle, className: 'text-muted-foreground bg-muted/30 border-border'},
};

const SAFETY_TIPS = [
    {icon: '🔒', title: 'Meet in public first', desc: 'Always meet in a public place for initial meetups.'},
    {icon: '📱', title: 'Share your plans', desc: 'Tell a trusted friend where you are going and who you are meeting.'},
    {icon: '🚗', title: 'Own your transport', desc: 'Arrange your own way to and from any meetup.'},
    {icon: '🚨', title: 'Trust your instincts', desc: 'If something feels off, it is always okay to leave.'},
    {icon: '🎉', title: 'At parties', desc: 'Keep your drink with you and look out for your friends.'},
    {icon: '📞', title: 'Emergency ready', desc: 'Keep emergency numbers easily accessible at all times.'},
];

export default function SafetyPage() {
    const navigate = useNavigate();
    const {reports, isLoading, submitReport} = useReports();
    const [view, setView] = useState<View>('hub');
    const [form, setForm] = useState({reason: '', details: ''});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        if (!form.reason) return;
        setIsSubmitting(true);
        try {
            await new Promise<void>((res, rej) =>
                submitReport(
                    {reportedId: 'general', reason: form.reason, details: form.details},
                    {onSuccess: () => res(), onError: (e) => rej(e)}
                )
            );
            setSubmitted(true);
            setTimeout(() => {
                setSubmitted(false);
                setView('my-reports');
            }, 1500);
        } finally {
            setIsSubmitting(false);
        }
    };

    const Header = ({title, back}: { title: string; back: View | 'nav' }) => (
        <header
            className="sticky top-0 z-40 glass-heavy border-b border-[hsl(var(--glass-border))] px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full"
                    onClick={() => back === 'nav' ? navigate(-1 as any) : setView(back)}>
                <ChevronLeft className="w-5 h-5"/>
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2 flex-1">
                <Shield className="w-5 h-5 text-primary"/>
                {title}
            </h1>
        </header>
    );

    /* ── My Reports ── */
    if (view === 'my-reports') return (
        <div className="min-h-screen bg-background pb-24">
            <Header title="My Reports" back="hub"/>
            <div className="p-4 space-y-3">
                {isLoading ? (
                    <div className="flex justify-center py-16">
                        <div
                            className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin"/>
                    </div>
                ) : reports.length > 0 ? (
                    reports.map((report, i) => {
                        const meta = STATUS_META[report.status] || STATUS_META.pending;
                        const Icon = meta.icon;
                        return (
                            <motion.div key={report.id} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                                        transition={{delay: i * 0.04}}
                                        className="p-4  bg-card border border-border/40 space-y-2.5">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-semibold text-sm">{report.reason}</span>
                                    <Badge variant="outline"
                                           className={cn('text-[10px] shrink-0 gap-1', meta.className)}>
                                        <Icon className="w-2.5 h-2.5"/>
                                        {meta.label}
                                    </Badge>
                                </div>
                                {report.details && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{report.details}</p>
                                )}
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3"/>
                                    {formatDistanceToNow(new Date(report.created_at), {addSuffix: true})}
                                </p>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                        <Shield className="w-12 h-12 text-muted-foreground/30"/>
                        <p className="text-muted-foreground">No reports yet.</p>
                    </div>
                )}
            </div>
        </div>
    );

    /* ── Report Form ── */
    if (view === 'report-form') return (
        <div className="min-h-screen bg-background pb-24">
            <Header title="Submit a Report" back="hub"/>
            <div className="p-4 space-y-4">
                <div className="p-4  bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Reports are reviewed by our safety team within 24–48 hours. False reports may result in account
                        action.
                        Thank you for keeping our community safe. 🛡️
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Reason <span className="text-destructive">*</span></Label>
                    <Select value={form.reason} onValueChange={(v) => setForm((p) => ({...p, reason: v}))}>
                        <SelectTrigger className="h-12">
                            <SelectValue placeholder="Select a reason…"/>
                        </SelectTrigger>
                        <SelectContent>
                            {REPORT_REASONS.map((r) => (
                                <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Additional Details <span className="text-muted-foreground">(optional)</span></Label>
                    <Textarea
                        placeholder="Please describe what happened in detail…"
                        value={form.details}
                        onChange={(e) => setForm((p) => ({...p, details: e.target.value}))}
                        rows={5}
                        className="resize-none"
                    />
                </div>

                <AnimatePresence mode="wait">
                    {submitted ? (
                        <motion.div key="done" initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}}
                                    className="flex items-center justify-center gap-3 p-4  bg-emerald-500/10 border border-emerald-500/20">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500"/>
                            <span className="font-semibold text-emerald-500">Report submitted — thank you</span>
                        </motion.div>
                    ) : (
                        <Button key="submit"
                                className="w-full h-12 gradient-primary shadow-[0_4px_16px_hsl(var(--primary)/0.25)]"
                                disabled={!form.reason || isSubmitting} onClick={handleSubmit}>
                            <Send className="w-4 h-4 mr-2"/>
                            {isSubmitting ? 'Submitting…' : 'Submit Report'}
                        </Button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );

    /* ── Hub ── */
    return (
        <div className="min-h-screen bg-background pb-24">
            <Header title="Safety Center" back="nav"/>

            <div className="p-4 space-y-3">
                {/* Quick actions */}
                {[
                    {
                        icon: Ban,
                        label: 'Blocked Users',
                        desc: 'Manage your block list',
                        action: () => navigate('/app/blocked')
                    },
                    {
                        icon: Flag,
                        label: 'My Reports',
                        desc: `${reports.length} report${reports.length !== 1 ? 's' : ''} submitted`,
                        action: () => setView('my-reports')
                    },
                    {
                        icon: AlertTriangle,
                        label: 'Report a Problem',
                        desc: 'Harassment, fake profile, spam…',
                        action: () => setView('report-form')
                    },
                    {
                        icon: BookOpen,
                        label: 'Community Guidelines',
                        desc: 'Review our community standards',
                        action: () => navigate('/terms')
                    },
                ].map(({icon: Icon, label, desc, action}) => (
                    <button key={label} onClick={action}
                            className="w-full flex items-center gap-4 p-4  bg-card border border-border/40 hover:border-primary/30 hover:shadow-[0_0_16px_hsl(var(--primary)/0.07)] transition-all duration-200 text-left">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{desc}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0"/>
                    </button>
                ))}

                {/* Safety Tips */}
                <div className="pt-2">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
                        Safety Tips
                    </h2>
                    <div className="grid grid-cols-1 gap-2.5">
                        {SAFETY_TIPS.map((tip) => (
                            <div key={tip.title}
                                 className="flex items-start gap-3 p-3.5  bg-card border border-border/40">
                                <span className="text-2xl shrink-0 mt-0.5">{tip.icon}</span>
                                <div>
                                    <p className="font-semibold text-sm">{tip.title}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Emergency */}
                <div className="p-4  border border-destructive/30 bg-destructive/5 space-y-3 mt-2">
                    <h3 className="font-bold text-destructive flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4"/>
                        Emergency
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        If you are in immediate danger, call your local emergency services immediately.
                    </p>
                    <Button variant="destructive" className="w-full h-12">
                        <Phone className="w-4 h-4 mr-2"/>
                        Emergency Help
                    </Button>
                </div>
            </div>
        </div>
    );
}
