import {useNavigate} from 'react-router-dom';
import {AlertTriangle, ChevronLeft, ScrollText, Settings, ShieldCheck, UserX} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {formatDistanceToNow} from 'date-fns';
import {useState, useEffect} from 'react';

const actionIcon: Record<string, React.ReactNode> = {
    user_suspended: <UserX className="w-4 h-4 text-destructive"/>,
    report_resolved: <ShieldCheck className="w-4 h-4 text-emerald-500"/>,
    profile_approved: <ShieldCheck className="w-4 h-4 text-primary"/>,
    content_removed: <AlertTriangle className="w-4 h-4 text-amber-400"/>,
    user_warned: <AlertTriangle className="w-4 h-4 text-amber-400"/>,
};

interface AuditLog {
    id: string;
    action: string;
    actor: string;
    target_type: string;
    created_at: string;
}

export default function AdminAudit() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuditLogs = async () => {
            try {
                // TODO: Implement proper audit logs query when table structure is finalized
                // For now, return empty array
                setLogs([]);
            } catch (error) {
                console.error('Error fetching audit logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAuditLogs();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pb-28 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-28">
            <header
                className="sticky top-0 z-40 bg-card/90 backdrop-blur-2xl border-b border-border/50 px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full"
                        onClick={() => navigate('/app/admin')}>
                    <ChevronLeft className="w-4 h-4"/>
                </Button>
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ScrollText className="w-4 h-4 text-primary"/>
                </div>
                <h1 className="text-base font-bold">Audit Log</h1>
            </header>

            <div className="px-4 py-4 space-y-2 max-w-lg mx-auto">
                {logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <ScrollText className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                        <p>No audit logs found</p>
                    </div>
                ) : (
                    logs.map((log: any) => (
                    <div key={log.id}
                         className="p-3.5 rounded-2xl bg-card border border-border/30 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                            {actionIcon[log.action] ?? <Settings className="w-4 h-4 text-muted-foreground"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate capitalize">{log.action.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-muted-foreground">{log.actor} · {log.target_type}</p>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                            {formatDistanceToNow(new Date(log.created_at), {addSuffix: true})}
                        </span>
                    </div>
                ))
                )}
            </div>
        </div>
    );
}

import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {
    AlertTriangle,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    Eye,
    Flag,
    LayoutDashboard,
    MessageSquare,
    Shield,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {cn} from '@/lib/utils';

const STATS = [
    {label: 'Total Users', value: '12,847', trend: '+3.2%', icon: Users, color: 'text-primary'},
    {label: 'Active Today', value: '2,341', trend: '+8.1%', icon: TrendingUp, color: 'text-emerald-500'},
    {label: 'Reports Open', value: '3', trend: '-1', icon: Flag, color: 'text-[hsl(var(--gold))]'},
    {label: 'Messages Sent', value: '48.2K', trend: '+12%', icon: MessageSquare, color: 'text-primary'},
];

const MOCK_REPORTS = [
    {id: '1', reporter: 'User #1291', target: 'User #4472', reason: 'Harassment', status: 'pending', age: '2h ago'},
    {id: '2', reporter: 'User #8831', target: 'User #1102', reason: 'Fake profile', status: 'pending', age: '4h ago'},
    {id: '3', reporter: 'User #2210', target: 'User #9934', reason: 'Spam', status: 'reviewed', age: '1d ago'},
];

type View = 'home' | 'reports' | 'metrics';

export default function AdminHome() {
    const navigate = useNavigate();
    const [view, setView] = useState<View>('home');

    const Header = ({title}: { title: string }) => (
        <header
            className="sticky top-0 z-40 glass-heavy border-b border-[hsl(var(--glass-border))] px-4 py-3 flex items-center gap-3">
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full"
                    onClick={() => view !== 'home' ? setView('home') : navigate('/app/grid')}>
                <ChevronLeft className="w-5 h-5"/>
            </Button>
            <h1 className="text-lg font-bold flex items-center gap-2 flex-1">
                <LayoutDashboard className="w-5 h-5 text-primary"/>
                {title}
            </h1>
            <Badge variant="destructive" className="text-[10px]">Admin</Badge>
        </header>
    );

    if (view === 'reports') return (
        <div className="min-h-screen bg-background pb-24">
            <Header title="Reports Queue"/>
            <div className="p-4 space-y-3">
                <div className="p-3  bg-[hsl(var(--gold)/0.1)] border border-[hsl(var(--gold)/0.2)]">
                    <p className="text-xs font-semibold text-[hsl(var(--gold))]">
                        {MOCK_REPORTS.filter((r) => r.status === 'pending').length} reports pending review
                    </p>
                </div>
                {MOCK_REPORTS.map((report, i) => (
                    <motion.div key={report.id} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                                transition={{delay: i * 0.05}}
                                className="p-4  bg-card border border-border/40 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="font-semibold text-sm">{report.reason}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {report.reporter} → {report.target} · {report.age}
                                </p>
                            </div>
                            <Badge variant="outline" className={cn(
                                'text-[10px] shrink-0',
                                report.status === 'pending' ? 'text-[hsl(var(--gold))] border-[hsl(var(--gold)/0.3)]' : 'text-muted-foreground'
                            )}>
                                {report.status}
                            </Badge>
                        </div>
                        {report.status === 'pending' && (
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline"
                                        className="flex-1 h-9 text-destructive border-destructive/30 hover:bg-destructive/10">
                                    <X className="w-3.5 h-3.5 mr-1.5"/> Dismiss
                                </Button>
                                <Button size="sm" className="flex-1 h-9 gradient-primary">
                                    <Eye className="w-3.5 h-3.5 mr-1.5"/> Review
                                </Button>
                                <Button size="sm" variant="destructive" className="flex-1 h-9">
                                    <Shield className="w-3.5 h-3.5 mr-1.5"/> Action
                                </Button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );

    if (view === 'metrics') return (
        <div className="min-h-screen bg-background pb-24">
            <Header title="Metrics"/>
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    {STATS.map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div key={stat.label} initial={{opacity: 0, scale: 0.9}}
                                        animate={{opacity: 1, scale: 1}}
                                        transition={{delay: i * 0.05}}
                                        className="p-4  bg-card border border-border/40 space-y-2">
                                <div className="flex items-center justify-between">
                                    <Icon className={cn('w-5 h-5', stat.color)}/>
                                    <span className="text-xs text-emerald-500 font-semibold">{stat.trend}</span>
                                </div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="p-4  bg-card border border-border/40">
                    <h3 className="font-semibold mb-3 text-sm">User Growth (30d)</h3>
                    <div className="flex items-end gap-1 h-24">
                        {[40, 55, 48, 70, 65, 80, 75, 90, 88, 95, 85, 100].map((h, i) => (
                            <motion.div
                                key={i}
                                initial={{height: 0}}
                                animate={{height: `${h}%`}}
                                transition={{delay: i * 0.05, duration: 0.5, ease: 'easeOut'}}
                                className="flex-1 rounded-t-sm gradient-primary opacity-80"
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pb-24">
            <Header title="Admin Panel"/>
            <div className="p-4 space-y-3">
                <div className="p-4  bg-destructive/8 border border-destructive/20 flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5"/>
                    <p className="text-sm text-destructive">
                        You have elevated permissions. All actions are logged in the audit trail.
                    </p>
                </div>

                {/* Stats preview */}
                <div className="grid grid-cols-2 gap-2.5">
                    {STATS.slice(0, 4).map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label}
                                 className="p-3  bg-card border border-border/40 flex items-center gap-2.5">
                                <Icon className={cn('w-4 h-4 shrink-0', stat.color)}/>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm">{stat.value}</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{stat.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {[
                    {
                        id: 'reports',
                        icon: Flag,
                        label: 'Reports Queue',
                        desc: 'Review user-submitted reports',
                        badge: '3',
                        action: () => setView('reports')
                    },
                    {
                        id: 'moderate',
                        icon: Shield,
                        label: 'Moderation',
                        desc: 'Warn, suspend or ban accounts',
                        badge: undefined,
                        action: () => {
                        }
                    },
                    {
                        id: 'audit',
                        icon: ClipboardList,
                        label: 'Audit Log',
                        desc: 'Full action history and timeline',
                        badge: undefined,
                        action: () => {
                        }
                    },
                    {
                        id: 'metrics',
                        icon: BarChart3,
                        label: 'Metrics',
                        desc: 'App-wide analytics dashboard',
                        badge: undefined,
                        action: () => setView('metrics')
                    },
                ].map((mod) => (
                    <button key={mod.id} onClick={mod.action}
                            className="w-full flex items-center gap-4 p-4  bg-card border border-border/40 hover:border-primary/30 transition-all text-left">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <mod.icon className="w-5 h-5 text-primary"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{mod.label}</p>
                            <p className="text-xs text-muted-foreground">{mod.desc}</p>
                        </div>
                        {mod.badge && <Badge variant="destructive" className="mr-1 text-[10px]">{mod.badge}</Badge>}
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0"/>
                    </button>
                ))}
            </div>
        </div>
    );
}
import {useNavigate} from 'react-router-dom';
import {BarChart3, CalendarDays, ChevronLeft, MessageCircle, Shield, Users} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useQuery} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';

export default function AdminMetrics() {
    const navigate = useNavigate();
    const {data: metrics} = useQuery({
        queryKey: ['admin-metrics'],
        queryFn: async () => {
            const [profiles, messages, events, reports] = await Promise.all([
                supabase.from('profiles').select('id', {count: 'exact', head: true}),
                supabase.from('messages').select('id', {count: 'exact', head: true}),
                supabase.from('events').select('id', {count: 'exact', head: true}),
                supabase.from('reports').select('id', {count: 'exact', head: true}).eq('status', 'pending'),
            ]);
            return {
                profiles: profiles.count || 0,
                messages: messages.count || 0,
                events: events.count || 0,
                pendingReports: reports.count || 0
            };
        },
    });

    const stats = [
        {label: 'Total Users', value: metrics?.profiles ?? '—', icon: Users, color: 'text-primary'},
        {label: 'Messages Sent', value: metrics?.messages ?? '—', icon: MessageCircle, color: 'text-accent'},
        {label: 'Events Created', value: metrics?.events ?? '—', icon: CalendarDays, color: 'text-emerald-500'},
        {label: 'Pending Reports', value: metrics?.pendingReports ?? '—', icon: Shield, color: 'text-destructive'},
    ];

    return (
        <div className="min-h-screen bg-background pb-28">
            <header
                className="sticky top-0 z-40 glass-heavy border-b border-[hsl(var(--glass-border))] px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full"
                        onClick={() => navigate('/app/admin')}><ChevronLeft className="w-5 h-5"/></Button>
                <h1 className="text-lg font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary"/>Platform
                    Metrics</h1>
            </header>
            <div className="px-4 py-5">
                <div className="grid grid-cols-2 gap-3">
                    {stats.map(({label, value, icon: Icon, color}) => (
                        <div key={label} className="p-5 rounded-2xl bg-card border border-border/40 space-y-3">
                            <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center`}><Icon
                                className={`w-5 h-5 ${color}`}/></div>
                            <div><p className="text-2xl font-bold">{value}</p><p
                                className="text-xs text-muted-foreground mt-0.5">{label}</p></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
import {useNavigate} from 'react-router-dom';
import {ChevronLeft, Shield} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {useQuery} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';

export default function AdminModeration() {
    const navigate = useNavigate();
    const {data: reports = []} = useQuery({
        queryKey: ['admin-reports-pending'],
        queryFn: async () => {
            const {data} = await supabase.from('reports').select('*').eq('status', 'pending').order('created_at', {ascending: false}).limit(50);
            return data || [];
        },
    });

    return (
        <div className="min-h-screen bg-background pb-28">
            <header
                className="sticky top-0 z-40 glass-heavy border-b border-[hsl(var(--glass-border))] px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full"
                        onClick={() => navigate('/app/admin')}><ChevronLeft className="w-5 h-5"/></Button>
                <h1 className="text-lg font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-primary"/>Moderation
                    Queue</h1>
                {reports.length > 0 &&
                    <Badge className="ml-auto gradient-primary text-primary-foreground">{reports.length}</Badge>}
            </header>
            <div className="px-4 py-5 space-y-3">
                {reports.length === 0 ? (
                    <div className="flex flex-col items-center py-20 gap-4 text-center">
                        <div className="w-16 h-16  bg-secondary flex items-center justify-center"><Shield
                            className="w-8 h-8 text-muted-foreground"/></div>
                        <p className="font-semibold">Queue is clear</p>
                        <p className="text-sm text-muted-foreground">No pending reports.</p>
                    </div>
                ) : reports.map((r: any) => (
                    <div key={r.id} className="p-4  bg-card border border-border/40 space-y-3">
                        <div className="flex items-center justify-between">
                            <Badge variant="outline"
                                   className="text-xs text-yellow-500 border-yellow-500/20 bg-yellow-500/10">Pending</Badge>
                            <span
                                className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                        {r.reason_text && <p className="text-sm text-muted-foreground">{r.reason_text}</p>}
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1 h-9 text-xs">Dismiss</Button>
                            <Button size="sm" variant="outline"
                                    className="flex-1 h-9 text-xs text-destructive border-destructive/30">Action</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {CheckCircle, ChevronLeft, Clock, ExternalLink, Flag, XCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {useState, useEffect} from 'react';

interface Report {
    id: string;
    reason: string;
    status: 'pending' | 'resolved' | 'dismissed';
    reporter_id: string;
    reported: string;
    time: string;
}

export default function AdminReports() {
    const navigate = useNavigate();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                // TODO: Create reports table in database
                // For now, return empty array
                setReports([]);
            } catch (error) {
                console.error('Error fetching reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pb-28 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-28">
            <header
                className="sticky top-0 z-40 bg-card/90 backdrop-blur-2xl border-b border-border/50 px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full"
                        onClick={() => navigate('/app/admin')}>
                    <ChevronLeft className="w-4 h-4"/>
                </Button>
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Flag className="w-4 h-4 text-primary"/>
                </div>
                <h1 className="text-base font-bold">Reports</h1>
            </header>

            <div className="px-4 py-4 space-y-2 max-w-lg mx-auto">
                {reports.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Flag className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                        <p>No reports found</p>
                    </div>
                ) : (
                    reports.map((r, i) => (
                        <motion.div
                            key={r.id}
                            initial={{opacity: 0, y: 10}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: i * 0.05}}
                            className="p-4 rounded-2xl bg-card border border-border/50 space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium">{r.reason}</span>
                                <Badge variant={r.status === 'pending' ? 'destructive' : 'secondary'} className="text-xs">
                                    {r.status}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                                <span>Reporter: <strong className="text-foreground">{r.reporter_id}</strong></span>
                                <span>Reported: <strong className="text-foreground">{r.reported}</strong></span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3"/> {r.time}
                            </div>
                            {r.status === 'pending' && (
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline"
                                            className="flex-1 border-[hsl(var(--primary)/0.4)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.1)]">
                                        <CheckCircle className="w-4 h-4 mr-1"/> Resolve
                                    </Button>
                                    <Button size="sm" variant="outline"
                                            className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10">
                                        <XCircle className="w-4 h-4 mr-1"/> Dismiss
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1">
                                        <ExternalLink className="w-4 h-4 mr-1"/> View
                                    </Button>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}