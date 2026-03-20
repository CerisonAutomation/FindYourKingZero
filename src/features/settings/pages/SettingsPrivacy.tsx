import {useState} from 'react';
import {Download, ExternalLink, Eye, EyeOff, Globe, MessageCircle} from 'lucide-react';
import SubPageShell from './SubPageShell';
import {Switch} from '@/components/ui/switch';
import {Button} from '@/components/ui/button';
import {useNavigate} from 'react-router-dom';
import {useSubscription} from '@/hooks/useSubscription';
import {Badge} from '@/components/ui/badge';

export default function SettingsPrivacy() {
    const navigate = useNavigate();
    const {isPremium} = useSubscription();
    const [settings, setSettings] = useState({
        showDistance: true,
        showLastActive: true,
        showOnlineStatus: true,
        allowMessageRequests: true,
        incognito: false
    });
    const upd = (k: string, v: boolean) => setSettings(p => ({...p, [k]: v}));
    const rows = [
        {key: 'showDistance', label: 'Show distance to others', icon: Globe},
        {key: 'showLastActive', label: 'Show last active time', icon: Eye},
        {key: 'showOnlineStatus', label: 'Show online status', icon: Eye},
        {key: 'allowMessageRequests', label: 'Allow message requests', icon: MessageCircle},
        {key: 'incognito', label: 'Incognito mode', icon: EyeOff, premium: true},
    ];
    return (
        <SubPageShell title="Privacy" icon={Eye}>
            <div className="space-y-2.5">
                {rows.map(({key, label, icon: Icon, premium}) => (
                    <div key={key} className="flex items-center gap-4 p-4  bg-card border border-border/40">
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-muted-foreground"/></div>
                        <span className="flex-1 text-sm font-medium">{label}</span>
                        {premium && <Badge variant="secondary" className="text-[10px] mr-1">Premium</Badge>}
                        <Switch checked={settings[key as keyof typeof settings] as boolean}
                                onCheckedChange={v => upd(key, v)} disabled={premium && !isPremium}/>
                    </div>
                ))}
            </div>
            <div className="p-4  bg-card border border-border/40 space-y-2.5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data & Privacy</h3>
                <Button variant="outline" className="w-full h-11 justify-start"
                        onClick={() => navigate('/legal/privacy')}><ExternalLink className="w-4 h-4 mr-2"/>Privacy
                    Policy</Button>
                <Button variant="outline" className="w-full h-11 justify-start"><Download className="w-4 h-4 mr-2"/>Export
                    My Data (DSAR)</Button>
            </div>
        </SubPageShell>
    );
}
