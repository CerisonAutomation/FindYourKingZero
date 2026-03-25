import {memo, useCallback, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {
    BadgeCheck,
    CircleDot,
    Clock,
    Crown,
    Grid3X3,
    Heart,
    Image,
    LayoutGrid,
    MapPin,
    MessageCircle,
    Radio,
    RefreshCw,
    Search,
    SlidersHorizontal,
    TrendingUp,
    X,
    Zap,
} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Sheet, SheetContent} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {useProfile, useProfilesGrid} from '@/hooks/useProfile';
import {useFavorites} from '@/hooks/useFavorites';
import {useCreateConversation} from '@/hooks/useConversations';
import {AIMatchBadge} from '@/components/ai/AIMatchBadge';
import {cn} from '@/lib/utils';

const TRIBES = ['Bear', 'Jock', 'Twink', 'Daddy', 'Muscle', 'Otter', 'Cub', 'Leather', 'Geek', 'Trans', 'Femme', 'Masc'];
const LOOKING_FOR = ['Chat', 'Friends', 'Dates', 'Relationship', 'Hookup', 'Networking', 'Travel Buddy'];
const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Stocky', 'Large', 'Muscular'];
const POSITIONS = ['Top', 'Bottom', 'Vers', 'Side', 'Oral'];

const SORT_OPTIONS = [
    {id: 'distance', label: 'Nearest', Icon: MapPin},
    {id: 'recently_active', label: 'Active', Icon: Clock},
    {id: 'newest', label: 'New', Icon: Zap},
    {id: 'popularity', label: 'Popular', Icon: TrendingUp},
];

const QUICK_CHIPS = [
    {id: 'online', label: 'Online', Icon: Radio},
    {id: 'right_now', label: 'Right Now', Icon: Zap},
    {id: 'verified', label: 'Verified', Icon: BadgeCheck},
    {id: 'new', label: 'New', Icon: CircleDot},
    {id: 'photo', label: 'Photo', Icon: Image},
    {id: 'popular', label: 'Popular', Icon: TrendingUp},
];

const GRADIENTS = [
    'linear-gradient(160deg, hsl(0 88% 45%/0.5), hsl(230 7% 7%))',
    'linear-gradient(160deg, hsl(218 85% 50%/0.45), hsl(230 7% 7%))',
    'linear-gradient(160deg, hsl(155 65% 36%/0.45), hsl(230 7% 7%))',
    'linear-gradient(160deg, hsl(35 92% 50%/0.45), hsl(230 7% 7%))',
    'linear-gradient(160deg, hsl(268 75% 52%/0.45), hsl(230 7% 7%))',
    'linear-gradient(160deg, hsl(340 80% 50%/0.45), hsl(230 7% 7%))',
];

interface Filters {
    search: string;
    ageMin: number;
    ageMax: number;
    maxDistance: number;
    onlineOnly: boolean;
    verifiedOnly: boolean;
    hasPhotos: boolean;
    tribes: string[];
    lookingFor: string[];
    bodyTypes: string[];
    positions: string[];
    sortBy: string;
    quickChips: string[];
}

const DEFAULT: Filters = {
    search: '', ageMin: 18, ageMax: 65, maxDistance: 50,
    onlineOnly: false, verifiedOnly: false, hasPhotos: false,
    tribes: [], lookingFor: [], bodyTypes: [], positions: [],
    sortBy: 'distance', quickChips: [],
};

