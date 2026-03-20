import {useNavigate} from 'react-router-dom';
import {AlertTriangle, ChevronLeft, ScrollText, Settings, ShieldCheck, UserX} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {formatDistanceToNow} from 'date-fns';

// Mock audit log — replace with real table once audit_log migration runs
const MOCK_LOGS = [
    {
        id: '1',
        action: 'user_suspended',
        actor: 'admin@fyk.app',
        target_type: 'user',
        target_id: 'usr_001',
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    },
    {
        id: '2',
        action: 'report_resolved',
        actor: 'admin@fyk.app',
        target_type: 'report',
        target_id: 'rpt_042',
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
        id: '3',
        action: 'profile_approved',
        actor: 'mod@fyk.app',
        target_type: 'profile',
        target_id: 'usr_009',
        created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString()
    },
    {
        id: '4',
        action: 'content_removed',
        actor: 'mod@fyk.app',
        target_type: 'photo',
        target_id: 'ph_223',
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
    },
    {
        id: '5',
        action: 'user_warned',
        actor: 'admin@fyk.app',
        target_type: 'user',
        target_id: 'usr_017',
        created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString()
    },
];

const actionIcon: Record<string, React.ReactNode> = {
    user_suspended: <UserX className="w-4 h-4 text-destructive"/>,
    report_resolved: <ShieldCheck className="w-4 h-4 text-emerald-500"/>,
    profile_approved: <ShieldCheck className="w-4 h-4 text-primary"/>,
    content_removed: <AlertTriangle className="w-4 h-4 text-amber-400"/>,
    user_warned: <AlertTriangle className="w-4 h-4 text-amber-400"/>,
};

export default function AdminAudit() {
    const navigate = useNavigate();
    const logs = MOCK_LOGS;

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
                {logs.map((log) => (
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
                ))}
            </div>
        </div>
    );
}

