import {useNavigate} from 'react-router-dom';
import {AlertTriangle, ChevronLeft, ScrollText, Settings, ShieldCheck, UserX} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {formatDistanceToNow} from 'date-fns';
import {useEffect, useState} from 'react';

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

