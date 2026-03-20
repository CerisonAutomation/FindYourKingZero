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
