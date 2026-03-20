import {Lock, Mail, Trash2, User} from 'lucide-react';
import SubPageShell from './SubPageShell';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {useAuth} from '@/hooks/useAuth';

export default function SettingsAccount() {
    const {user} = useAuth();
    return (
        <SubPageShell title="Account" icon={User}>
            <div className="p-4  bg-card border border-border/40 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Address</h3>
                <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground"/>
                    <span className="text-sm flex-1">{user?.email}</span>
                    <Badge variant="secondary"
                           className="text-[10px] text-emerald-500 border-emerald-500/20">Verified</Badge>
                </div>
            </div>
            <div className="p-4  bg-card border border-border/40 space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Change Password</h3>
                {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
                    <div key={l} className="space-y-1.5"><Label className="text-sm">{l}</Label><Input type="password"
                                                                                                      placeholder="••••••••"
                                                                                                      className="h-11"/>
                    </div>
                ))}
                <Button className="w-full h-11" variant="outline"><Lock className="w-4 h-4 mr-2"/>Update
                    Password</Button>
            </div>
            <div className="p-4  bg-card border border-destructive/20 space-y-3">
                <h3 className="text-xs font-semibold text-destructive uppercase tracking-wide">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">Deleting your account is permanent after a 30-day recovery
                    window.</p>
                <Button variant="outline"
                        className="w-full h-11 border-destructive/40 text-destructive hover:bg-destructive/10"><Trash2
                    className="w-4 h-4 mr-2"/>Delete Account</Button>
            </div>
        </SubPageShell>
    );
}