/* ── Grid card — premium 2050 profile card ── */
const GridCard = memo(({profile, isFav, onFav, onMessage, onView, compact, userProfile}: {
    profile: any; isFav: boolean; compact: boolean; userProfile?: Record<string, any>;
    onFav: (id: string) => void; onMessage: (id: string) => void; onView: (id: string) => void;
}) => {
    const [imgErr, setImgErr] = useState(false);
    const [favAnim, setFavAnim] = useState(false);
    const initial = (profile.display_name || 'U')[0].toUpperCase();
    const isOnline = profile.is_online;
    const isVerified = profile.is_verified;
    const isPremium = profile.is_premium;
    const isRightNow = profile.is_available_now;
    const grad = GRADIENTS[(profile.user_id || '').charCodeAt(0) % GRADIENTS.length];

    const handleFav = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFavAnim(true);
        setTimeout(() => setFavAnim(false), 600);
        onFav(profile.user_id);
    };

    const distLabel = profile.distance !== undefined
        ? profile.distance < 1 ? '< 1 km' : `${Math.round(profile.distance)} km`
        : profile.city || null;

    return (
        <motion.div
            initial={{opacity: 0, scale: 0.91, y: 8}}
            animate={{opacity: 1, scale: 1, y: 0}}
            transition={{duration: 0.22, ease: [0.16, 1, 0.3, 1]}}
            whileTap={{scale: 0.96}}
            className="relative overflow-hidden cursor-pointer group select-none"
            style={{
                aspectRatio: compact ? '1/1.2' : '2/2.9',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--shadow-md)',
            }}
            onClick={() => onView(profile.user_id)}
        >
            {/* ── Photo / placeholder ── */}
            {profile.avatar_url && !imgErr ? (
                <img
                    src={profile.avatar_url}
                    alt={profile.display_name || 'Profile'}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    loading="lazy"
                    decoding="async"
                    onError={() => setImgErr(true)}
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center" style={{background: grad}}>
                    <span
                        className="font-black text-white/[0.07] select-none"
                        style={{fontSize: compact ? '32px' : '44px', letterSpacing: '-0.02em'}}
                    >
                        {initial}
                    </span>
                </div>
            )}

            {/* ── Gradient overlays ── */}
            <div className="absolute inset-0 photo-overlay-bottom pointer-events-none"/>
            <div className="absolute inset-0 photo-overlay-top pointer-events-none"/>

            {/* ── Hover overlay ── */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/12 transition-colors duration-300 pointer-events-none"/>

            {/* ── Premium border ring (when premium) ── */}
            {isPremium && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid hsl(42 98% 56% / 0.4)',
                        boxShadow: 'inset 0 0 0 1px hsl(42 98% 56% / 0.12)',
                    }}
                />
            )}

            {/* ── Top row: online + badges ── */}
            <div className="absolute top-1.5 left-1.5 right-1.5 flex items-start justify-between z-10">
                {/* Online badge */}
                {isOnline ? (
                    <div
                        className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                        style={{
                            background: 'hsl(220 18% 2% / 0.75)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid hsl(142 76% 42% / 0.3)',
                        }}
                    >
                        <span className="relative flex h-[5px] w-[5px] shrink-0">
                            <span
                                className="absolute inset-0 rounded-full animate-ping opacity-75"
                                style={{background: 'hsl(var(--status-online))'}}
                            />
                            <span
                                className="relative rounded-full w-full h-full"
                                style={{background: 'hsl(var(--status-online))'}}
                            />
                        </span>
                        {!compact && (
                            <span
                                className="text-[7px] font-black uppercase tracking-wider"
                                style={{color: 'hsl(var(--status-online))'}}
                            >
                                Live
                            </span>
                        )}
                    </div>
                ) : <div/>}

                {/* Right badges */}
                <div className="flex gap-0.5">
                    {isRightNow && (
                        <div
                            className="flex items-center justify-center"
                            style={{
                                width: 18, height: 18,
                                borderRadius: 4,
                                background: 'var(--gradient-gold)',
                                boxShadow: '0 0 8px hsl(42 98% 56% / 0.5)',
                            }}
                        >
                            <Zap className="w-[9px] h-[9px] text-white fill-white"/>
                        </div>
                    )}
                    {isVerified && (
                        <div
                            className="flex items-center justify-center"
                            style={{
                                width: 18, height: 18,
                                borderRadius: 4,
                                background: 'hsl(214 85% 55% / 0.9)',
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            <BadgeCheck className="w-[9px] h-[9px] text-white"/>
                        </div>
                    )}
                    {isPremium && (
                        <div
                            className="flex items-center justify-center"
                            style={{
                                width: 18, height: 18,
                                borderRadius: 4,
                                background: 'var(--gradient-gold)',
                                boxShadow: '0 0 10px hsl(42 98% 56% / 0.55)',
                            }}
                        >
                            <Crown className="w-[9px] h-[9px] text-black"/>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Fav button ── */}
            <motion.button
                className="absolute z-10 flex items-center justify-center"
                style={{
                    top: compact ? 24 : 28,
                    left: 6,
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    background: isFav ? 'hsl(0 85% 58%)' : 'hsl(220 18% 2% / 0.6)',
                    backdropFilter: 'blur(8px)',
                    border: isFav ? '1px solid hsl(0 85% 70% / 0.4)' : '1px solid hsl(0 0% 100% / 0.1)',
                    opacity: isFav ? 1 : 0,
                    boxShadow: isFav ? '0 0 12px hsl(0 85% 58% / 0.45)' : 'none',
                }}
                animate={favAnim ? {scale: [1, 1.45, 1]} : {}}
                transition={{duration: 0.4}}
                whileHover={{opacity: 1}}
                onClick={handleFav}
                aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
            >
                <Heart
                    className="w-2.5 h-2.5"
                    style={{
                        color: 'white',
                        fill: isFav ? 'white' : 'none',
                    }}
                />
            </motion.button>
            {/* Force fav visible on hover */}
            <div
                className="absolute z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                style={{top: compact ? 24 : 28, left: 6, width: 22, height: 22, borderRadius: 5, pointerEvents: 'none', background: isFav ? 'transparent' : 'hsl(220 18% 2% / 0.6)', backdropFilter: 'blur(8px)'}}
            />

            {/* ── Info panel ── */}
            <div className="absolute bottom-0 left-0 right-0 px-2 pb-2.5 z-10">
                {/* Name + age + match badge */}
                <div className="flex items-baseline gap-1">
                    <span className="font-black text-white leading-none truncate" style={{fontSize: compact ? '10px' : '11px', letterSpacing: '-0.01em'}}>
                        {profile.display_name || 'Anonymous'}
                    </span>
                    {profile.age && (
                        <span className="text-white/55 font-normal shrink-0" style={{fontSize: compact ? '9px' : '10px'}}>
                            {profile.age}
                        </span>
                    )}
                    {userProfile && (
                        <div className="ml-auto shrink-0">
                            <AIMatchBadge userProfile={userProfile} targetProfile={profile} lazy/>
                        </div>
                    )}
                </div>

                {/* Distance/location */}
                {!compact && distLabel && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                        <MapPin className="w-[8px] h-[8px] text-white/40 shrink-0"/>
                        <span className="text-[8px] text-white/40 truncate">{distLabel}</span>
                    </div>
                )}

                {/* Action row — slides up on hover */}
                <div className="flex gap-1 mt-1.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200 ease-out">
                    <button
                        onClick={e => { e.stopPropagation(); onMessage(profile.user_id); }}
                        className="flex-1 flex items-center justify-center gap-0.5 py-1.5 text-[8.5px] font-bold text-white transition-all"
                        style={{
                            borderRadius: 4,
                            background: 'hsl(220 18% 100% / 0.1)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid hsl(0 0% 100% / 0.1)',
                        }}
                    >
                        <MessageCircle className="w-[8px] h-[8px]"/>
                        {!compact && 'Message'}
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onView(profile.user_id); }}
                        className="flex-1 flex items-center justify-center py-1.5 text-[8.5px] font-black text-white transition-all"
                        style={{
                            borderRadius: 4,
                            background: 'var(--gradient-gold)',
                            boxShadow: '0 2px 8px hsl(42 98% 56% / 0.4)',
                        }}
                    >
                        View
                    </button>
                </div>
            </div>
        </motion.div>
    );
});
GridCard.displayName = 'GridCard';

