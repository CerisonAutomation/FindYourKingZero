import {Fingerprint, Shield} from 'lucide-react';
import SubPageShell from './SubPageShell';
import {Button} from '@/components/ui/button';

export default function SettingsSecurity() {
    return (
        <SubPageShell title="Security" icon={Shield}>
            <div className="p-4  bg-card border border-border/40 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Two-Factor
                    Authentication</h3>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                <Button variant="outline" className="w-full h-11"><Fingerprint className="w-4 h-4 mr-2"/>Enable
                    2FA</Button>
            </div>
            <div className="p-4  bg-card border border-border/40 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Sessions</h3>
                <p className="text-sm text-muted-foreground">You are signed in on this device.</p>
                <Button variant="outline" className="w-full h-11 text-destructive border-destructive/30">Sign Out All
                    Devices</Button>
            </div>
        </SubPageShell>
    );
}
