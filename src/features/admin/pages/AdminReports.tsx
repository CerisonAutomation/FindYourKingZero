import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {CheckCircle, ChevronLeft, Clock, ExternalLink, Flag, XCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {useState, useEffect} from 'react';

export default function AdminReports() {
    const navigate = useNavigate();
    const [reports, setReports] = useState<any[]>([]);
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