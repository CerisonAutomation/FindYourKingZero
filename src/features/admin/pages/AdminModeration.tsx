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
