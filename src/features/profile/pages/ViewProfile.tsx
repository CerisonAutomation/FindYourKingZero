import {useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {
    Activity,
    BadgeCheck,
    ChevronDown,
    ChevronLeft,
    Crown,
    Eye,
    Flag,
    Globe,
    Heart,
    Lock,
    MapPin,
    MessageCircle,
    MoreVertical,
    Ruler,
    Share2,
    Shield,
    UserCircle,
    Users,
    Weight,
    Zap,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Skeleton} from '@/components/ui/skeleton';
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,} from '@/components/ui/dropdown-menu';
import {useProfileById} from '@/hooks/useProfile';
import {useFavorites} from '@/hooks/useFavorites';
import {useCreateConversation} from '@/hooks/useConversations';
import {useBlocks} from '@/hooks/useBlocks';
import {useReports} from '@/hooks/useReports';
import {useLocaleStore} from '@/stores/useLocaleStore';
import {cn} from '@/lib/utils';

const HEALTH_ITEMS = [
    {key: 'hiv_status', label: 'HIV Status'},
    {key: 'last_tested', label: 'Last Tested'},
    {key: 'on_prep', label: 'On PrEP', boolean: true},
    {key: 'vaccinated', label: 'Vaccinated', boolean: true},
];

// Stats with Lucide icons — no emoji
const STAT_ICONS: Record<string, React.FC<any>> = {
    height: Ruler,
    weight: Weight,
    body_type: Activity,
    relationship_status: Users,
    position: UserCircle,
    ethnicity: Globe,
};

