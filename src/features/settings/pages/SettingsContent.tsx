import {Settings} from 'lucide-react';
import SubPageShell from './SubPageShell';
import {Switch} from '@/components/ui/switch';
import {useState} from 'react';

export default function SettingsContent() {
    const [s, setS] = useState({explicitContent: true, safeSearch: false, showNSFW: true});
    const upd = (k: string, v: boolean) => setS(p => ({...p, [k]: v}));
    return (
        <SubPageShell title="Content" icon={Settings}>
            <p className="text-sm text-muted-foreground">Control what content you see in your feed and grid.</p>
            {[
                {
                    key: 'explicitContent',
                    label: 'Show explicit profile photos',
                    desc: 'NSFW photos from verified profiles'
                },
                {key: 'safeSearch', label: 'Safe search', desc: 'Filter potentially sensitive content'},
            ].map(({key, label, desc}) => (
                <div key={key} className="flex items-center justify-between p-4  bg-card border border-border/40">
                    <div className="flex-1 mr-4"><p className="font-semibold text-sm">{label}</p><p
                        className="text-xs text-muted-foreground mt-0.5">{desc}</p></div>
                    <Switch checked={s[key as keyof typeof s]} onCheckedChange={v => upd(key, v)}/>
                </div>
            ))}
        </SubPageShell>
    );
}
