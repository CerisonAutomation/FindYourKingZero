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