function AccordionSection({
                              title, open, onToggle, children,
                          }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
    return (
        <div className="border-t border-border/15">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-4 text-left active:opacity-70 transition-opacity"
            >
                <span className="eyebrow">{title}</span>
                <motion.div animate={{rotate: open ? 180 : 0}} transition={{duration: 0.18}}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground/60"/>
                </motion.div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{height: 0, opacity: 0}}
                        animate={{height: 'auto', opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        transition={{duration: 0.22, ease: [0.16, 1, 0.3, 1]}}
                        className="overflow-hidden"
                    >
                        <div className="pb-5">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ViewProfile() {
    const {userId} = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const {data: profile, isLoading} = useProfileById(userId);
    const {isFavorite, toggleFavorite} = useFavorites();
    const createConversation = useCreateConversation();
    const {blockUser} = useBlocks();
    const {submitReport} = useReports();
    const {t} = useLocaleStore();

    const [imgLoaded, setImgLoaded] = useState(false);
    const [healthOpen, setHealthOpen] = useState(false);
    const [albumOpen, setAlbumOpen] = useState(false);
    const [tribesOpen, setTribesOpen] = useState(true);
    const [statsOpen, setStatsOpen] = useState(true);

    const handleMessage = async () => {
        if (!userId) return;
        try {
            const cid = await createConversation.mutateAsync(userId);
            navigate(`/app/chat/${cid}`);
        } catch {
            navigate('/app/messages');
        }
    };

    // ── Loading ───────────────────────────────────────────────
    if (isLoading) return (
        <div className="h-full bg-background overflow-y-auto">
            <div className="relative" style={{aspectRatio: '4/5', maxHeight: '65vh'}}>
                <div className="absolute inset-0 bg-secondary animate-shimmer"/>
            </div>
            <div className="px-4 pt-4 space-y-3">
                <Skeleton className="h-7 w-48 rounded-lg"/>
                <Skeleton className="h-4 w-28 rounded-lg"/>
                <Skeleton className="h-28 w-full rounded-xl"/>
            </div>
        </div>
    );

    if (!profile) return (
        <div className="h-full flex flex-col items-center justify-center gap-4 bg-background">
            <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center">
                <Eye className="w-8 h-8 text-muted-foreground"/>
            </div>
            <p className="font-bold text-base">Profile not found</p>
            <Button variant="outline" onClick={() => navigate(-1 as any)} className="rounded-xl">
                <ChevronLeft className="w-4 h-4 mr-2"/> Go Back
            </Button>
        </div>
    );

    const favorited = isFavorite(profile.user_id);

    const statsData = [
        {key: 'height', label: 'Height', value: (profile as any).height ? `${(profile as any).height} cm` : null},
        {key: 'weight', label: 'Weight', value: (profile as any).weight ? `${(profile as any).weight} kg` : null},
        {key: 'body_type', label: 'Body', value: (profile as any).body_type},
        {key: 'relationship_status', label: 'Status', value: (profile as any).relationship_status},
        {key: 'position', label: 'Position', value: (profile as any).position},
        {key: 'ethnicity', label: 'Ethnicity', value: (profile as any).ethnicity},
    ].filter(s => s.value);

    const hasHealthInfo = HEALTH_ITEMS.some(
        h => (profile as any)[h.key] !== undefined && (profile as any)[h.key] !== null && (profile as any)[h.key] !== ''
    );

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">
            <div className="flex-1 overflow-y-auto scrollbar-hide">

                {/* ─── Full-bleed hero photo ─────────────────────────── */}
                <div className="relative" style={{aspectRatio: '4/5', maxHeight: '65vh'}}>
                    {profile.avatar_url ? (
                        <>
                            {!imgLoaded && <div className="absolute inset-0 bg-secondary animate-shimmer"/>}
                            <img
                                src={profile.avatar_url}
                                alt={profile.display_name || ''}
                                className={cn(
                                    'w-full h-full object-cover transition-opacity duration-500',
                                    imgLoaded ? 'opacity-100' : 'opacity-0'
                                )}
                                onLoad={() => setImgLoaded(true)}
                            />
                        </>
                    ) : (
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{background: 'linear-gradient(160deg, hsl(0 90% 45%/0.35), hsl(230 10% 7%))'}}
                        >
              <span className="text-[22vw] font-black leading-none select-none"
                    style={{color: 'hsl(var(--foreground)/0.06)'}}>
                {(profile.display_name || 'U')[0]}
              </span>
                        </div>
                    )}

                    {/* Gradient overlays */}
                    <div
                        className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none"/>

                    {/* ── Top nav ── */}
                    <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 z-10"
                         style={{paddingTop: 'max(16px, calc(env(safe-area-inset-top) + 8px))'}}>
                        <button
                            onClick={() => navigate(-1 as any)}
                            className="w-10 h-10 rounded-xl bg-black/50 backdrop-blur-lg flex items-center justify-center active:scale-90 transition-all border border-white/10"
                        >
                            <ChevronLeft className="w-5 h-5 text-white"/>
                        </button>

                        <div className="flex gap-2">
                            {/* Single heart button (was duplicated — fixed) */}
                            <button
                                onClick={() => toggleFavorite(profile.user_id)}
                                className={cn(
                                    'w-10 h-10 rounded-xl backdrop-blur-lg flex items-center justify-center active:scale-90 transition-all border',
                                    favorited
                                        ? 'bg-primary border-primary/60 shadow-[0_0_16px_hsl(var(--primary)/0.4)]'
                                        : 'bg-black/50 border-white/10'
                                )}
                            >
                                <Heart
                                    className={cn('w-5 h-5 text-white transition-all duration-200', favorited && 'fill-white')}/>
                            </button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="w-10 h-10 rounded-xl bg-black/50 backdrop-blur-lg flex items-center justify-center active:scale-90 transition-all border border-white/10">
                                        <MoreVertical className="w-5 h-5 text-white"/>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end"
                                                     className="w-52 rounded-xl border-border/30 shadow-2xl">
                                    <DropdownMenuItem
                                        className="gap-3 py-3 px-4 text-sm font-medium cursor-pointer rounded-lg"
                                        onClick={() => navigator.share?.({
                                            title: profile.display_name || '',
                                            url: window.location.href
                                        })}
                                    >
                                        <Share2 className="w-4 h-4 text-muted-foreground"/> Share Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-3 py-3 px-4 text-sm font-medium text-destructive cursor-pointer rounded-lg"
                                        onClick={() => userId && submitReport({
                                            reportedId: userId,
                                            reason: 'Reported from profile'
                                        })}
                                    >
                                        <Flag className="w-4 h-4"/> Report
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="gap-3 py-3 px-4 text-sm font-medium text-destructive cursor-pointer rounded-lg"
                                        onClick={() => userId && blockUser(userId)}
                                    >
                                        <Shield className="w-4 h-4"/> Block
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* Online indicator */}
                    {profile.is_online && (
                        <div
                            className="absolute top-[72px] left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-lg border border-white/10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"/>
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400"/>
              </span>
                            <span className="text-[10px] font-bold text-emerald-400 tracking-wide">Online</span>
                        </div>
                    )}

                    {/* ── Hero info ── */}
                    <div className="absolute bottom-0 left-0 right-0 px-4 pb-5">
                        <div className="flex items-end justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <h1 className="text-[28px] font-black text-white leading-none tracking-tight">
                                        {profile.display_name || 'Anonymous'}
                                        {profile.age && (
                                            <span className="font-light opacity-65 text-[22px]">, {profile.age}</span>
                                        )}
                                    </h1>
                                    {profile.is_verified && (
                                        <BadgeCheck className="w-6 h-6 text-blue-400 shrink-0"/>
                                    )}
                                </div>
                                {(profile.city || profile.country) && (
                                    <div className="flex items-center gap-1.5 text-white/65 mb-2">
                                        <MapPin className="w-3.5 h-3.5 shrink-0"/>
                                        <span className="text-[13px] font-medium">
                      {[profile.city, profile.country].filter(Boolean).join(', ')}
                    </span>
                                    </div>
                                )}
                                {(profile.looking_for?.length || 0) > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {profile.looking_for?.slice(0, 3).map(item => (
                                            <span key={item}
                                                  className="px-2.5 py-1 text-[10px] font-bold rounded-md text-white"
                                                  style={{
                                                      background: 'hsl(var(--primary)/0.75)',
                                                      backdropFilter: 'blur(8px)'
                                                  }}>
                        {item}
                      </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-1.5 items-end shrink-0">
                                {(profile as any).is_premium && (
                                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md border"
                                         style={{
                                             background: 'hsl(var(--gold)/0.12)',
                                             borderColor: 'hsl(var(--gold)/0.4)'
                                         }}>
                                        <Crown className="w-3 h-3" style={{color: 'hsl(var(--gold))'}}/>
                                        <span className="text-[9px] font-black tracking-wider"
                                              style={{color: 'hsl(var(--gold))'}}>VIP</span>
                                    </div>
                                )}
                                {(profile as any).is_available_now && (
                                    <div
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/25 border border-primary/50">
                                        <Zap className="w-3 h-3 text-primary"/>
                                        <span className="text-[9px] font-black text-primary">Now</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Content ─────────────────────────────────────────── */}
                <div className="px-4 pt-4 pb-36">

                    {/* Bio */}
                    {profile.bio && (
                        <div className="mb-4 p-4 rounded-xl bg-card border border-border/20">
                            <p className="text-[13px] leading-relaxed text-foreground/85">{profile.bio}</p>
                        </div>
                    )}

                    {/* Stats quick row */}
                    {statsData.length > 0 && (
                        <AccordionSection title="STATS" open={statsOpen} onToggle={() => setStatsOpen(v => !v)}>
                            <div className="grid grid-cols-3 gap-2">
                                {statsData.map(({key, label, value}) => {
                                    const Icon = STAT_ICONS[key] || Activity;
                                    return (
                                        <div key={key}
                                             className="p-3 rounded-xl bg-card border border-border/20 text-center">
                                            <Icon className="w-3.5 h-3.5 text-muted-foreground mx-auto mb-1"/>
                                            <p className="text-[12px] font-bold truncate">{value}</p>
                                            <p className="text-[9px] text-muted-foreground mt-0.5 uppercase tracking-wide">{label}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </AccordionSection>
                    )}

                    {/* Tribes */}
                    <AccordionSection title="TRIBES" open={tribesOpen} onToggle={() => setTribesOpen(v => !v)}>
                        {(profile.tribes?.length || 0) > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {profile.tribes?.map(tribe => (
                                    <span key={tribe}
                                          className="px-3 py-1.5 text-[11px] font-bold rounded-md text-primary border border-primary/25 bg-primary/8">
                    {tribe}
                  </span>
                                ))}
                            </div>
                        ) : (
                            <p className="text-[12px] text-muted-foreground">No tribes listed</p>
                        )}
                    </AccordionSection>

                    {/* Health & Safety */}
                    <AccordionSection title="HEALTH & SAFETY" open={healthOpen} onToggle={() => setHealthOpen(v => !v)}>
                        {hasHealthInfo ? (
                            <div className="grid grid-cols-2 gap-2">
                                {HEALTH_ITEMS.map(({key, label, boolean: isBool}) => {
                                    const val = (profile as any)[key];
                                    if (val === undefined || val === null || val === '') return null;
                                    return (
                                        <div key={key}
                                             className="p-3 rounded-xl bg-card border border-border/20 text-center">
                                            <p className="text-[9px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
                                            <p className="text-[12px] font-bold">{isBool ? (val ? 'Yes' : 'No') : String(val)}</p>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-[12px] text-muted-foreground">No health info shared</p>
                        )}
                    </AccordionSection>

                    {/* Private Album */}
                    <AccordionSection title="PRIVATE ALBUM" open={albumOpen} onToggle={() => setAlbumOpen(v => !v)}>
                        <div className="p-5 rounded-xl border border-border/20 bg-card text-center space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mx-auto">
                                <Lock className="w-5 h-5 text-muted-foreground"/>
                            </div>
                            <p className="text-[12px] font-semibold text-foreground/75">Request access to private
                                photos</p>
                            <button
                                className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-border/40 bg-secondary/40 text-[12px] font-bold hover:border-primary/30 transition-colors active:scale-[0.98]">
                                <Lock className="w-3.5 h-3.5"/>
                                Request Access
                            </button>
                        </div>
                    </AccordionSection>

                </div>
            </div>

            {/* ─── Fixed CTA ─── */}
            <div
                className="flex-shrink-0 px-4 pt-3 border-t border-border/15"
                style={{
                    background: 'hsl(var(--background)/0.97)',
                    backdropFilter: 'blur(32px)',
                    paddingBottom: 'max(16px, calc(env(safe-area-inset-bottom) + 12px))',
                }}
            >
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={() => toggleFavorite(profile.user_id)}
                        className={cn(
                            'h-12 px-5 rounded-xl transition-all font-bold text-sm border',
                            favorited
                                ? 'border-primary/50 text-primary bg-primary/8'
                                : 'border-border/40'
                        )}
                    >
                        <Heart className={cn('w-4 h-4 mr-2 transition-all', favorited && 'fill-current')}/>
                        {favorited ? 'Saved' : 'Save'}
                    </Button>

                    <Button
                        onClick={handleMessage}
                        disabled={createConversation.isPending}
                        className="flex-1 h-12 rounded-xl font-bold text-sm text-white shadow-[0_4px_20px_hsl(var(--primary)/0.35)]"
                        style={{background: 'var(--gradient-primary)'}}
                    >
                        <MessageCircle className="w-4 h-4 mr-2"/>
                        {createConversation.isPending ? 'Opening…' : 'Message'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
