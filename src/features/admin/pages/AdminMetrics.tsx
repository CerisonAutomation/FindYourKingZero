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
