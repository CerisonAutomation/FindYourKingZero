import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {Clock, Map, MapPin, MessageCircle, Radio, RefreshCw, Share2, Shield, X, Zap,} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {
    MEET_NOW_STATUSES,
    useMeetNowUsers,
    useMyMeetNowStatus,
    useShareLocation,
    useStopSharing
} from '@/hooks/useMeetNow';
import {cn} from '@/lib/utils';

const getRemaining = (exp: string): string => {
    const diff = new Date(exp).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const m = Math.floor(diff / 60000);
    return m < 60 ? `${m}m left` : `${Math.floor(m / 60)}h ${m % 60}m left`;
};
const fmtDist = (km?: number) => {
    if (km === undefined) return '';
    if (km < 0.1) return '<100m';
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
};

const STATUS_PILL: Record<string, { bg: string; text: string }> = {
    available: {bg: 'bg-emerald-500/15', text: 'text-emerald-400'},
    hosting: {bg: 'bg-primary/15', text: 'text-primary'},
    traveling: {bg: 'bg-blue-500/15', text: 'text-blue-400'},
    curious: {bg: 'bg-[hsl(var(--gold)/0.15)]', text: 'text-[hsl(var(--gold))]'},
};

export default function RightNowFeed() {
    const navigate = useNavigate();
    const [loc, setLoc] = useState<{ lat: number; lng: number } | undefined>();
    const [locErr, setLocErr] = useState(false);
    const [status, setStatus] = useState('available');
    const [duration, setDuration] = useState(1);

    useEffect(() => {
        navigator.geolocation?.getCurrentPosition(
            (p) => setLoc({lat: p.coords.latitude, lng: p.coords.longitude}),
            () => setLocErr(true),
            {enableHighAccuracy: true, timeout: 10000},
        );
    }, []);

    const {data: users = [], isLoading, refetch, isFetching} = useMeetNowUsers(loc);
    const {data: myStatus} = useMyMeetNowStatus();
    const share = useShareLocation();
    const stop = useStopSharing();

    const isLive = !!myStatus;
    const statusInfo = MEET_NOW_STATUSES.find(s => s.id === status);

    const goLive = () => {
        if (!loc) return;
        share.mutate({latitude: loc.lat, longitude: loc.lng, status, durationHours: duration});
    };

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">

            {/* ─ Header ─ */}
            <header className="flex-shrink-0 glass-nav border-b border-white/[0.04] z-40">
                <div className="px-4 pt-4 pb-3 space-y-3">

                    {/* Title row */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <div className="relative">
                                    <Radio className="w-5 h-5 text-primary"/>
                                    {isLive && <span
                                        className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-background animate-pulse"/>}
                                </div>
                                <h1 className="text-[22px] font-black tracking-tight">Right Now</h1>
                                {isLive && (
                                    <motion.span
                                        initial={{scale: 0}} animate={{scale: 1}}
                                        className="px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] font-black uppercase tracking-wider"
                                    >
                                        LIVE
                                    </motion.span>
                                )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                                <span className="font-black text-foreground">{users.length}</span> visible nearby
                            </p>
                        </div>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => refetch()}
                                className={cn('w-9 h-9 rounded-full bg-secondary/60 flex items-center justify-center transition-all active:scale-90', isFetching && 'animate-spin')}>
                                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground"/>
                            </button>
                            <button
                                onClick={() => navigate('/app/right-now/map')}
                                className="w-9 h-9 rounded-full bg-primary/12 border border-primary/25 flex items-center justify-center active:scale-90 transition-all">
                                <Map className="w-3.5 h-3.5 text-primary"/>
                            </button>
                        </div>
                    </div>

                    {/* My status panel */}
                    <AnimatePresence mode="wait">
                        {isLive ? (
                            /* Live indicator */
                            <motion.div
                                key="live"
                                initial={{opacity: 0, scale: 0.97}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0}}
                                className="relative flex items-center justify-between p-3.5  overflow-hidden"
                                style={{
                                    background: 'hsl(155 65% 42% / 0.08)',
                                    border: '1px solid hsl(155 65% 42% / 0.2)'
                                }}
                            >
                                <div className="absolute inset-0 opacity-[0.03]"
                                     style={{
                                         backgroundImage: 'repeating-linear-gradient(45deg, hsl(155,65%,42%) 0, hsl(155,65%,42%) 1px, transparent 0, transparent 50%)',
                                         backgroundSize: '6px 6px'
                                     }}/>
                                <div className="flex items-center gap-3 relative">
                                    <div
                                        className="relative w-9 h-9 rounded-full flex items-center justify-center bg-emerald-500/15">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"/>
                                        <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"/>
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-bold text-emerald-400">You're Live</p>
                                        <p className="text-[11px] text-muted-foreground">{getRemaining(myStatus!.expires_at)}</p>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8  border-destructive/30 text-destructive hover:bg-destructive/10 text-[11px] font-bold"
                                    onClick={() => stop.mutate()}
                                    disabled={stop.isPending}
                                >
                                    <X className="w-3 h-3 mr-1"/> Go Dark
                                </Button>
                            </motion.div>
                        ) : (
                            /* Share panel */
                            <motion.div
                                key="idle"
                                initial={{opacity: 0, scale: 0.97}} animate={{opacity: 1, scale: 1}} exit={{opacity: 0}}
                                className="p-4  bg-secondary/20 border border-border/20 space-y-3"
                            >
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.12em]">I'm
                                    available for…</p>

                                {/* Status selector */}
                                <div className="grid grid-cols-4 gap-1.5">
                                    {MEET_NOW_STATUSES.map((s) => {
                                        const active = status === s.id;
                                        return (
                                            <button key={s.id} onClick={() => setStatus(s.id)}
                                                    className={cn(
                                                        'flex flex-col items-center gap-1 py-2.5 px-1  border transition-all duration-150',
                                                        active
                                                            ? 'border-primary bg-primary/10 shadow-[0_0_12px_hsl(var(--primary)/0.2)]'
                                                            : 'border-border/25 bg-transparent hover:border-primary/25',
                                                    )}>
                                                <span className="text-lg leading-none">{s.icon}</span>
                                                <span
                                                    className="text-[8px] font-bold leading-none text-center text-muted-foreground">{s.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Duration */}
                                <div className="flex items-center gap-2.5">
                                    <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0"/>
                                    <p className="text-[12px] text-muted-foreground flex-1">Duration</p>
                                    <div className="flex gap-1">
                                        {[1, 2, 4, 8].map((h) => (
                                            <button key={h} onClick={() => setDuration(h)}
                                                    className={cn(
                                                        'px-2.5 py-1    text-[11px] font-bold border transition-all',
                                                        duration === h
                                                            ? 'bg-primary/12 border-primary text-primary'
                                                            : 'border-border/25 text-muted-foreground hover:border-primary/25',
                                                    )}>
                                                {h}h
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Go live button */}
                                <button
                                    onClick={goLive}
                                    disabled={!loc || share.isPending}
                                    className="w-full h-11  gradient-primary shadow-[0_4px_18px_hsl(var(--primary)/0.32)] flex items-center justify-center gap-2 font-bold text-primary-foreground text-[13px] transition-all active:scale-[0.98] disabled:opacity-50"
                                >
                                    <Share2 className="w-4 h-4"/>
                                    {locErr ? 'Location denied' : !loc ? 'Getting location…' : share.isPending ? 'Going live…' : `Go Live · ${duration}h`}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </header>

            {/* ─ Feed ─ */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-3 pt-3 pb-6 space-y-1.5">

                    {isLoading ? (
                        Array.from({length: 5}).map((_, i) => (
                            <div key={i} className="flex items-center gap-3.5 p-4  bg-secondary/20 animate-pulse">
                                <div className="w-14 h-14 rounded-full bg-secondary shrink-0"/>
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 bg-secondary rounded-full w-28"/>
                                    <div className="h-3 bg-secondary/70 rounded-full w-40"/>
                                </div>
                            </div>
                        ))
                    ) : users.length > 0 ? (
                        <AnimatePresence>
                            {users.map((u, i) => {
                                const info = MEET_NOW_STATUSES.find(s => s.id === u.status);
                                const pill = STATUS_PILL[u.status] || STATUS_PILL.available;
                                const statusBg = u.status === 'available' ? 'hsl(152,65%,42%)' : u.status === 'hosting' ? 'hsl(var(--primary))' : u.status === 'traveling' ? 'hsl(218,80%,55%)' : 'hsl(var(--gold))';
                                return (
                                    <motion.div
                                        key={u.id}
                                        initial={{opacity: 0, y: 10}}
                                        animate={{opacity: 1, y: 0}}
                                        exit={{opacity: 0, x: -12, scale: 0.96}}
                                        transition={{delay: i * 0.035}}
                                        className="flex items-center gap-3 py-3 border-b border-border/10 last:border-0 active:opacity-70 transition-opacity cursor-pointer"
                                        onClick={() => navigate(`/app/profile/${u.user_id}`)}
                                    >
                                        {/* Avatar — square, no generic card */}
                                        <div className="relative shrink-0">
                                            <Avatar className="w-12 h-12 border border-border/20"
                                                    style={{borderRadius: '7px'}}>
                                                <AvatarImage src={u.profile?.avatar_url || ''}
                                                             style={{borderRadius: '6px'}}/>
                                                <AvatarFallback
                                                    className="text-[14px] font-black bg-secondary"
                                                    style={{borderRadius: '6px'}}
                                                >
                                                    {(u.profile?.display_name || 'U')[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div
                                                className="absolute -bottom-0.5 -right-0.5 border-2 border-background"
                                                style={{
                                                    width: 10,
                                                    height: 10,
                                                    borderRadius: '3px',
                                                    background: statusBg
                                                }}
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-black text-[12.5px] truncate">
                          {u.profile?.display_name || 'User'}
                            {u.profile?.age &&
                                <span className="font-normal text-muted-foreground">, {u.profile.age}</span>}
                        </span>
                                                <span
                                                    className={cn('text-[8px] font-black uppercase tracking-wide shrink-0', pill.bg, pill.text)}
                                                    style={{borderRadius: '3px', padding: '1px 4px'}}>
                          {info?.label || u.status}
                        </span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                {u.distance !== undefined && (
                                                    <span
                                                        className="flex items-center gap-0.5 text-[10.5px] text-muted-foreground">
                            <MapPin className="w-2 h-2"/>{fmtDist(u.distance)}
                          </span>
                                                )}
                                                <span
                                                    className="flex items-center gap-0.5 text-[10.5px] text-muted-foreground">
                          <Clock className="w-2 h-2"/>{getRemaining(u.expires_at)}
                        </span>
                                            </div>
                                            {u.message && (
                                                <p className="text-[10.5px] text-muted-foreground mt-0.5 italic line-clamp-1">"{u.message}"</p>
                                            )}
                                        </div>

                                        {/* Action */}
                                        <button
                                            onClick={e => {
                                                e.stopPropagation();
                                                navigate(`/app/profile/${u.user_id}`);
                                            }}
                                            className="w-7 h-7 flex items-center justify-center active:scale-90 transition-all shrink-0"
                                            style={{
                                                borderRadius: '6px',
                                                background: 'hsl(var(--primary)/0.1)',
                                                border: '1px solid hsl(var(--primary)/0.2)'
                                            }}
                                            aria-label="Message"
                                        >
                                            <MessageCircle className="w-3 h-3 text-primary"/>
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    ) : (
                        /* Empty state */
                        <motion.div
                            initial={{opacity: 0, scale: 0.94}}
                            animate={{opacity: 1, scale: 1}}
                            className="flex flex-col items-center justify-center py-20 text-center gap-5"
                        >
                            {/* Radar animation */}
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping"
                                     style={{animationDuration: '2s'}}/>
                                <div className="absolute inset-3 rounded-full bg-primary/8 animate-ping"
                                     style={{animationDuration: '2s', animationDelay: '0.4s'}}/>
                                <div className="absolute inset-6 rounded-full bg-primary/10 animate-ping"
                                     style={{animationDuration: '2s', animationDelay: '0.8s'}}/>
                                <div className="absolute inset-0 rounded-full flex items-center justify-center">
                                    <Radio className="w-9 h-9 text-muted-foreground/40"/>
                                </div>
                            </div>
                            <div>
                                <p className="font-black text-[16px]">Nobody nearby right now</p>
                                <p className="text-[13px] text-muted-foreground mt-1.5 leading-relaxed">
                                    Be the first to go live.<br/>Others will see you on the radar.
                                </p>
                            </div>
                            {!isLive && loc && (
                                <button
                                    onClick={goLive}
                                    disabled={share.isPending}
                                    className="px-7 py-3  gradient-primary shadow-[0_4px_20px_hsl(var(--primary)/0.35)] font-bold text-primary-foreground text-[13px] active:scale-95 transition-all"
                                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 fill-white"/> Go Live Now
                  </span>
                                </button>
                            )}

                            {/* Safety note */}
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mt-2">
                                <Shield className="w-3.5 h-3.5"/>
                                <span>Only approximate location is shared</span>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