/* ── Skeleton ── */
const CardSkeleton = ({compact}: {compact: boolean}) => (
    <div
        className="overflow-hidden relative"
        style={{
            aspectRatio: compact ? '1/1.2' : '2/2.9',
            borderRadius: 'var(--radius-sm)',
            background: 'hsl(var(--surface-2))',
        }}
    >
        <div
            className="absolute inset-0"
            style={{
                background: 'linear-gradient(90deg, transparent 0%, hsl(0 0% 100% / 0.04) 50%, transparent 100%)',
                backgroundSize: '400px 100%',
                animation: 'skeleton-wave 1.6s ease-in-out infinite',
            }}
        />
    </div>
);

/* ── ChipGroup ── */
function ChipGroup({title, options, selected, onToggle}: {
    title: string; options: string[]; selected: string[]; onToggle: (v: string) => void;
}) {
    return (
        <div className="space-y-1.5">
            <p className="section-label">{title}</p>
            <div className="flex flex-wrap gap-1">
                {options.map(opt => {
                    const active = selected.includes(opt);
                    return (
                        <button
                            key={opt}
                            onClick={() => onToggle(opt)}
                            className={cn(
                                'px-2 py-0.5 rounded-sm text-[11px] font-bold border transition-all duration-100',
                                active
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-transparent border-border/35 text-muted-foreground hover:border-primary/30',
                            )}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Filters sheet ── */
function FiltersSheet({open, onClose, filters, onApply}: {
    open: boolean; onClose: () => void; filters: Filters; onApply: (f: Filters) => void;
}) {
    const [local, setLocal] = useState<Filters>(filters);
    const upd = <K extends keyof Filters>(k: K, v: Filters[K]) => setLocal(p => ({...p, [k]: v}));
    const toggle = <K extends 'tribes' | 'lookingFor' | 'bodyTypes' | 'positions'>(k: K, val: string) =>
        setLocal(p => ({
            ...p,
            [k]: (p[k] as string[]).includes(val)
                ? (p[k] as string[]).filter(x => x !== val)
                : [...(p[k] as string[]), val],
        }));

    const activeCount = [
        local.onlineOnly, local.verifiedOnly, local.hasPhotos,
        local.tribes.length, local.lookingFor.length, local.bodyTypes.length, local.positions.length,
        local.ageMin !== 18 || local.ageMax !== 65, local.maxDistance !== 50,
    ].filter(Boolean).length;

    return (
        <Sheet open={open} onOpenChange={v => !v && onClose()}>
            <SheetContent
                side="bottom"
                className="h-[93dvh] overflow-y-auto bg-background p-0 border-border/25 scrollbar-hide"
                style={{borderRadius: '10px 10px 0 0'}}
            >
                {/* Handle */}
                <div className="flex justify-center pt-2.5 pb-0">
                    <div className="w-7 h-[3px] rounded-full bg-border/40"/>
                </div>

                {/* Sticky header */}
                <div
                    className="sticky top-0 z-10 bg-background/96 backdrop-blur-2xl border-b border-border/15 px-4 py-2.5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-primary"/>
                            <span className="font-black text-[14px]">Filters</span>
                            {activeCount > 0 && (
                                <span
                                    className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[8px] flex items-center justify-center font-black">{activeCount}</span>
                            )}
                        </div>
                        <button
                            onClick={() => {
                                setLocal(DEFAULT);
                                onApply(DEFAULT);
                                onClose();
                            }}
                            className="text-[11px] text-muted-foreground font-bold hover:text-foreground transition-colors"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                <div className="px-4 pt-4 pb-10 space-y-5">
                    {/* Sort */}
                    <div className="space-y-1.5">
                        <p className="section-label">Sort By</p>
                        <div className="grid grid-cols-4 gap-1.5">
                            {SORT_OPTIONS.map(s => {
                                const Icon = s.Icon;
                                return (
                                    <button key={s.id} onClick={() => upd('sortBy', s.id)}
                                            className={cn(
                                                'flex flex-col items-center gap-1 py-2 px-1 rounded-sm text-[10px] font-bold border transition-all',
                                                local.sortBy === s.id
                                                    ? 'bg-primary/10 border-primary text-primary'
                                                    : 'bg-card border-border/30 text-muted-foreground hover:border-primary/25'
                                            )}>
                                        <Icon className="w-3 h-3 shrink-0" strokeWidth={2.2}/>
                                        {s.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Toggles — row-list pattern, no card wrappers */}
                    <div>
                        <p className="section-label mb-1.5">Quick Filters</p>
                        {[
                            {key: 'onlineOnly' as const, label: 'Online now', sub: 'Active users only'},
                            {key: 'verifiedOnly' as const, label: 'Verified only', sub: 'Photo-verified'},
                            {key: 'hasPhotos' as const, label: 'Has photos', sub: 'Profiles with photos'},
                        ].map(({key, label, sub}) => (
                            <div key={key} className="row-item gap-3">
                                <div className="flex-1">
                                    <p className="text-[12.5px] font-semibold">{label}</p>
                                    <p className="text-[10.5px] text-muted-foreground">{sub}</p>
                                </div>
                                <Switch checked={local[key]} onCheckedChange={v => upd(key, v)}/>
                            </div>
                        ))}
                    </div>

                    {/* Age */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-baseline">
                            <p className="section-label">Age Range</p>
                            <span className="text-[12px] font-black text-primary">{local.ageMin} – {local.ageMax}</span>
                        </div>
                        <Slider min={18} max={80} step={1} value={[local.ageMin, local.ageMax]}
                                onValueChange={([a, b]) => {
                                    upd('ageMin', a);
                                    upd('ageMax', b);
                                }}/>
                    </div>

                    {/* Distance */}
                    <div className="space-y-2.5">
                        <div className="flex justify-between items-baseline">
                            <p className="section-label">Max Distance</p>
                            <span className="text-[12px] font-black text-primary">
                {local.maxDistance >= 200 ? '200+ km' : `${local.maxDistance} km`}
              </span>
                        </div>
                        <Slider min={1} max={200} step={1} value={[local.maxDistance]}
                                onValueChange={([v]) => upd('maxDistance', v)}/>
                    </div>

                    <ChipGroup title="Tribes" options={TRIBES} selected={local.tribes}
                               onToggle={v => toggle('tribes', v)}/>
                    <ChipGroup title="Looking For" options={LOOKING_FOR} selected={local.lookingFor}
                               onToggle={v => toggle('lookingFor', v)}/>
                    <ChipGroup title="Body Type" options={BODY_TYPES} selected={local.bodyTypes}
                               onToggle={v => toggle('bodyTypes', v)}/>
                    <ChipGroup title="Position" options={POSITIONS} selected={local.positions}
                               onToggle={v => toggle('positions', v)}/>

                    <div className="flex gap-2.5 pt-1">
                        <Button
                            variant="outline"
                            className="flex-1 h-10 rounded-sm font-bold text-[12px] border-border/40"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-[2] h-10 rounded-sm font-bold text-[12px] border-0"
                            style={{
                                background: 'var(--gradient-primary)',
                                boxShadow: '0 4px 18px hsl(var(--primary)/0.28)'
                            }}
                            onClick={() => {
                                onApply(local);
                                onClose();
                            }}
                        >
                            Show Results
                            {activeCount > 0 && (
                                <span
                                    className="ml-1.5 px-1.5 py-0.5 rounded-sm bg-white/18 text-[9px] font-black">{activeCount}</span>
                            )}
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

/* ── Main ── */
export default function GridPage() {
    const navigate = useNavigate();
    const {isFavorite, toggleFavorite} = useFavorites();
    const createConversation = useCreateConversation();

    const [filters, setFilters] = useState<Filters>(DEFAULT);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [cols, setCols] = useState<2 | 3>(2);

    const {data: profiles = [], isLoading, refetch, isFetching} = useProfilesGrid(filters);
    const {profile: myProfile} = useProfile();

    const activeFilterCount = useMemo(() => [
        filters.onlineOnly, filters.verifiedOnly, filters.hasPhotos,
        filters.tribes.length, filters.lookingFor.length,
        filters.bodyTypes.length, filters.positions.length,
        filters.ageMin !== 18 || filters.ageMax !== 65,
        filters.maxDistance !== 50,
    ].filter(Boolean).length, [filters]);

    const toggleChip = (id: string) =>
        setFilters(p => ({
            ...p,
            quickChips: p.quickChips.includes(id) ? p.quickChips.filter(c => c !== id) : [...p.quickChips, id],
        }));

    const filtered = useMemo(() => profiles.filter((p: any) => {
        if (filters.search && !(p.display_name || '').toLowerCase().includes(filters.search.toLowerCase())) return false;
        if (filters.onlineOnly && !p.is_online) return false;
        if (filters.verifiedOnly && !p.is_verified) return false;
        if (filters.hasPhotos && !p.avatar_url) return false;
        if (filters.ageMin > 18 && p.age && p.age < filters.ageMin) return false;
        if (filters.ageMax < 65 && p.age && p.age > filters.ageMax) return false;
        if (filters.tribes.length && !(p.tribes || []).some((t: string) => filters.tribes.includes(t))) return false;
        if (filters.lookingFor.length && !(p.looking_for || []).some((l: string) => filters.lookingFor.includes(l))) return false;
        if (filters.quickChips.includes('online') && !p.is_online) return false;
        if (filters.quickChips.includes('verified') && !p.is_verified) return false;
        if (filters.quickChips.includes('photo') && !p.avatar_url) return false;
        return true;
    }), [profiles, filters]);

    const handleMessage = useCallback(async (userId: string) => {
        try {
            const cid = await createConversation.mutateAsync(userId);
            navigate(`/app/chat/${cid}`);
        } catch {
            navigate('/app/messages');
        }
    }, [createConversation, navigate]);

    const compact = cols === 3;

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">

            {/* ── Header ── */}
            <header className="flex-shrink-0 glass-nav border-b border-white/[0.035] z-20">
                <div className="px-3 pt-3 pb-1.5 space-y-2">

                    {/* Title row */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-[17px] font-black tracking-tight">Discover</h1>
                            {!isLoading && (
                                <span
                                    className="px-1.5 py-0.5 text-[9.5px] font-bold text-muted-foreground"
                                    style={{background: 'hsl(var(--secondary)/0.5)', borderRadius: '4px'}}
                                >
                  {filtered.length}
                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setSearchOpen(s => !s)}
                                className={cn(
                                    'w-7 h-7 rounded-sm flex items-center justify-center transition-all active:scale-90',
                                    searchOpen ? 'bg-primary/12 border border-primary/25 text-primary' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <Search className="w-3.5 h-3.5"/>
                            </button>

                            <button
                                onClick={() => setFiltersOpen(true)}
                                className={cn(
                                    'relative w-7 h-7 rounded-sm flex items-center justify-center transition-all active:scale-90',
                                    activeFilterCount > 0 ? 'bg-primary/12 border border-primary/25 text-primary' : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                <SlidersHorizontal className="w-3.5 h-3.5"/>
                                {activeFilterCount > 0 && (
                                    <span
                                        className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-primary text-primary-foreground text-[6.5px] font-black flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                                )}
                            </button>

                            <button
                                onClick={() => refetch()}
                                className={cn('w-7 h-7 rounded-sm flex items-center justify-center transition-all active:scale-90 text-muted-foreground hover:text-foreground', isFetching && 'animate-spin')}
                            >
                                <RefreshCw className="w-3.5 h-3.5"/>
                            </button>

                            <button
                                onClick={() => setCols(c => c === 2 ? 3 : 2)}
                                className="w-7 h-7 rounded-sm flex items-center justify-center active:scale-90 transition-all text-muted-foreground hover:text-foreground"
                            >
                                {cols === 2
                                    ? <Grid3X3 className="w-3.5 h-3.5"/>
                                    : <LayoutGrid className="w-3.5 h-3.5"/>}
                            </button>
                        </div>
                    </div>

                    {/* Search input */}
                    <AnimatePresence>
                        {searchOpen && (
                            <motion.div
                                initial={{height: 0, opacity: 0}}
                                animate={{height: 'auto', opacity: 1}}
                                exit={{height: 0, opacity: 0}}
                                className="overflow-hidden"
                            >
                                <div className="relative pb-0.5">
                                    <Search
                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none"/>
                                    <Input
                                        autoFocus
                                        placeholder="Search by name…"
                                        value={filters.search}
                                        onChange={e => setFilters(p => ({...p, search: e.target.value}))}
                                        className="pl-8 pr-7 h-8 bg-secondary/35 border-border/25 rounded-sm text-[12.5px]"
                                    />
                                    {filters.search && (
                                        <button
                                            onClick={() => setFilters(p => ({...p, search: ''}))}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-sm bg-muted flex items-center justify-center"
                                        >
                                            <X className="w-2 h-2 text-muted-foreground"/>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick filter chips — no emoji, tight */}
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide pb-0.5">
                        {QUICK_CHIPS.map(chip => {
                            const Icon = chip.Icon;
                            const active = filters.quickChips.includes(chip.id);
                            return (
                                <button
                                    key={chip.id}
                                    onClick={() => toggleChip(chip.id)}
                                    className={cn(
                                        'flex items-center gap-0.5 px-2 py-0.5 whitespace-nowrap text-[10.5px] font-bold border shrink-0 transition-all duration-100',
                                        active
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'border-border/25 text-muted-foreground hover:border-primary/25',
                                    )}
                                    style={{borderRadius: '4px'}}
                                >
                                    <Icon className="w-2 h-2 shrink-0" strokeWidth={2.5}/>
                                    {chip.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ── Grid ── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className={cn('grid p-1.5', cols === 2 ? 'grid-cols-2 gap-1' : 'grid-cols-3 gap-1')}>
                    {isLoading
                        ? Array.from({length: cols === 2 ? 12 : 18}).map((_, i) => <CardSkeleton key={i}
                                                                                                 compact={compact}/>)
                        : filtered.length > 0
                            ? filtered.map((profile: any) => (
                                <GridCard
                                    key={profile.user_id}
                                    profile={profile}
                                    compact={compact}
                                    isFav={isFavorite(profile.user_id)}
                                    onFav={toggleFavorite}
                                    onMessage={handleMessage}
                                    onView={id => navigate(`/app/profile/${id}`)}
                                    userProfile={myProfile ?? undefined}
                                />
                            ))
                            : (
                                <motion.div
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    className="col-span-full flex flex-col items-center justify-center py-20 gap-4 px-8 text-center"
                                >
                                    <div className="w-12 h-12 bg-secondary flex items-center justify-center"
                                         style={{borderRadius: '8px'}}>
                                        <Search className="w-6 h-6 text-muted-foreground/35"/>
                                    </div>
                                    <div>
                                        <p className="font-black text-[15px]">No profiles found</p>
                                        <p className="text-[12px] text-muted-foreground mt-1">Adjust your filters to see
                                            more guys</p>
                                    </div>
                                    <button
                                        onClick={() => setFilters(DEFAULT)}
                                        className="px-4 py-1.5 rounded-sm border border-border/40 text-[12px] font-bold text-muted-foreground hover:text-foreground hover:border-border transition-all"
                                    >
                                        Clear filters
                                    </button>
                                </motion.div>
                            )
                    }
                </div>
                <div className="h-3"/>
            </div>

            <FiltersSheet
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                filters={filters}
                onApply={setFilters}
            />
        </div>
    );
}
