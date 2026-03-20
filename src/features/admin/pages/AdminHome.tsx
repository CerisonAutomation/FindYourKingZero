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
