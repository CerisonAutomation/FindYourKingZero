import {useNavigate} from 'react-router-dom';
import {Camera, ChevronLeft, Edit2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {useProfile, useUpdateProfile} from '@/hooks/useProfile';
import {useEffect, useState} from 'react';
import {useToast} from '@/hooks/use-toast';

export default function EditProfile() {
    const navigate = useNavigate();
    const {profile} = useProfile();
    const updateProfile = useUpdateProfile();
    const {toast} = useToast();
    const [form, setForm] = useState({display_name: '', bio: '', city: '', age: ''});

    useEffect(() => {
        if (profile) setForm({
            display_name: profile.display_name || '',
            bio: profile.bio || '',
            city: profile.city || '',
            age: profile.age ? String(profile.age) : ''
        });
    }, [profile]);

    const handleSave = async () => {
        await updateProfile.mutateAsync({
            display_name: form.display_name,
            bio: form.bio,
            city: form.city,
            age: form.age ? parseInt(form.age) : undefined
        });
        toast({title: 'Profile updated'});
        navigate('/app/profile/me');
    };

    return (
        <div className="min-h-screen bg-background pb-28">
            <header
                className="sticky top-0 z-40 glass-heavy border-b border-[hsl(var(--glass-border))] px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full"
                        onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5"/></Button>
                <h1 className="text-lg font-bold flex items-center gap-2"><Edit2 className="w-5 h-5 text-primary"/>Edit
                    Profile</h1>
                <Button className="ml-auto h-9 gradient-primary" onClick={handleSave}
                        disabled={updateProfile.isPending}>Save</Button>
            </header>

            <div className="px-4 py-6 space-y-5">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-secondary overflow-hidden">
                            {profile?.avatar_url ?
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar"/> :
                                <div
                                    className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground/30">{(profile?.display_name || 'U')[0]}</div>}
                        </div>
                        <div
                            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                            <Camera className="w-4 h-4 text-primary-foreground"/>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Tap to change photo</p>
                </div>

                {[
                    {label: 'Display Name', key: 'display_name', placeholder: 'How you appear to others', type: 'text'},
                    {label: 'Age', key: 'age', placeholder: '18+', type: 'number'},
                    {label: 'City', key: 'city', placeholder: 'Your city', type: 'text'},
                ].map(({label, key, placeholder, type}) => (
                    <div key={key} className="space-y-2">
                        <Label>{label}</Label>
                        <Input type={type} placeholder={placeholder} className="h-11"
                               value={form[key as keyof typeof form]}
                               onChange={e => setForm(p => ({...p, [key]: e.target.value}))}/>
                    </div>
                ))}

                <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea placeholder="Tell people about yourself…" value={form.bio}
                              onChange={e => setForm(p => ({...p, bio: e.target.value}))} rows={4}/>
                </div>
            </div>
        </div>
    );
}
import {useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AnimatePresence, motion, Reorder} from 'framer-motion';
import {
    BadgeCheck,
    Bell,
    Bot,
    Camera,
    Check,
    ChevronRight,
    Crown,
    Edit3,
    Eye,
    GripVertical,
    Heart,
    Lock,
    LogOut,
    MapPin,
    Plus,
    RefreshCw,
    Settings,
    Share2,
    Shield,
    Star,
    Trash2,
    Zap,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Sheet, SheetContent, SheetTitle} from '@/components/ui/sheet';
import {useAuth} from '@/hooks/useAuth';
import {useProfile, useUpdateProfile} from '@/hooks/useProfile';
import {useSubscription} from '@/hooks/useSubscription';
import {
    useAddProfilePhoto,
    useDeleteProfilePhoto,
    useProfilePhotos,
    useReorderPhotos,
    useSetPrimaryPhoto
} from '@/hooks/useProfilePhotos';
import {useLocaleStore} from '@/stores/useLocaleStore';
import {cn} from '@/lib/utils';

const TRIBES = ['Bear', 'Jock', 'Twink', 'Daddy', 'Muscle', 'Otter', 'Cub', 'Leather', 'Geek', 'Trans', 'Non-binary', 'Femme', 'Masc', 'Poz'];
const LOOKING_FOR = ['Chat', 'Friends', 'Dates', 'Relationship', 'Hookup', 'Networking', 'Travel Buddy'];
const POSITIONS = ['Top', 'Bottom', 'Vers', 'Side', 'Oral'];
const REL_STATUSES = ['Single', 'Partnered', 'Open', 'Complicated'];

type EditSheet = 'none' | 'basics' | 'about' | 'tribes' | 'looking-for' | 'privacy' | 'photos';

// ── Real-time save toast ─────────────────────────────────────
function SaveToast({saving}: { saving: boolean }) {
    return (
        <AnimatePresence>
            {saving && (
                <motion.div
                    initial={{opacity: 0, y: 20, scale: 0.9}}
                    animate={{opacity: 1, y: 0, scale: 1}}
                    exit={{opacity: 0, y: 10, scale: 0.9}}
                    className="fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-4 py-2.5  shadow-lg"
                    style={{background: 'hsl(155 65% 42%)', boxShadow: '0 4px 20px hsl(155 65% 42% / 0.4)'}}
                >
                    <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                    <span className="text-[12px] font-bold text-white">Saving…</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ── Compact stat — no card wrapper, tight ────────────────────
function Stat({value, label, icon: Icon, color}: {
    value: string | number; label: string; icon: React.FC<any>; color: string;
}) {
    return (
        <div className="flex-1 flex flex-col items-center py-3"
             style={{borderRight: '1px solid hsl(var(--border)/0.2)'}}>
            <Icon className={cn('w-3.5 h-3.5 mb-1', color)}/>
            <span className={cn('text-[19px] font-black leading-none', color)}>{value}</span>
            <span
                className="text-[8.5px] font-bold text-muted-foreground mt-0.5 uppercase tracking-wider text-center">{label}</span>
        </div>
    );
}

// ── Photo Grid (9-slot, drag to reorder) ────────────────────
function PhotoGrid({userId}: { userId: string }) {
    const {data: photos = [], isLoading} = useProfilePhotos(userId);
    const add = useAddProfilePhoto();
    const remove = useDeleteProfilePhoto();
    const setPrim = useSetPrimaryPhoto();
    const reorder = useReorderPhotos();
    const fileRef = useRef<HTMLInputElement>(null);
    const [items, setItems] = useState<typeof photos>([]);
    const [reordering, setReordering] = useState(false);
    const [selected, setSelected] = useState<string | null>(null);
    const MAX = 9;

    const startReorder = () => {
        setItems([...photos]);
        setReordering(true);
    };
    const saveReorder = () => {
        reorder.mutate(items.map(p => p.id));
        setReordering(false);
    };

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        add.mutate({file: f, isPrimary: photos.length === 0});
        e.target.value = '';
    };

    const displayPhotos = reordering ? items : photos;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.12em]">
                    Photos · {photos.length}/{MAX}
                </p>
                <div className="flex items-center gap-2">
                    {photos.length > 1 && (
                        reordering ? (
                            <button onClick={saveReorder}
                                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 active:opacity-70">
                                <Check className="w-3 h-3"/> Done
                            </button>
                        ) : (
                            <button onClick={startReorder}
                                    className="flex items-center gap-1 text-[11px] font-bold text-primary active:opacity-70">
                                <GripVertical className="w-3 h-3"/> Reorder
                            </button>
                        )
                    )}
                </div>
            </div>

            {reordering ? (
                <Reorder.Group axis="x" values={items} onReorder={setItems} className="grid grid-cols-3 gap-2">
                    {items.map((photo) => (
                        <Reorder.Item key={photo.id} value={photo} className="aspect-square">
                            <div className="aspect-square  overflow-hidden relative cursor-grab active:cursor-grabbing">
                                <img src={photo.url} alt="" className="w-full h-full object-cover"/>
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <GripVertical className="w-6 h-6 text-white/80"/>
                                </div>
                                {photo.is_primary && (
                                    <div
                                        className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-primary text-[8px] font-black text-white">
                                        MAIN
                                    </div>
                                )}
                            </div>
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {isLoading ? (
                        Array.from({length: 3}).map((_, i) => (
                            <div key={i} className="aspect-square  bg-secondary animate-pulse"/>
                        ))
                    ) : (
                        Array.from({length: MAX}).map((_, idx) => {
                            const photo = displayPhotos[idx];
                            const isSelected = selected === photo?.id;

                            if (photo) {
                                return (
                                    <motion.div
                                        key={photo.id}
                                        initial={{opacity: 0, scale: 0.88}}
                                        animate={{opacity: 1, scale: 1}}
                                        className="aspect-square  overflow-hidden relative group"
                                        onClick={() => setSelected(isSelected ? null : photo.id)}
                                    >
                                        <img src={photo.url} alt="" className="w-full h-full object-cover"/>

                                        {/* Overlay */}
                                        <div className={cn(
                                            'absolute inset-0 transition-all duration-200',
                                            isSelected ? 'bg-black/50' : 'bg-black/0 group-hover:bg-black/35',
                                        )}/>

                                        {/* Primary badge */}
                                        {photo.is_primary && (
                                            <div
                                                className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-full bg-primary text-[8px] font-black text-white shadow-sm">
                                                MAIN
                                            </div>
                                        )}

                                        {/* Action overlay */}
                                        <AnimatePresence>
                                            {isSelected && (
                                                <motion.div
                                                    initial={{opacity: 0}}
                                                    animate={{opacity: 1}}
                                                    exit={{opacity: 0}}
                                                    className="absolute inset-x-0 bottom-0 p-2 flex gap-1.5"
                                                >
                                                    {!photo.is_primary && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setPrim.mutate(photo.id);
                                                                setSelected(null);
                                                            }}
                                                            className="flex-1 flex items-center justify-center gap-1 py-1.5  bg-primary/90 text-white text-[9px] font-bold">
                                                            <Star className="w-2.5 h-2.5"/> Set Main
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            remove.mutate(photo.id);
                                                            setSelected(null);
                                                        }}
                                                        className="w-8 h-8  bg-destructive/80 flex items-center justify-center shrink-0">
                                                        <Trash2 className="w-3 h-3 text-white"/>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            }

                            // Add slot
                            if (idx === photos.length) {
                                return (
                                    <label key={`add-${idx}`}
                                           className="aspect-square  border-2 border-dashed border-border/40 bg-secondary/15 flex flex-col items-center justify-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 active:scale-95 transition-all">
                                        {add.isPending ? (
                                            <div
                                                className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5 text-muted-foreground/50 mb-1"/>
                                                <span
                                                    className="text-[9px] text-muted-foreground/50 font-medium">Add</span>
                                            </>
                                        )}
                                        <input ref={fileRef} type="file" accept="image/*" className="hidden"
                                               onChange={handleFile}/>
                                    </label>
                                );
                            }

                            return <div key={`empty-${idx}`}
                                        className="aspect-square  bg-secondary/8 border border-border/8"/>;
                        })
                    )}
                </div>
            )}

            <p className="text-[10px] text-muted-foreground text-center">
                Tap photo to edit · Drag to reorder · Max {MAX} photos
            </p>
        </div>
    );
}

// ── Quick action tile — tighter, sharper ─────────────────────
function ActionTile({icon: Icon, label, onClick, badge, highlight, dim}: {
    icon: React.FC<any>; label: string; onClick?: () => void;
    badge?: string; highlight?: boolean; dim?: boolean;
}) {
    return (
        <motion.button
            whileTap={{scale: 0.94}}
            onClick={onClick}
            className={cn(
                'flex flex-col items-center justify-center gap-1.5 py-3 px-2 border transition-all duration-150',
                highlight ? 'border-primary/25' : 'border-border/15',
                dim && 'opacity-40',
            )}
            style={{
                borderRadius: '6px',
                background: highlight ? 'hsl(var(--primary)/0.07)' : 'hsl(var(--secondary)/0.25)'
            }}
        >
            <div
                className="w-8 h-8 flex items-center justify-center"
                style={{
                    borderRadius: '6px',
                    background: highlight ? 'var(--gradient-primary)' : 'hsl(var(--secondary)/0.7)'
                }}
            >
                <Icon className={cn('w-4 h-4', highlight ? 'text-white' : 'text-muted-foreground')}/>
            </div>
            <span
                className={cn('text-[10.5px] font-bold text-center leading-tight', highlight ? 'text-primary' : 'text-foreground/75')}>
        {label}
      </span>
            {badge && (
                <span
                    className="text-muted-foreground text-[8.5px] font-black tracking-widest"
                    style={{background: 'hsl(var(--secondary)/0.8)', borderRadius: '3px', padding: '1px 5px'}}
                >
          {badge}
        </span>
            )}
        </motion.button>
    );
}

// ── Main ─────────────────────────────────────────────────────
export default function MePage() {
    const navigate = useNavigate();
    const {user, signOut} = useAuth();
    const {profile, isLoading} = useProfile();
    const {isPremium, currentPlan} = useSubscription();
    const updateProfile = useUpdateProfile();
    const {t} = useLocaleStore();

    const [editSheet, setEditSheet] = useState<EditSheet>('none');
    const [editForm, setEditForm] = useState<Record<string, unknown>>({});
    const [view, setView] = useState<'account' | 'photos'>('account');
    const coverRef = useRef<HTMLInputElement>(null);

    const openEdit = (sheet: EditSheet) => {
        if (!profile) return;
        setEditForm({
            display_name: profile.display_name || '',
            age: profile.age || '',
            height: (profile as any).height || '',
            weight: (profile as any).weight || '',
            city: profile.city || '',
            bio: profile.bio || '',
            tribes: profile.tribes || [],
            looking_for: profile.looking_for || [],
            relationship_status: (profile as any).relationship_status || '',
            position: (profile as any).position || '',
            show_distance: (profile as any).show_distance ?? true,
            show_online: (profile as any).show_online ?? true,
            incognito: (profile as any).incognito ?? false,
        });
        setEditSheet(sheet);
    };

    const upd = (k: string, v: unknown) => setEditForm(p => ({...p, [k]: v}));
    const toggleArr = (k: 'tribes' | 'looking_for', val: string) => {
        const arr = (editForm[k] as string[]) || [];
        setEditForm(p => ({...p, [k]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]}));
    };
    const handleSave = () => updateProfile.mutate(editForm as any, {onSuccess: () => setEditSheet('none')});

    const Handle = () => (
        <div className="flex justify-center pt-3 pb-1">
            <div className="w-8 h-1 rounded-full bg-border/60"/>
        </div>
    );

    const SaveRow = () => (
        <div className="flex gap-3 pt-4 pb-2">
            <Button variant="outline" className="flex-1 h-12  font-bold" onClick={() => setEditSheet('none')}>
                Cancel
            </Button>
            <Button
                className="flex-[2] h-12  font-bold gradient-primary shadow-[0_4px_20px_hsl(var(--primary)/0.3)] border-0"
                onClick={handleSave} disabled={updateProfile.isPending}
            >
                {updateProfile.isPending ? (
                    <>
                        <div
                            className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"/>
                        Saving…</>
                ) : (
                    <><Check className="w-4 h-4 mr-1.5"/>Save</>
                )}
            </Button>
        </div>
    );

    // Loading skeleton
    if (isLoading) return (
        <div className="h-full bg-background overflow-y-auto">
            <div className="h-36 bg-secondary animate-pulse"/>
            <div className="px-4 -mt-10 space-y-4">
                <div className="w-20 h-20 rounded-full bg-secondary animate-pulse border-4 border-background"/>
                <div className="h-5 w-32 bg-secondary rounded animate-pulse"/>
                <div className="h-3 w-24 bg-secondary/60 rounded animate-pulse"/>
                <div className="grid grid-cols-3 gap-2">
                    {Array.from({length: 6}).map((_, i) => <div key={i} className="h-20 bg-secondary animate-pulse "/>)}
                </div>
            </div>
        </div>
    );

    if (!profile) return (
        <div className="h-full flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-14 h-14  gradient-primary flex items-center justify-center">
                <Crown className="w-7 h-7 text-white"/>
            </div>
            <p className="text-muted-foreground text-[14px]">Profile not found. Complete your setup.</p>
            <Button onClick={() => navigate('/onboarding')} className="gradient-primary border-0  h-11 px-6 font-bold">
                Get Started
            </Button>
        </div>
    );

    // Completeness
    const checks = [
        profile.display_name, profile.age, profile.city, profile.bio,
        profile.avatar_url,
        (profile.tribes || []).length > 0,
        (profile.looking_for || []).length > 0,
        (profile as any).height,
        (profile as any).position,
        user?.email,
    ];
    const completeness = Math.round(checks.filter(Boolean).length / checks.length * 100);
    const missing = [
        !profile.bio && 'Bio',
        !profile.avatar_url && 'Photo',
        !(profile as any).position && 'Position',
        !profile.age && 'Age',
        !profile.city && 'City',
        !(profile as any).height && 'Height',
        !(profile.tribes || []).length && 'Tribe',
    ].filter(Boolean) as string[];

    const tribes = profile.tribes || [];
    const lookingFor = profile.looking_for || [];

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">
            <SaveToast saving={updateProfile.isPending}/>

            <div className="flex-1 overflow-y-auto scrollbar-hide">

                {/* ─── Sticky header ─ */}
                <header
                    className="sticky top-0 z-40 glass-nav border-b border-white/[0.04] px-4 py-3 flex items-center justify-between">
                    <h1 className="text-[15px] font-black uppercase tracking-[0.08em]">My Profile</h1>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center active:rotate-180 transition-transform duration-500"
                    >
                        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground"/>
                    </button>
                </header>

                {/* ─── Full-bleed cover ─ */}
                <div className="relative">
                    {/* Cover image */}
                    <div className="relative h-40 overflow-hidden">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt=""
                                 className="w-full h-full object-cover scale-110 blur-sm brightness-[0.35]"/>
                        ) : (
                            <div className="absolute inset-0" style={{
                                background: 'linear-gradient(135deg, hsl(var(--primary)/0.25) 0%, hsl(var(--card)) 50%, hsl(var(--accent)/0.15) 100%)',
                            }}/>
                        )}
                        {/* Gradient fade to background */}
                        <div
                            className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background"/>
                    </div>

                    {/* Avatar – overlapping */}
                    <div className="absolute bottom-[-36px] left-4">
                        <div className="relative">
                            {/* Gradient ring */}
                            <div className="p-[2.5px] rounded-full shadow-lg"
                                 style={{background: 'var(--gradient-primary)'}}>
                                <Avatar className="w-[72px] h-[72px] border-[3px] border-background">
                                    <AvatarImage src={profile.avatar_url || ''}/>
                                    <AvatarFallback className="text-[26px] font-black bg-secondary">
                                        {(profile.display_name || 'U')[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            {/* Camera FAB */}
                            <button
                                onClick={() => openEdit('photos')}
                                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full gradient-primary flex items-center justify-center border-2 border-background shadow-md active:scale-90 transition-transform"
                            >
                                <Camera className="w-3 h-3 text-white"/>
                            </button>
                        </div>
                    </div>

                    {/* Edit button – top right of cover zone */}
                    <div className="absolute bottom-[-28px] right-4">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-3  border-border/50 text-[12px] font-bold bg-background/80 backdrop-blur-sm"
                            onClick={() => openEdit('basics')}
                        >
                            <Edit3 className="w-3 h-3 mr-1.5"/>Edit
                        </Button>
                    </div>
                </div>

                {/* ─── Profile info ─ */}
                <div className="px-4 pt-12 pb-0">
                    {/* Name + verification */}
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <h2 className="text-[20px] font-black tracking-tight">
                                    {profile.display_name || 'Set your name'}
                                </h2>
                                {profile.is_verified && <BadgeCheck className="w-5 h-5 text-blue-400 shrink-0"/>}
                                {isPremium && (
                                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                                         style={{background: 'hsl(var(--gold)/0.15)'}}>
                                        <Crown className="w-3 h-3" style={{color: 'hsl(var(--gold))'}}/>
                                        <span className="text-[9px] font-black" style={{color: 'hsl(var(--gold))'}}>
                      {(currentPlan || 'PRO').toUpperCase()}
                    </span>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-muted-foreground">
                                {profile.age && <span>{profile.age}</span>}
                                {profile.city && (
                                    <>
                                        <span>·</span>
                                        <span className="flex items-center gap-0.5">
                      <MapPin className="w-3 h-3"/>{profile.city}
                    </span>
                                    </>
                                )}
                                {(profile as any).position && (
                                    <>
                                        <span>·</span>
                                        <span>{(profile as any).position}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio ? (
                        <p className="text-[13px] text-foreground/70 leading-relaxed mb-4 line-clamp-3">{profile.bio}</p>
                    ) : (
                        <button onClick={() => openEdit('about')}
                                className="w-full mb-4 py-3  border border-dashed border-border/40 text-[12px] text-muted-foreground font-medium hover:border-primary/30 transition-colors">
                            + Add a bio
                        </button>
                    )}

                    {/* Tribes + Looking For pills */}
                    {(tribes.length > 0 || lookingFor.length > 0) && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {tribes.slice(0, 3).map(t => (
                                <span key={t} className="chip chip-primary">{t}</span>
                            ))}
                            {lookingFor.slice(0, 3).map(l => (
                                <span key={l} className="chip chip-muted">{l}</span>
                            ))}
                        </div>
                    )}

                    {/* Completeness bar */}
                    <div className="mb-4 p-3.5  bg-secondary/20 border border-border/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-muted-foreground">Profile strength</span>
                            <span className="text-[12px] font-black text-primary">{completeness}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                            <motion.div
                                initial={{width: 0}}
                                animate={{width: `${completeness}%`}}
                                transition={{duration: 1, ease: [0.16, 1, 0.3, 1]}}
                                className="h-full rounded-full gradient-primary"
                            />
                        </div>
                        {missing.length > 0 && (
                            <p className="text-[10px] text-muted-foreground mt-1.5">
                                Add {missing.slice(0, 3).join(', ')}{missing.length > 3 ? ` +${missing.length - 3}` : ''} to
                                boost visibility
                            </p>
                        )}
                    </div>

                    {/* Stats row */}
                    <div className="flex gap-2 mb-5">
                        <Stat value={0} label="Views" icon={Eye} color="text-muted-foreground"/>
                        <Stat value={0} label="Taps" icon={Zap} color="text-primary"/>
                        <Stat value={0} label="Likes" icon={Heart} color="text-muted-foreground"/>
                        <Stat value="4.8" label="Score" icon={Star} color="text-[hsl(var(--gold))]"/>
                    </div>
                </div>

                {/* ─── View tabs ─ */}
                <div className="px-4 mb-4">
                    <div className="flex gap-0 p-0.5 bg-secondary/40 ">
                        {(['account', 'photos'] as const).map((v) => (
                            <button key={v} onClick={() => setView(v)}
                                    className={cn(
                                        'flex-1 py-1.5 rounded-[10px] text-[12px] font-bold transition-all duration-200',
                                        view === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                                    )}>
                                {v === 'account' ? 'Account' : 'Photos'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── Account view ─ */}
                <AnimatePresence mode="wait">
                    {view === 'account' ? (
                        <motion.div key="account" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                    className="px-4 space-y-3">
                            {/* Quick actions grid */}
                            <div className="grid grid-cols-3 gap-2">
                                <ActionTile icon={Bot} label="AI King" highlight
                                            onClick={() => navigate('/app/settings')}/>
                                <ActionTile icon={Crown}
                                            label={isPremium ? (currentPlan?.toUpperCase() || 'PRO') : 'Upgrade'}
                                            onClick={() => navigate('/app/settings/subscription')}/>
                                <ActionTile icon={Settings} label="Settings" onClick={() => navigate('/app/settings')}/>
                                <ActionTile icon={Bell} label="Notifications"
                                            onClick={() => navigate('/app/notifications')}/>
                                <ActionTile icon={Shield} label="Privacy" onClick={() => navigate('/app/safety')}/>
                                <ActionTile icon={Lock} label="Security"
                                            onClick={() => navigate('/app/settings/security')}/>
                            </div>

                            {/* Profile quick-edit links */}
                            {[
                                {
                                    label: 'Edit Basics',
                                    sub: `${profile.display_name || '—'}${profile.age ? `, ${profile.age}` : ''}`,
                                    sheet: 'basics' as EditSheet
                                },
                                {
                                    label: 'My Tribes',
                                    sub: tribes.length ? tribes.join(', ') : 'Not set',
                                    sheet: 'tribes' as EditSheet
                                },
                                {
                                    label: 'Looking For',
                                    sub: lookingFor.length ? lookingFor.join(', ') : 'Not set',
                                    sheet: 'looking-for' as EditSheet
                                },
                                {
                                    label: 'Bio & About',
                                    sub: profile.bio ? `${profile.bio.slice(0, 50)}…` : 'Not set',
                                    sheet: 'about' as EditSheet
                                },
                                {label: 'Privacy', sub: 'Distance, online status', sheet: 'privacy' as EditSheet},
                            ].map(({label, sub, sheet}) => (
                                <motion.button
                                    key={label}
                                    whileTap={{scale: 0.99}}
                                    onClick={() => openEdit(sheet)}
                                    className="w-full flex items-center justify-between px-4 py-3.5  bg-card border border-border/20 hover:border-border/35 transition-colors"
                                >
                                    <div className="text-left min-w-0">
                                        <p className="text-[13px] font-bold">{label}</p>
                                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{sub}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 shrink-0"/>
                                </motion.button>
                            ))}

                            {/* Share + sign out */}
                            <Button
                                variant="outline"
                                className="w-full h-12  font-bold border-border/40 text-[13px]"
                                onClick={() => navigator.share?.({
                                    title: profile.display_name || 'My Profile',
                                    url: window.location.href
                                })}
                            >
                                <Share2 className="w-4 h-4 mr-2"/> Share My Profile
                            </Button>

                            {/* Footer */}
                            <div
                                className="flex items-center justify-between px-1 py-2 text-[11px] text-muted-foreground/40">
                                <span>FindYourKing · Zenith Ω v1.0</span>
                                <button
                                    onClick={signOut}
                                    className="flex items-center gap-1.5 text-destructive/50 hover:text-destructive transition-colors">
                                    <LogOut className="w-3 h-3"/> Sign out
                                </button>
                            </div>

                            <div className="h-4"/>
                        </motion.div>
                    ) : (
                        <motion.div key="photos" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                    className="px-4 pb-8">
                            <PhotoGrid userId={user?.id || ''}/>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ─── Edit Sheets ─ */}

            {/* Photos */}
            <Sheet open={editSheet === 'photos'} onOpenChange={(v) => !v && setEditSheet('none')}>
                <SheetContent side="bottom"
                              className="h-[92dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/20">
                    <Handle/>
                    <div className="px-5 pt-1 pb-2"><SheetTitle className="text-[17px] font-black">My
                        Photos</SheetTitle></div>
                    <div className="px-5 pb-10"><PhotoGrid userId={user?.id || ''}/></div>
                </SheetContent>
            </Sheet>

            {/* Basics */}
            <Sheet open={editSheet === 'basics'} onOpenChange={(v) => !v && setEditSheet('none')}>
                <SheetContent side="bottom"
                              className="h-[92dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/20">
                    <Handle/>
                    <div className="px-5 pt-1 pb-2"><SheetTitle className="text-[17px] font-black">Edit
                        Profile</SheetTitle></div>
                    <div className="px-5 pb-10 space-y-4">
                        {[
                            {key: 'display_name', label: 'Display Name', type: 'text', ph: 'Your name'},
                            {key: 'age', label: 'Age', type: 'number', ph: '25'},
                            {key: 'city', label: 'City', type: 'text', ph: 'London, UK'},
                            {key: 'height', label: 'Height (cm)', type: 'number', ph: '180'},
                            {key: 'weight', label: 'Weight (kg)', type: 'number', ph: '75'},
                        ].map(({key, label, type, ph}) => (
                            <div key={key} className="space-y-1.5">
                                <Label
                                    className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">{label}</Label>
                                <Input
                                    type={type} placeholder={ph}
                                    value={String(editForm[key] || '')}
                                    onChange={(e) => upd(key, type === 'number' ? (Number(e.target.value) || '') : e.target.value)}
                                    className="h-12  bg-secondary/40 border-border/25 text-[13px]"
                                />
                            </div>
                        ))}
                        <div className="space-y-1.5">
                            <Label
                                className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">Position</Label>
                            <div className="flex flex-wrap gap-2">
                                {POSITIONS.map((p) => {
                                    const active = editForm.position === p;
                                    return (
                                        <button key={p} onClick={() => upd('position', active ? '' : p)}
                                                className={cn(
                                                    'px-3 py-1.5  text-[12px] font-bold border transition-all',
                                                    active ? 'bg-primary text-primary-foreground border-primary' : 'border-border/40 text-muted-foreground',
                                                )}>
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <SaveRow/>
                    </div>
                </SheetContent>
            </Sheet>

            {/* About/Bio */}
            <Sheet open={editSheet === 'about'} onOpenChange={(v) => !v && setEditSheet('none')}>
                <SheetContent side="bottom"
                              className="h-[80dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/20">
                    <Handle/>
                    <div className="px-5 pt-1 pb-2"><SheetTitle className="text-[17px] font-black">Bio &
                        About</SheetTitle></div>
                    <div className="px-5 pb-10 space-y-4">
                        <div className="space-y-1.5">
                            <Label
                                className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.1em]">Bio</Label>
                            <Textarea
                                placeholder="Tell people about yourself, your interests, what you're looking for…"
                                value={String(editForm.bio || '')}
                                onChange={(e) => upd('bio', e.target.value)}
                                className="min-h-[120px]  bg-secondary/40 border-border/25 text-[13px] resize-none"
                            />
                            <p className="text-[10px] text-muted-foreground text-right">{String(editForm.bio || '').length}/500</p>
                        </div>
                        <SaveRow/>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Tribes */}
            <Sheet open={editSheet === 'tribes'} onOpenChange={(v) => !v && setEditSheet('none')}>
                <SheetContent side="bottom"
                              className="h-[80dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/20">
                    <Handle/>
                    <div className="px-5 pt-1 pb-2"><SheetTitle className="text-[17px] font-black">My
                        Tribes</SheetTitle></div>
                    <div className="px-5 pb-10 space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {TRIBES.map((tribe) => {
                                const active = ((editForm.tribes as string[]) || []).includes(tribe);
                                return (
                                    <button key={tribe} onClick={() => toggleArr('tribes', tribe)}
                                            className={cn(
                                                'px-3.5 py-2  text-[12px] font-bold border transition-all',
                                                active
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_hsl(var(--primary)/0.35)]'
                                                    : 'border-border/40 text-muted-foreground hover:border-primary/30',
                                            )}>
                                        {tribe}
                                    </button>
                                );
                            })}
                        </div>
                        <SaveRow/>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Looking For */}
            <Sheet open={editSheet === 'looking-for'} onOpenChange={(v) => !v && setEditSheet('none')}>
                <SheetContent side="bottom"
                              className="h-[72dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/20">
                    <Handle/>
                    <div className="px-5 pt-1 pb-2"><SheetTitle className="text-[17px] font-black">Looking
                        For</SheetTitle></div>
                    <div className="px-5 pb-10 space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {LOOKING_FOR.map((l) => {
                                const active = ((editForm.looking_for as string[]) || []).includes(l);
                                return (
                                    <button key={l} onClick={() => toggleArr('looking_for', l)}
                                            className={cn(
                                                'px-3.5 py-2  text-[12px] font-bold border transition-all',
                                                active
                                                    ? 'bg-primary text-primary-foreground border-primary shadow-[0_0_10px_hsl(var(--primary)/0.35)]'
                                                    : 'border-border/40 text-muted-foreground',
                                            )}>
                                        {l}
                                    </button>
                                );
                            })}
                        </div>
                        <SaveRow/>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Privacy */}
            <Sheet open={editSheet === 'privacy'} onOpenChange={(v) => !v && setEditSheet('none')}>
                <SheetContent side="bottom"
                              className="h-[65dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/20">
                    <Handle/>
                    <div className="px-5 pt-1 pb-2"><SheetTitle className="text-[17px] font-black">Privacy</SheetTitle>
                    </div>
                    <div className="px-5 pb-10 space-y-3">
                        {[
                            {key: 'show_distance', label: 'Show distance', sub: 'Others can see how far you are'},
                            {key: 'show_online', label: 'Show online status', sub: 'Others see when you\'re active'},
                            {key: 'incognito', label: 'Incognito mode', sub: 'Browse without being seen'},
                        ].map(({key, label, sub}) => (
                            <div key={key}
                                 className="flex items-center justify-between p-4  bg-secondary/20 border border-border/20">
                                <div>
                                    <p className="text-[13px] font-bold">{label}</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
                                </div>
                                <Switch
                                    checked={!!(editForm[key])}
                                    onCheckedChange={(v) => upd(key, v)}
                                />
                            </div>
                        ))}
                        <SaveRow/>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
import {useNavigate} from 'react-router-dom';
import {Camera, ChevronLeft, Plus} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useAuth} from '@/hooks/useAuth';

export default function ProfilePhotosPage() {
    const navigate = useNavigate();
    const {user} = useAuth();

    return (
        <div className="min-h-screen bg-background pb-28">
            <header
                className="sticky top-0 z-40 glass-heavy border-b border-[hsl(var(--glass-border))] px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full"
                        onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5"/></Button>
                <h1 className="text-lg font-bold flex items-center gap-2"><Camera className="w-5 h-5 text-primary"/>My
                    Photos</h1>
            </header>

            <div className="px-4 py-5">
                <p className="text-sm text-muted-foreground mb-4">Up to 9 photos. Drag to reorder. Star to set as
                    primary.</p>
                <div className="grid grid-cols-3 gap-2">
                    <label
                        className="aspect-square rounded-2xl border-2 border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                        <Plus className="w-6 h-6 text-muted-foreground mb-1"/>
                        <span className="text-xs text-muted-foreground">Add Photo</span>
                        <input type="file" accept="image/*" className="hidden"/>
                    </label>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-6">Photos are stored securely and only
                    visible per your privacy settings.</p>
            </div>
        </div>
    );
}
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
