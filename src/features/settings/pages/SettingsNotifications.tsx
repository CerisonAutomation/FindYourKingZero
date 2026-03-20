import {useState} from 'react';
import {Bell, Smartphone} from 'lucide-react';
import SubPageShell from './SubPageShell';
import {Switch} from '@/components/ui/switch';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {AnimatePresence, motion} from 'framer-motion';

export default function SettingsNotifications() {
    const [s, setS] = useState({
        messages: true,
        matches: true,
        events: true,
        marketing: false,
        push: true,
        quietHours: false,
        quietFrom: '22:00',
        quietTo: '08:00'
    });
    const upd = (k: string, v: boolean | string) => setS(p => ({...p, [k]: v}));
    return (
        <SubPageShell title="Notifications" icon={Bell}>
            <div className="p-4  bg-card border border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"><Smartphone
                        className="w-4 h-4 text-muted-foreground"/></div>
                    <div><p className="font-semibold text-sm">Push Notifications</p><p
                        className="text-xs text-muted-foreground">Receive alerts on your device</p></div>
                </div>
                <Switch checked={s.push} onCheckedChange={v => upd('push', v)}/>
            </div>
            {[
                {key: 'messages', label: 'New Messages', desc: 'When someone sends you a message'},
                {key: 'matches', label: 'Matches & Taps', desc: 'When someone taps or matches you'},
                {key: 'events', label: 'Event Updates', desc: 'RSVP confirmations and changes'},
                {key: 'marketing', label: 'Promotions', desc: 'App news and special offers'},
            ].map(({key, label, desc}) => (
                <div key={key} className="flex items-center justify-between p-4  bg-card border border-border/40">
                    <div className="flex-1 mr-4"><p className="font-semibold text-sm">{label}</p><p
                        className="text-xs text-muted-foreground mt-0.5">{desc}</p></div>
                    <Switch checked={s[key as keyof typeof s] as boolean} onCheckedChange={v => upd(key, v)}
                            disabled={!s.push}/>
                </div>
            ))}
            <div className="p-4  bg-card border border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                    <div><p className="font-semibold text-sm">Quiet Hours</p><p
                        className="text-xs text-muted-foreground mt-0.5">Silence push during this window</p></div>
                    <Switch checked={s.quietHours} onCheckedChange={v => upd('quietHours', v)}/>
                </div>
                <AnimatePresence>
                    {s.quietHours && (
                        <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}}
                                    exit={{height: 0, opacity: 0}} className="overflow-hidden">
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                {[{label: 'From', key: 'quietFrom'}, {label: 'To', key: 'quietTo'}].map(({
                                                                                                             label,
                                                                                                             key
                                                                                                         }) => (
                                    <div key={key} className="space-y-1.5">
                                        <Label className="text-xs">{label}</Label>
                                        <Input type="time" className="h-10" value={s[key as 'quietFrom' | 'quietTo']}
                                               onChange={e => upd(key, e.target.value)}/>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </SubPageShell>
    );
}
