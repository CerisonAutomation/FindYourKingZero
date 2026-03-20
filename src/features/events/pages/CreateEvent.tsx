import {useNavigate} from 'react-router-dom';
import {useState} from 'react';
import {ChevronLeft, Plus} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Switch} from '@/components/ui/switch';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {EVENT_TYPES, useCreateEvent} from '@/hooks/useEvents';
import {cn} from '@/lib/utils';

export default function CreateEvent() {
    const navigate = useNavigate();
    const createEvent = useCreateEvent();
    const [form, setForm] = useState({
        title: '',
        description: '',
        event_type: 'meetup',
        location: '',
        event_date: '',
        start_time: '',
        max_attendees: 10,
        is_party: false
    });
    const upd = (k: string, v: unknown) => setForm(p => ({...p, [k]: v}));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createEvent.mutate({...form, event_type: form.is_party ? 'party' : form.event_type}, {
            onSuccess: () => navigate('/app/events'),
        });
    };

    return (
        <div className="min-h-screen bg-background pb-28">
            <header
                className="sticky top-0 z-40 glass-heavy border-b border-[hsl(var(--glass-border))] px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full" onClick={() => navigate(-1)}>
                    <ChevronLeft className="w-5 h-5"/>
                </Button>
                <h1 className="text-lg font-bold">Create Event</h1>
            </header>

            <form onSubmit={handleSubmit} className="px-4 py-5 space-y-5">
                <div
                    className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/20">
                    <div><p className="font-semibold text-sm">Party Mode</p><p
                        className="text-xs text-muted-foreground">Address hidden · Safety features active</p></div>
                    <Switch checked={form.is_party} onCheckedChange={v => upd('is_party', v)}/>
                </div>

                {!form.is_party && (
                    <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wide">Event
                            Type</Label>
                        <div className="grid grid-cols-4 gap-2">
                            {EVENT_TYPES.filter(t => t.id !== 'party').slice(0, 8).map(type => (
                                <button key={type.id} type="button" onClick={() => upd('event_type', type.id)}
                                        className={cn('p-2.5 rounded-xl border text-center transition-all', form.event_type === type.id ? 'border-primary bg-primary/10' : 'border-border/50 bg-card hover:border-primary/40')}>
                                    <span className="text-xl block">{type.icon}</span>
                                    <p className="text-[10px] mt-0.5 truncate text-muted-foreground">{type.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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
                        <Label>{label}</Label>
                        <Input type={type} placeholder={placeholder} value={String(form[key as keyof typeof form])}
                               onChange={e => upd(key, e.target.value)} required className="h-11"/>
                    </div>
                ))}

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="What should guests expect?" value={form.description}
                              onChange={e => upd('description', e.target.value)} rows={3}/>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Date *</Label><Input type="date" value={form.event_date}
                                                                           onChange={e => upd('event_date', e.target.value)}
                                                                           required className="h-11"/></div>
                    <div className="space-y-2"><Label>Time *</Label><Input type="time" value={form.start_time}
                                                                           onChange={e => upd('start_time', e.target.value)}
                                                                           required className="h-11"/></div>
                </div>

                <div className="space-y-2">
                    <Label>Max Attendees</Label>
                    <Select value={String(form.max_attendees)} onValueChange={v => upd('max_attendees', parseInt(v))}>
                        <SelectTrigger className="h-11"><SelectValue/></SelectTrigger>
                        <SelectContent>{[2, 5, 10, 20, 50, 100].map(n => <SelectItem key={n}
                                                                                     value={String(n)}>{n} people</SelectItem>)}</SelectContent>
                    </Select>
                </div>

                <Button type="submit" size="lg"
                        className="w-full h-12 gradient-primary shadow-[0_8px_24px_hsl(var(--primary)/0.25)]"
                        disabled={createEvent.isPending}>
                    {createEvent.isPending ? <div
                        className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"/> : <>
                        <Plus className="w-4 h-4 mr-2"/>Create {form.is_party ? 'Party' : 'Event'}</>}
                </Button>
            </form>
        </div>
    );
}
