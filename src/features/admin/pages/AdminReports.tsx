import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {CheckCircle, ChevronLeft, Clock, ExternalLink, Flag, XCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';

// Mock admin data for prototype
const MOCK_REPORTS = [
    {id: '1', reporter: 'User A', reported: 'User B', reason: 'Harassment', status: 'pending', time: '2h ago'},
    {id: '2', reporter: 'User C', reported: 'User D', reason: 'Fake profile', status: 'pending', time: '5h ago'},
    {
        id: '3',
        reporter: 'User E',
        reported: 'User F',
        reason: 'Inappropriate content',
        status: 'reviewed',
        time: '1d ago'
    },
];

export default function AdminReports() {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen pb-24">
            <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/app/admin')}>
                    <ChevronLeft className="w-5 h-5"/>
                </Button>
                <h1 className="text-lg font-bold flex items-center gap-2">
                    <Flag className="w-5 h-5 text-primary"/>
                    Reports Queue
                </h1>
                <Badge variant="destructive" className="ml-auto">
                    {MOCK_REPORTS.filter(r => r.status === 'pending').length} pending
                </Badge>
            </header>

            <div className="p-4 space-y-3">
                {MOCK_REPORTS.map((r, i) => (
                    <motion.div key={r.id} initial={{opacity: 0, y: 10}} animate={{opacity: 1, y: 0}}
                                transition={{delay: i * 0.05}}
                                className="p-4 rounded-2xl bg-card border border-border/50 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{r.reason}</span>
                            <Badge variant={r.status === 'pending' ? 'destructive' : 'secondary'} className="text-xs">
                                {r.status}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <span>Reporter: <strong className="text-foreground">{r.reporter}</strong></span>
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
                ))}
            </div>
        </div>
    );
}
