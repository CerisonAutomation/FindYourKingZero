import {useNavigate} from 'react-router-dom';
import {useState, useEffect, useCallback} from 'react';
import {ChevronLeft, Plus, MapPin, Calendar, Clock, Users, AlertCircle, Upload, X, Eye, EyeOff} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Switch} from '@/components/ui/switch';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Card, CardContent} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {EVENT_TYPES, useCreateEvent} from '@/hooks/useEvents';
import {cn, formatDateTime, debounce, isValidUrl} from '@/lib/utils';
import {useToast} from '@/hooks/use-toast';
import {useAI} from '@/hooks/useAI';

export default function CreateEvent() {
    const navigate = useNavigate();
    const createEvent = useCreateEvent();
    const {toast} = useToast();
    const {generateBioSuggestion, isLoading: aiLoading} = useAI();

    const [form, setForm] = useState({
        title: '',
        description: '',
        event_type: 'meetup',
        location: '',
        event_date: '',
        start_time: '',
        end_time: '',
        max_attendees: 10,
        is_party: false,
        is_private: false,
        requires_approval: false,
        price: 0,
        tags: [] as string[],
        images: [] as string[],
        rules: '',
        contact_info: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isDraft, setIsDraft] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [completionProgress, setCompletionProgress] = useState(0);

    const upd = (k: string, v: unknown) => {
        setForm(p => ({...p, [k]: v}));
        if (errors[k]) {
            setErrors(p => ({...p, [k]: ''}));
        }
    };

    // Calculate completion progress
    useEffect(() => {
        const requiredFields = ['title', 'description', 'location', 'event_date', 'start_time'];
        const completedRequired = requiredFields.filter(field => form[field as keyof typeof form]).length;
        const optionalFields = ['end_time', 'tags', 'images', 'rules'];
        const completedOptional = optionalFields.filter(field => {
            const value = form[field as keyof typeof form];
            return Array.isArray(value) ? value.length > 0 : !!value;
        }).length;

        const progress = (completedRequired / requiredFields.length) * 70 + (completedOptional / optionalFields.length) * 30;
        setCompletionProgress(Math.round(progress));
    }, [form]);

    // Validation
    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!form.title.trim()) newErrors.title = 'Title is required';
        else if (form.title.length < 3) newErrors.title = 'Title must be at least 3 characters';
        else if (form.title.length > 100) newErrors.title = 'Title must be less than 100 characters';

        if (!form.description.trim()) newErrors.description = 'Description is required';
        else if (form.description.length < 10) newErrors.description = 'Description must be at least 10 characters';
        else if (form.description.length > 2000) newErrors.description = 'Description must be less than 2000 characters';

        if (!form.location.trim()) newErrors.location = 'Location is required';

        if (!form.event_date) newErrors.event_date = 'Date is required';
        else {
            const selectedDate = new Date(form.event_date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) newErrors.event_date = 'Date cannot be in the past';
        }

        if (!form.start_time) newErrors.start_time = 'Start time is required';

        if (form.end_time && form.start_time && form.end_time <= form.start_time) {
            newErrors.end_time = 'End time must be after start time';
        }

        if (form.max_attendees < 2) newErrors.max_attendees = 'Minimum 2 attendees required';
        else if (form.max_attendees > 1000) newErrors.max_attendees = 'Maximum 1000 attendees allowed';

        if (form.price < 0) newErrors.price = 'Price cannot be negative';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [form]);

    // Auto-save draft
    const saveDraft = useCallback(
        debounce(() => {
            if (form.title || form.description) {
                localStorage.setItem('event-draft', JSON.stringify(form));
                setIsDraft(true);
            }
        }, 2000),
        [form]
    );

    useEffect(() => {
        saveDraft();
    }, [form, saveDraft]);

    // Load draft on mount
    useEffect(() => {
        const draft = localStorage.getItem('event-draft');
        if (draft) {
            try {
                const draftData = JSON.parse(draft);
                setForm(draftData);
                setIsDraft(true);
            } catch (error) {
                console.error('Failed to load draft:', error);
            }
        }
    }, []);

    // AI enhancement
    const enhanceDescription = async () => {
        if (!form.description.trim()) return;

        try {
            const enhanced = await generateBioSuggestion([], ['event description']);
            if (enhanced) {
                upd('description', enhanced);
                toast({
                    title: 'Description enhanced',
                    description: 'AI has improved your event description',
                });
            }
        } catch (error) {
            toast({
                title: 'Enhancement failed',
                description: 'Could not enhance description',
                variant: 'destructive',
            });
        }
    };

    // Tag management
    const addTag = () => {
        const tag = tagInput.trim().toLowerCase();
        if (tag && !form.tags.includes(tag) && form.tags.length < 10) {
            upd('tags', [...form.tags, tag]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        upd('tags', form.tags.filter(tag => tag !== tagToRemove));
    };

    // Image management
    const addImage = (url: string) => {
        if (isValidUrl(url) && form.images.length < 5) {
            upd('images', [...form.images, url]);
        }
    };

    const removeImage = (index: number) => {
        upd('images', form.images.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast({
                title: 'Validation Error',
                description: 'Please fix the errors below',
                variant: 'destructive',
            });
            return;
        }

        const eventData = {
            ...form,
            event_type: form.is_party ? 'party' : form.event_type,
            tags: form.tags.join(','),
            images: form.images.join(','),
        };

        createEvent.mutate(eventData, {
            onSuccess: () => {
                localStorage.removeItem('event-draft');
                toast({
                    title: 'Event created!',
                    description: 'Your event has been successfully created',
                });
                navigate('/app/events');
            },
            onError: (error) => {
                toast({
                    title: 'Creation failed',
                    description: error.message || 'Failed to create event',
                    variant: 'destructive',
                });
            },
        });
    };

    const clearDraft = () => {
        localStorage.removeItem('event-draft');
        setIsDraft(false);
        toast({
            title: 'Draft cleared',
            description: 'Event draft has been removed',
        });
    };

    return (
        <div className="min-h-screen bg-background pb-28">
            <header className="sticky top-0 z-40 glass-heavy border-b border-[hsl(var(--glass-border))] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full" onClick={() => navigate(-1)}>
                        <ChevronLeft className="w-5 h-5"/>
                    </Button>
                    <div>
                        <h1 className="text-lg font-bold">Create Event</h1>
                        <div className="flex items-center gap-2">
                            <Progress value={completionProgress} className="w-20 h-1"/>
                            <span className="text-xs text-muted-foreground">{completionProgress}%</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                        {showPreview ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                    </Button>
                    {isDraft && (
                        <Button variant="ghost" size="sm" onClick={clearDraft}>
                            <X className="w-4 h-4"/>
                        </Button>
                    )}
                </div>
            </header>

            {isDraft && (
                <Alert className="mx-4 mt-4">
                    <AlertCircle className="h-4 w-4"/>
                    <AlertDescription>
                        You have a saved draft. It will be automatically saved as you type.
                    </AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="px-4 py-5 space-y-6">
                {/* Party Mode Toggle */}
                <Card className="p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-semibold text-sm">Party Mode</p>
                            <p className="text-xs text-muted-foreground">Address hidden · Safety features active</p>
                        </div>
                        <Switch checked={form.is_party} onCheckedChange={v => upd('is_party', v)}/>
                    </div>
                </Card>

                {/* Event Type Selection */}
                {!form.is_party && (
                    <Card className="p-4">
                        <div className="space-y-3">
                            <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Event Type</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {EVENT_TYPES.filter(t => t.id !== 'party').slice(0, 8).map(type => (
                                    <button key={type.id} type="button" onClick={() => upd('event_type', type.id)}
                                            className={cn('p-2.5 rounded-xl border text-center transition-all',
                                                form.event_type === type.id ? 'border-primary bg-primary/10' : 'border-border/50 bg-card hover:border-primary/40')}>
                                        <span className="text-xl block">{type.icon}</span>
                                        <p className="text-[10px] mt-0.5 truncate text-muted-foreground">{type.label}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                )}

                {/* Basic Information */}
                <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Basic Information</h3>

                    {[
                        {
                            label: 'Title *',
                            key: 'title',
                            placeholder: form.is_party ? 'Saturday night party' : 'Morning gym session',
                            type: 'text'
                        },
                        {
                            label: form.is_party ? 'Venue (hidden from guests)' : 'Location *',
                            key: 'location',
                            placeholder: 'Address or venue name',
                            type: 'text'
                        },
                    ].map(({label, key, placeholder, type}) => (
                        <div key={key} className="space-y-2">
                            <Label className={errors[key] ? 'text-destructive' : ''}>
                                {label}
                                {errors[key] && <span className="text-xs ml-1">({errors[key]})</span>}
                            </Label>
                            <div className="relative">
                                {key === 'location' && <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"/>}
                                <Input
                                    type={type}
                                    placeholder={placeholder}
                                    value={String(form[key as keyof typeof form])}
                                    onChange={e => upd(key, e.target.value)}
                                    required
                                    className={cn('h-11', errors[key] ? 'border-destructive' : '', key === 'location' && 'pl-10')}
                                />
                            </div>
                        </div>
                    ))}

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className={errors.description ? 'text-destructive' : ''}>
                                Description *
                                {errors.description && <span className="text-xs ml-1">({errors.description})</span>}
                            </Label>
                            <Button type="button" variant="ghost" size="sm" onClick={enhanceDescription} disabled={aiLoading}>
                                {aiLoading ? 'Enhancing...' : 'AI Enhance'}
                            </Button>
                        </div>
                        <Textarea
                            placeholder="What should guests expect?"
                            value={form.description}
                            onChange={e => upd('description', e.target.value)}
                            rows={3}
                            className={cn(errors.description ? 'border-destructive' : '')}
                        />
                        <p className="text-xs text-muted-foreground">{form.description.length}/2000 characters</p>
                    </div>
                </Card>

                {/* Date and Time */}
                <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Date and Time</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className={errors.event_date ? 'text-destructive' : ''}>
                                Date *
                                {errors.event_date && <span className="text-xs ml-1">({errors.event_date})</span>}
                            </Label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                                <Input type="date" value={form.event_date}
                                       onChange={e => upd('event_date', e.target.value)}
                                       required className={cn('h-11 pl-10', errors.event_date ? 'border-destructive' : '')}/>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className={errors.start_time ? 'text-destructive' : ''}>
                                Start Time *
                                {errors.start_time && <span className="text-xs ml-1">({errors.start_time})</span>}
                            </Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                                <Input type="time" value={form.start_time}
                                       onChange={e => upd('start_time', e.target.value)}
                                       required className={cn('h-11 pl-10', errors.start_time ? 'border-destructive' : '')}/>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className={errors.end_time ? 'text-destructive' : ''}>
                            End Time
                            {errors.end_time && <span className="text-xs ml-1">({errors.end_time})</span>}
                        </Label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                            <Input type="time" value={form.end_time}
                                   onChange={e => upd('end_time', e.target.value)}
                                   className={cn('h-11 pl-10', errors.end_time ? 'border-destructive' : '')}/>
                        </div>
                    </div>
                </Card>

                {/* Event Settings */}
                <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Event Settings</h3>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className={errors.max_attendees ? 'text-destructive' : ''}>
                                Max Attendees *
                                {errors.max_attendees && <span className="text-xs ml-1">({errors.max_attendees})</span>}
                            </Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground"/>
                                <Select value={String(form.max_attendees)} onValueChange={v => upd('max_attendees', parseInt(v))}>
                                    <SelectTrigger className={cn('h-11 pl-10', errors.max_attendees ? 'border-destructive' : '')}>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[2, 5, 10, 20, 50, 100, 200, 500, 1000].map(n => (
                                            <SelectItem key={n} value={String(n)}>{n} people</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className={errors.price ? 'text-destructive' : ''}>
                                Price ($)
                                {errors.price && <span className="text-xs ml-1">({errors.price})</span>}
                            </Label>
                            <Input type="number" value={form.price || ''}
                                   onChange={e => upd('price', parseFloat(e.target.value) || 0)}
                                   placeholder="0" min="0" step="0.01"
                                   className={cn('h-11', errors.price ? 'border-destructive' : '')}/>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Private Event</p>
                                <p className="text-xs text-muted-foreground">Only visible to invited guests</p>
                            </div>
                            <Switch checked={form.is_private} onCheckedChange={v => upd('is_private', v)}/>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-sm">Require Approval</p>
                                <p className="text-xs text-muted-foreground">Manually approve attendees</p>
                            </div>
                            <Switch checked={form.requires_approval} onCheckedChange={v => upd('requires_approval', v)}/>
                        </div>
                    </div>
                </Card>

                {/* Tags */}
                <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Tags</h3>

                    <div className="flex gap-2">
                        <Input
                            placeholder="Add tags (e.g., music, outdoor, networking)"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                            className="flex-1"
                        />
                        <Button type="button" onClick={addTag} disabled={!tagInput.trim()}>
                            Add
                        </Button>
                    </div>

                    {form.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {form.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                    {tag}
                                    <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)}/>
                                </Badge>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Images */}
                <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Images</h3>

                    <div className="space-y-3">
                        <Input
                            placeholder="Add image URL"
                            value={tagInput}
                            onChange={e => setTagInput(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="button" onClick={() => addImage(tagInput)} disabled={!tagInput.trim() || form.images.length >= 5}>
                            <Upload className="w-4 h-4 mr-2"/>
                            Add Image ({form.images.length}/5)
                        </Button>
                    </div>

                    {form.images.length > 0 && (
                        <div className="grid grid-cols-2 gap-2">
                            {form.images.map((image, index) => (
                                <div key={index} className="relative group">
                                    <img src={image} alt={`Event image ${index + 1}`} className="w-full h-24 object-cover rounded-lg"/>
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeImage(index)}
                                    >
                                        <X className="w-3 h-3"/>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Rules and Guidelines */}
                <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Rules and Guidelines</h3>
                    <Textarea
                        placeholder="House rules, dress code, what to bring, etc."
                        value={form.rules}
                        onChange={e => upd('rules', e.target.value)}
                        rows={3}
                    />
                </Card>

                {/* Contact Information */}
                <Card className="p-4 space-y-4">
                    <h3 className="font-semibold">Contact Information</h3>
                    <Input
                        placeholder="Email or phone for questions"
                        value={form.contact_info}
                        onChange={e => upd('contact_info', e.target.value)}
                    />
                </Card>

                {/* Submit Button */}
                <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 gradient-primary shadow-[0_8px_24px_hsl(var(--primary)/0.25)]"
                    disabled={createEvent.isPending}
                >
                    {createEvent.isPending ? (
                        <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"/>
                    ) : (
                        <>
                            <Plus className="w-4 h-4 mr-2"/>
                            Create {form.is_party ? 'Party' : 'Event'}
                        </>
                    )}
                </Button>
            </form>
        </div>
    );
}
import {useNavigate, useParams} from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Crown,
  Lock,
  MapPin,
  Shield,
  Users,
  X
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {EVENT_TYPES, useEvents, useJoinEvent, useLeaveEvent} from '@/hooks/useEvents';
import {useAuth} from '@/hooks/useAuth';
import {format, parseISO} from 'date-fns';
import {cn} from '@/lib/utils';
import {motion} from 'framer-motion';

export default function EventDetail() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {user} = useAuth();
    const {data: events = []} = useEvents();
    const joinEvent = useJoinEvent();
    const leaveEvent = useLeaveEvent();

    const event = events.find(e => e.id === id);
    if (!event) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-3">
                <p className="text-muted-foreground">Event not found</p>
                <Button variant="outline" onClick={() => navigate('/app/events')}>Back to Events</Button>
            </div>
        </div>
    );

    const eventType = EVENT_TYPES.find(t => t.id === event.event_type);
    const isHost = event.host_id === user?.id;
    const isParty = event.event_type === 'party';
    const isFull = (event.attendee_count || 0) >= event.max_attendees;
    const fillPct = Math.min(100, Math.round(((event.attendee_count || 0) / event.max_attendees) * 100));

    return (
        <div className="min-h-screen bg-background pb-28">
            {/* Hero */}
            <div
                className="relative h-56 bg-gradient-to-br from-secondary via-card to-background flex items-center justify-center">
                <span className="text-9xl drop-shadow-lg">{eventType?.icon || '📅'}</span>
                <button onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 w-10 h-10 rounded-full glass flex items-center justify-center">
                    <ChevronLeft className="w-5 h-5"/>
                </button>
                {isParty && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass">
                        <Shield className="w-4 h-4 text-primary"/>
                        <span className="text-sm font-semibold">Party Safety Active</span>
                    </div>
                )}
            </div>

            <div className="px-4 py-5 space-y-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">{event.title}</h1>
                        <p className="text-muted-foreground text-sm capitalize mt-0.5">{eventType?.label}</p>
                    </div>
                    {event.is_premium_only && (
                        <Badge
                            className="bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))] border-[hsl(var(--gold)/0.3)] shrink-0">
                            <Crown className="w-3 h-3 mr-1"/> VIP
                        </Badge>
                    )}
                </div>

                {/* Party Safety Panel */}
                {isParty && (
                    <motion.div initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}}
                                className="p-4 rounded-2xl bg-primary/5 border border-primary/25 space-y-3">
                        <p className="font-semibold text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary"/> Party Safety Protocol
                        </p>
                        {[
                            {icon: Lock, text: 'Precise address revealed only after host approval'},
                            {icon: Bell, text: 'Safety check-in available on arrival'},
                            {icon: AlertTriangle, text: 'Panic button active for all attendees during the event'},
                        ].map(({icon: Icon, text}) => (
                            <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Icon className="w-3.5 h-3.5 text-primary shrink-0"/>{text}
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        {
                            icon: Calendar,
                            value: event.event_date ? format(parseISO(event.event_date), 'EEE, MMM d') : '—'
                        },
                        {icon: Clock, value: event.start_time?.slice(0, 5) || '—'},
                    ].map(({icon: Icon, value}) => (
                        <div key={value} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40">
                            <Icon className="w-4 h-4 text-muted-foreground"/>
                            <span className="text-sm font-medium">{value}</span>
                        </div>
                    ))}
                </div>

                <div className="p-3 rounded-xl bg-secondary/40 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground"/>
                    {isParty && !isHost
                        ? <span className="text-sm text-muted-foreground italic flex items-center gap-1"><Lock
                            className="w-3 h-3"/> Address unlocked after approval</span>
                        : <span className="text-sm font-medium">{event.location}</span>
                    }
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><Users
                            className="w-4 h-4"/>{event.attendee_count}/{event.max_attendees} attending</span>
                        <span
                            className={cn('font-semibold', fillPct >= 90 ? 'text-destructive' : 'text-muted-foreground')}>{fillPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                        <motion.div initial={{width: 0}} animate={{width: `${fillPct}%`}}
                                    transition={{duration: 0.6, ease: 'easeOut'}}
                                    className={cn('h-full rounded-full', fillPct >= 90 ? 'bg-destructive' : 'bg-gradient-to-r from-primary to-accent')}/>
                    </div>
                </div>

                {event.description && (
                    <div className="p-4 rounded-2xl bg-card border border-border/40">
                        <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
                    </div>
                )}

                {/* Host */}
                <button onClick={() => event.host_id && navigate(`/app/profile/${event.host_id}`)}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/40 w-full text-left hover:border-primary/30">
                    <Avatar className="w-12 h-12 border-2 border-border">
                        <AvatarImage src={event.host?.avatar_url || ''}/>
                        <AvatarFallback>{event.host?.display_name?.[0] || 'H'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{event.host?.display_name || 'Host'}</p>
                        <p className="text-xs text-muted-foreground">Event host</p>
                    </div>
                </button>

                {/* CTA */}
                {!isHost && (
                    event.is_attending
                        ? <Button variant="outline" size="lg"
                                  className="w-full h-14 text-destructive border-destructive/30"
                                  onClick={() => leaveEvent.mutate(event.id)}>
                            <X className="w-5 h-5 mr-2"/> Leave Event
                        </Button>
                        : <Button size="lg"
                                  className="w-full h-14 gradient-primary shadow-[0_8px_32px_hsl(var(--primary)/0.25)]"
                                  disabled={isFull} onClick={() => joinEvent.mutate(event.id)}>
                            <Check
                                className="w-5 h-5 mr-2"/>{isParty ? 'Request to Join' : isFull ? 'Event Full' : 'Join Event'}
                        </Button>
                )}
            </div>
        </div>
    );
}
import {memo, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  ChevronRight,
  Clock,
  Dumbbell,
  Film,
  Gamepad2,
  Lock,
  Map,
  MapPin,
  Music,
  Plus,
  RefreshCw,
  Shield,
  TreePine,
  Users,
  Utensils,
  Wine,
  X,
  Zap,
} from 'lucide-react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Sheet, SheetContent, SheetTitle} from '@/components/ui/sheet';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Switch} from '@/components/ui/switch';
import {Event, EVENT_TYPES, useCreateEvent, useEvents, useJoinEvent, useLeaveEvent} from '@/hooks/useEvents';
import {useAuth} from '@/hooks/useAuth';
import {useLocaleStore} from '@/stores/useLocaleStore';
import {cn} from '@/lib/utils';
import {format, isToday, isTomorrow, parseISO} from 'date-fns';

type EventTab = 'discover' | 'attending' | 'hosting';

const CATEGORY_TABS = [
    {id: 'all', label: 'All', icon: Zap},
    {id: 'gym', label: 'Gym', icon: Dumbbell},
    {id: 'cinema', label: 'Cinema', icon: Film},
    {id: 'meetup', label: 'Meetup', icon: Users},
    {id: 'drinks', label: 'Drinks', icon: Wine},
    {id: 'food', label: 'Food', icon: Utensils},
    {id: 'music', label: 'Music', icon: Music},
    {id: 'outdoor', label: 'Outdoors', icon: TreePine},
    {id: 'gaming', label: 'Gaming', icon: Gamepad2},
];

const VIBE_TAGS = ['Chill', 'Social', 'Gaming', 'Music', 'Drinks', 'Movies', 'Outdoors', 'Fitness', 'Food', 'Art'];

const formatDate = (d?: string) => {
    if (!d) return '—';
    const date = parseISO(d);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEE d MMM');
};

// ─── Event List Card (mirroring screenshot style) ─────────────────────────
const EventListCard = memo(({event, onDetail, currentUserId}: {
    event: Event; onDetail: (e: Event) => void; currentUserId?: string;
}) => {
    const isParty = event.event_type === 'party';
    const isHost = event.host_id === currentUserId;
    const hostName = event.host?.display_name || 'Host';
    const hostAvatar = event.host?.avatar_url;

    return (
        <motion.div
            initial={{opacity: 0, y: 8}}
            animate={{opacity: 1, y: 0}}
            whileTap={{scale: 0.99}}
            onClick={() => onDetail(event)}
            className="mx-3 mb-2 cursor-pointer active:opacity-80 transition-opacity"
        >
            {/* ── Main content — borderless row, premium hospitality style ── */}
            <div className="flex gap-3 py-3 border-b border-border/12">

                {/* Host avatar */}
                <div className="relative shrink-0 mt-0.5">
                    <Avatar className="w-10 h-10" style={{borderRadius: '6px'}}>
                        <AvatarImage src={hostAvatar || ''} style={{borderRadius: '5px'}}/>
                        <AvatarFallback
                            className="text-sm font-bold bg-secondary"
                            style={{borderRadius: '5px'}}
                        >
                            {hostName[0]}
                        </AvatarFallback>
                    </Avatar>
                    {(event.host as any)?.is_online && (
                        <span
                            className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-background"
                        />
                    )}
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                    {/* Host + party badge */}
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-muted-foreground">{hostName}</span>
                        {isParty && (
                            <span
                                className="flex items-center gap-0.5 text-[8.5px] font-black text-primary uppercase tracking-wide"
                                style={{
                                    background: 'hsl(var(--primary)/0.08)',
                                    borderRadius: '3px',
                                    padding: '1px 5px'
                                }}
                            >
                <Shield className="w-2 h-2"/> Safe
              </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="text-[13.5px] font-black leading-snug">{event.title}</h3>

                    {/* Description */}
                    {event.description && (
                        <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 line-clamp-1">
                            {event.description}
                        </p>
                    )}

                    {/* Meta + tags row */}
                    <div className="flex items-center flex-wrap gap-2.5 mt-1.5 text-[10.5px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5"/>
                {formatDate(event.event_date)} · {event.start_time?.slice(0, 5)}
            </span>
                        <span className="flex items-center gap-1">
              <Users className="w-2.5 h-2.5"/>
                            {event.attendee_count}/{event.max_attendees}
            </span>
                        {event.location && (
                            <span className="flex items-center gap-1 truncate max-w-[90px]">
                <MapPin className="w-2.5 h-2.5 shrink-0"/>
                                {isParty && !isHost
                                    ? <span className="flex items-center gap-0.5"><Lock
                                        className="w-2 h-2"/> Hidden</span>
                                    : <span className="truncate">{event.location}</span>
                                }
              </span>
                        )}
                        {(event as any).vibe_tags?.slice(0, 2).map((tag: string) => (
                            <span
                                key={tag}
                                className="text-[9.5px] font-semibold text-muted-foreground/70"
                                style={{
                                    background: 'hsl(var(--secondary)/0.5)',
                                    borderRadius: '3px',
                                    padding: '1px 5px'
                                }}
                            >
                {tag}
              </span>
                        ))}
                    </div>

                    {event.is_attending && (
                        <div className="flex items-center gap-1 mt-1.5 text-emerald-500">
                            <Check className="w-3 h-3"/>
                            <span className="text-[10.5px] font-bold">Going</span>
                        </div>
                    )}
                </div>

                {/* Chevron */}
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30 shrink-0 self-center"/>
            </div>
        </motion.div>
    );
});
EventListCard.displayName = 'EventListCard';

// ─── Event Detail Sheet ───────────────────────────────────────────────────
function EventDetailSheet({event, open, onOpenChange, onJoin, onLeave, currentUserId}: {
    event: Event | null; open: boolean; onOpenChange: (v: boolean) => void;
    onJoin: (id: string) => void; onLeave: (id: string) => void;
    currentUserId?: string;
}) {
    const navigate = useNavigate();
    if (!event) return null;
    const eventType = EVENT_TYPES.find(t => t.id === event.event_type);
    const isHost = event.host_id === currentUserId;
    const isParty = event.event_type === 'party';
    const isFull = (event.attendee_count || 0) >= event.max_attendees;
    const fillPct = Math.min(100, Math.round(((event.attendee_count || 0) / event.max_attendees) * 100));

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom"
                          className="h-[94dvh] rounded-t-3xl overflow-y-auto p-0 bg-background border-border/30">
                <div className="flex justify-center pt-3.5 pb-1">
                    <div className="w-9 h-1 rounded-full bg-border"/>
                </div>

                {/* Hero */}
                <div className="relative h-48 overflow-hidden"
                     style={{background: 'linear-gradient(135deg, hsl(var(--primary)/0.2), hsl(var(--accent)/0.12), hsl(var(--secondary)))'}}>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[90px] opacity-25 select-none">{eventType?.icon || '📅'}</span>
                    </div>
                    {isParty && (
                        <div
                            className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5  bg-black/50 backdrop-blur-md border border-primary/30">
                            <Shield className="w-3.5 h-3.5 text-primary"/>
                            <span className="text-xs font-bold text-primary">Party Safety Active</span>
                        </div>
                    )}
                    {event.is_premium_only && (
                        <div className="absolute top-4 right-4 px-3 py-1.5  bg-black/50 backdrop-blur-md border"
                             style={{borderColor: 'hsl(var(--gold)/0.4)'}}>
                            <span className="text-xs font-bold" style={{color: 'hsl(var(--gold))'}}>👑 VIP Only</span>
                        </div>
                    )}
                </div>

                <div className="p-5 space-y-4 pb-10">
                    <div>
                        <h2 className="text-[22px] font-black">{event.title}</h2>
                        <p className="text-sm text-muted-foreground capitalize">{eventType?.label}</p>
                    </div>

                    {/* Party Safety Protocol */}
                    {isParty && (
                        <div className="p-4  bg-primary/5 border border-primary/15 space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
                                    <Shield className="w-3.5 h-3.5 text-primary"/>
                                </div>
                                <p className="font-black text-sm">Party Safety Protocol</p>
                            </div>
                            <div className="space-y-2">
                                {[
                                    {icon: Lock, text: 'Precise address revealed only after host approval'},
                                    {icon: Bell, text: 'Safety check-in available on arrival'},
                                    {icon: AlertTriangle, text: 'Emergency panic button active during event'},
                                    {icon: Shield, text: 'All attendees are ID-verified users'},
                                ].map(({icon: Icon, text}) => (
                                    <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                                        <Icon className="w-3.5 h-3.5 shrink-0 text-primary"/> {text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                        {[
                            {
                                icon: Calendar,
                                value: event.event_date ? format(parseISO(event.event_date), 'EEEE, MMM d') : '—'
                            },
                            {
                                icon: Clock,
                                value: `${event.start_time?.slice(0, 5)}${event.end_time ? ` – ${event.end_time.slice(0, 5)}` : ''}`
                            },
                        ].map(({icon: Icon, value}) => (
                            <div key={value} className="flex items-center gap-2 p-3  bg-secondary/40">
                                <Icon className="w-4 h-4 text-muted-foreground shrink-0"/>
                                <span className="text-sm font-semibold">{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2.5 p-3  bg-secondary/40">
                        <MapPin className="w-4 h-4 text-muted-foreground shrink-0"/>
                        {isParty && !isHost ? (
                            <span className="text-sm text-muted-foreground/60 italic flex items-center gap-1">
                <Lock className="w-3 h-3"/> Unlocked after approval
              </span>
                        ) : (
                            <span className="text-sm font-semibold">{event.location}</span>
                        )}
                    </div>

                    {/* Capacity bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="w-3.5 h-3.5"/>{event.attendee_count} / {event.max_attendees} attending
              </span>
                            <span
                                className={cn('font-bold', fillPct >= 90 ? 'text-destructive' : 'text-muted-foreground')}>{fillPct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-border overflow-hidden">
                            <motion.div
                                initial={{width: 0}} animate={{width: `${fillPct}%`}}
                                transition={{duration: 0.7, ease: 'easeOut'}}
                                className={cn('h-full rounded-full', fillPct >= 90 ? 'bg-destructive' : 'gradient-primary')}
                            />
                        </div>
                    </div>

                    {event.description && (
                        <div className="p-4  bg-card border border-border/25">
                            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">About</p>
                            <p className="text-sm leading-relaxed">{event.description}</p>
                        </div>
                    )}

                    {/* Host */}
                    <button
                        onClick={() => {
                            event.host_id && navigate(`/app/profile/${event.host_id}`);
                            onOpenChange(false);
                        }}
                        className="flex items-center gap-3 p-4  bg-card border border-border/25 w-full text-left hover:border-primary/25 active:scale-[0.99] transition-all"
                    >
                        <Avatar className="w-12 h-12 border-2 border-border/40">
                            <AvatarImage src={event.host?.avatar_url || ''}/>
                            <AvatarFallback
                                className="text-lg font-bold">{event.host?.display_name?.[0] || 'H'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm">{event.host?.display_name || 'Host'}</p>
                            <p className="text-xs text-muted-foreground">Event host</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                    </button>

                    {/* CTA */}
                    {!isHost && (
                        event.is_attending ? (
                            <button onClick={() => {
                                onLeave(event.id);
                                onOpenChange(false);
                            }}
                                    className="w-full h-14  border-2 border-destructive/30 text-destructive font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                                <X className="w-5 h-5"/> Leave Event
                            </button>
                        ) : (
                            <button disabled={isFull} onClick={() => {
                                onJoin(event.id);
                                onOpenChange(false);
                            }}
                                    className="w-full h-14  gradient-primary shadow-[0_6px_28px_hsl(var(--primary)/0.35)] font-bold text-primary-foreground flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-50">
                                <Check className="w-5 h-5"/>
                                {isParty ? 'Request to Join' : isFull ? 'Event is Full' : 'Join Event'}
                            </button>
                        )
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ─── Create Event Sheet ────────────────────────────────────────────────────
function CreateEventSheet({open, onClose}: { open: boolean; onClose: () => void }) {
    const createEvent = useCreateEvent();
    const [form, setForm] = useState({
        title: '', description: '', event_type: 'meetup',
        location: '', event_date: '', start_time: '',
        max_attendees: 20, is_party: false, visibility: 'public',
        vibe_tags: [] as string[],
    });
    const upd = (k: string, v: unknown) => setForm(p => ({...p, [k]: v}));
    const toggleTag = (tag: string) => setForm(p => ({
        ...p, vibe_tags: p.vibe_tags.includes(tag) ? p.vibe_tags.filter(t => t !== tag) : [...p.vibe_tags, tag],
    }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createEvent.mutate({
            ...form,
            event_type: form.is_party ? 'party' : form.event_type,
        }, {onSuccess: onClose});
    };

    return (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
            <SheetContent side="bottom" className="h-[95dvh] rounded-t-3xl overflow-y-auto p-0 bg-background">
                <div className="flex justify-center pt-3.5 pb-1">
                    <div className="w-9 h-1 rounded-full bg-border"/>
                </div>
                <div className="px-5 pb-2 pt-1">
                    <SheetTitle className="text-lg font-black">Create Chill Session</SheetTitle>
                </div>
                <form onSubmit={handleSubmit} className="px-5 pb-10 space-y-5">
                    {/* What's the vibe */}
                    <Input
                        placeholder="What's the vibe?"
                        value={form.title}
                        onChange={(e) => upd('title', e.target.value)}
                        className="h-12 text-sm bg-secondary/40 border-border/30  font-semibold"
                        required
                    />

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-semibold">Description</Label>
                        <Textarea
                            placeholder="Tell people what to expect…"
                            value={form.description}
                            onChange={(e) => upd('description', e.target.value)}
                            className="min-h-[100px]  bg-secondary/40 border-border/30 text-sm resize-none"
                        />
                    </div>

                    {/* Vibe Tags */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Vibe Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {VIBE_TAGS.map((tag) => {
                                const active = form.vibe_tags.includes(tag);
                                return (
                                    <button key={tag} type="button" onClick={() => toggleTag(tag)}
                                            className={cn(
                                                'px-3.5 py-1.5  text-sm font-semibold border transition-all',
                                                active ? 'gradient-primary text-white border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/40'
                                            )}>
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Date / Time */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label className="flex items-center gap-1.5 text-sm font-semibold">
                                <Clock className="w-3.5 h-3.5"/> Date *
                            </Label>
                            <Input type="date" value={form.event_date}
                                   onChange={(e) => upd('event_date', e.target.value)}
                                   className="h-11  bg-secondary/40 border-border/30 text-sm" required/>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-sm font-semibold">Time *</Label>
                            <Input type="time" value={form.start_time}
                                   onChange={(e) => upd('start_time', e.target.value)}
                                   className="h-11  bg-secondary/40 border-border/30 text-sm" required/>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-sm font-semibold">
                            <MapPin className="w-3.5 h-3.5"/> Location
                        </Label>
                        <Input
                            placeholder="Where's the spot?"
                            value={form.location}
                            onChange={(e) => upd('location', e.target.value)}
                            className="h-11  bg-secondary/40 border-border/30 text-sm"
                        />
                    </div>

                    {/* Max attendees */}
                    <div className="space-y-1.5">
                        <Label className="flex items-center gap-1.5 text-sm font-semibold">
                            <Users className="w-3.5 h-3.5"/> Max Attendees: {form.max_attendees}
                        </Label>
                        <Input type="range" min={2} max={200} value={form.max_attendees}
                               onChange={(e) => upd('max_attendees', Number(e.target.value))}
                               className="w-full"/>
                    </div>

                    {/* Party toggle */}
                    <div className="flex items-center justify-between p-4  bg-card border border-border/30">
                        <div>
                            <p className="font-bold text-sm flex items-center gap-1.5">
                                <Shield className="w-3.5 h-3.5 text-primary"/> House Party Mode
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">Enables safety protocol & address
                                gating</p>
                        </div>
                        <Switch checked={form.is_party} onCheckedChange={(v) => upd('is_party', v)}/>
                    </div>

                    <button
                        type="submit"
                        disabled={createEvent.isPending || !form.title || !form.event_date || !form.start_time}
                        className="w-full h-14  gradient-primary shadow-[0_4px_24px_hsl(var(--primary)/0.4)] font-black text-primary-foreground flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                        {createEvent.isPending ? (
                            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"/>
                        ) : (
                            <><Plus className="w-5 h-5"/> Create Session</>
                        )}
                    </button>
                </form>
            </SheetContent>
        </Sheet>
    );
}

// ─── Main EventsHub ────────────────────────────────────────────────────────
export default function EventsHub() {
    const navigate = useNavigate();
    const {user} = useAuth();
    const {t} = useLocaleStore();
    const eventsQuery = useEvents();
    const {isLoading, refetch} = eventsQuery;
    const joinEvent = useJoinEvent();
    const leaveEvent = useLeaveEvent();

    const [tab, setTab] = useState<EventTab>('discover');
    const [category, setCategory] = useState('all');
    const [createOpen, setCreateOpen] = useState(false);
    const [detailEvent, setDetailEvent] = useState<Event | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const categoryRef = useRef<HTMLDivElement>(null);

    const openDetail = (event: Event) => {
        setDetailEvent(event);
        setDetailOpen(true);
    };

    const allEvents = eventsQuery.data || [];
    const filtered = useMemo(() => {
        let list = [...allEvents];
        if (tab === 'attending') list = list.filter(e => e.is_attending && e.host_id !== user?.id);
        if (tab === 'hosting') list = list.filter(e => e.host_id === user?.id);
        if (category !== 'all') list = list.filter(e => e.event_type === category || (category === 'gym' && e.event_type === 'fitness'));
        return list;
    }, [allEvents, tab, category, user?.id]);

    const nearbyCount = filtered.length;

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">
            {/* ─── Header ─── */}
            <header className="flex-shrink-0 bg-background/95 backdrop-blur-2xl border-b border-border/20 z-40">
                <div className="px-4 pt-4 pb-0">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-[15px] font-black tracking-widest uppercase">{t('events.title')}</h1>
                        <div className="flex gap-2">
                            <button onClick={() => refetch()}
                                    className="w-8 h-8 rounded-full bg-secondary/60 flex items-center justify-center active:rotate-180 transition-transform duration-500">
                                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground"/>
                            </button>
                            <button onClick={() => setCreateOpen(true)}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5  gradient-primary shadow-[0_4px_16px_hsl(var(--primary)/0.35)] text-white text-xs font-black active:scale-95 transition-all">
                                <Plus className="w-3.5 h-3.5"/> {t('events.host')}
                            </button>
                        </div>
                    </div>

                    {/* Main tabs — matching screenshot pill style */}
                    <div className="flex gap-2 pb-3">
                        {(['discover', 'attending', 'hosting'] as EventTab[]).map((t_) => {
                            const labels: Record<EventTab, string> = {
                                discover: t('events.discover'),
                                attending: t('events.attending'),
                                hosting: t('events.hosting'),
                            };
                            const icons: Record<EventTab, React.ReactNode> = {
                                discover: <Sparkles className="w-3.5 h-3.5"/>,
                                attending: <Check className="w-3.5 h-3.5"/>,
                                hosting: <Calendar className="w-3.5 h-3.5"/>,
                            };
                            const isActive = tab === t_;
                            return (
                                <button key={t_} onClick={() => setTab(t_)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-4 py-2  text-xs font-bold border transition-all',
                                            isActive
                                                ? 'gradient-primary text-white border-primary shadow-[0_4px_16px_hsl(var(--primary)/0.3)]'
                                                : 'bg-card border-border/40 text-muted-foreground hover:border-primary/30'
                                        )}>
                                    {icons[t_]} {labels[t_]}
                                </button>
                            );
                        })}
                    </div>

                    {/* Category chips */}
                    <div ref={categoryRef} className="flex gap-2 pb-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
                        {CATEGORY_TABS.map(({id, label, icon: Icon}) => {
                            const isActive = category === id;
                            return (
                                <button key={id} onClick={() => setCategory(id)}
                                        className={cn(
                                            'flex items-center gap-1.5 px-3 py-2  border text-[11px] font-bold shrink-0 transition-all',
                                            isActive
                                                ? 'bg-card border-primary/50 text-foreground'
                                                : 'bg-secondary/30 border-border/20 text-muted-foreground hover:border-border/50'
                                        )}>
                                    <Icon className={cn('w-4 h-4', isActive && 'text-primary')}/>
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </header>

            {/* ─── List ─── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide pt-3">
                {/* Nearby count + map button */}
                {tab === 'discover' && !isLoading && (
                    <div className="flex items-center justify-between px-4 mb-3">
                        <p className="text-sm text-muted-foreground">
                            <span className="text-foreground font-bold">{nearbyCount}</span> {t('events.nearby')}
                        </p>
                        <button
                            onClick={() => navigate('/app/right-now/map')}
                            className="flex items-center gap-1.5 px-3.5 py-2  border border-border/40 bg-card text-xs font-bold hover:border-primary/30 active:scale-95 transition-all"
                        >
                            <Map className="w-3.5 h-3.5 text-muted-foreground"/> {t('events.map')}
                        </button>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <div className="px-4 space-y-3">
                            {Array.from({length: 3}).map((_, i) => (
                                <div key={i} className="h-36 bg-card animate-pulse  border border-border/20"/>
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <motion.div key={tab + category} initial={{opacity: 0}} animate={{opacity: 1}}>
                            {filtered.map((event) => (
                                <EventListCard
                                    key={event.id}
                                    event={event}
                                    onDetail={openDetail}
                                    currentUserId={user?.id}
                                />
                            ))}
                            <div className="h-4"/>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{opacity: 0, scale: 0.96}} animate={{opacity: 1, scale: 1}}
                            className="flex flex-col items-center justify-center py-20 px-8 text-center gap-5"
                        >
                            <div className="w-20 h-20  bg-secondary flex items-center justify-center">
                                <Calendar className="w-10 h-10 text-muted-foreground/40"/>
                            </div>
                            <div>
                                <p className="font-black text-base">
                                    {tab === 'hosting' ? 'Not hosting any events' : tab === 'attending' ? 'Not attending any events' : 'No events nearby'}
                                </p>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                                    {tab === 'hosting' ? 'Create your first event to get started' : 'Check back later or create your own!'}
                                </p>
                            </div>
                            <button
                                onClick={() => setCreateOpen(true)}
                                className="flex items-center gap-2 h-12 px-6  gradient-primary shadow-[0_4px_24px_hsl(var(--primary)/0.4)] font-bold text-white active:scale-[0.98] transition-all"
                            >
                                <Plus className="w-4 h-4"/> Host Event
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Sheets */}
            <CreateEventSheet open={createOpen} onClose={() => setCreateOpen(false)}/>
            <EventDetailSheet
                event={detailEvent}
                open={detailOpen}
                onOpenChange={setDetailOpen}
                onJoin={(id) => joinEvent.mutate(id)}
                onLeave={(id) => leaveEvent.mutate(id)}
                currentUserId={user?.id}
            />
        </div>
    );
}

// Missing import for Sparkles
function Sparkles(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" {...props}>
            <path
                d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>
            <path d="M20 3v4"/>
            <path d="M22 5h-4"/>
            <path d="M4 17v2"/>
            <path d="M5 18H3"/>
        </svg>
    );
}
