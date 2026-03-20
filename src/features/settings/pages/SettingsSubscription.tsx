import {Check, CreditCard, Crown} from 'lucide-react';
import SubPageShell from './SubPageShell';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {useSubscription} from '@/hooks/useSubscription';
import {cn} from '@/lib/utils';

const PLANS = [
    {
        tier: 'premium',
        label: 'Premium',
        price: '$19.99',
        period: '/mo',
        features: ['Unlimited messaging', 'Read receipts', 'Advanced filters', 'Incognito mode', 'Priority search'],
        recommended: true
    },
    {
        tier: 'black',
        label: 'Black',
        price: '$49.99',
        period: '/mo',
        features: ['All Premium', 'Verified badge', 'Featured profile', 'AI assistant', 'Priority support']
    },
];

export default function SettingsSubscription() {
    const {isPremium, currentPlan, planInfo} = useSubscription();
    return (
        <SubPageShell title="Subscription" icon={CreditCard}>
            {isPremium ? (
                <div
                    className="p-6 rounded-2xl bg-gradient-to-br from-primary/15 via-card to-accent/10 border border-primary/30 text-center space-y-4">
                    <div
                        className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-[0_0_32px_hsl(var(--primary)/0.4)]">
                        <Crown className="w-8 h-8 text-primary-foreground"/></div>
                    <div><h3 className="text-xl font-bold">Active Plan</h3><p
                        className="text-muted-foreground text-sm mt-1 capitalize">{currentPlan}</p></div>
                    <Button variant="outline" className="w-full h-11">Manage Billing</Button>
                </div>
            ) : (
                <>
                    <div className="p-4 rounded-2xl bg-secondary/40 border border-border/40 text-center"><p
                        className="text-muted-foreground text-sm">You are on the <strong>Free</strong> plan.</p></div>
                    {PLANS.map(plan => (
                        <div key={plan.tier}
                             className={cn('p-5 rounded-2xl border space-y-4', plan.recommended ? 'border-primary/60 bg-primary/5 shadow-[0_0_24px_hsl(var(--primary)/0.12)]' : 'bg-card border-border/40')}>
                            {plan.recommended && <div className="flex justify-center"><Badge
                                className="gradient-primary text-primary-foreground text-xs px-3 py-1">Most
                                Popular</Badge></div>}
                            <div className="flex items-end justify-between">
                                <h3 className="text-lg font-bold">{plan.label}</h3>
                                <div className="text-right"><span
                                    className="text-2xl font-bold text-primary">{plan.price}</span><span
                                    className="text-sm text-muted-foreground">{plan.period}</span></div>
                            </div>
                            <ul className="space-y-2">{plan.features.map(f => <li key={f}
                                                                                  className="flex items-center gap-2.5 text-sm">
                                <div
                                    className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <Check className="w-2.5 h-2.5 text-primary"/></div>
                                {f}</li>)}</ul>
                            <Button
                                className={cn('w-full h-11', plan.recommended ? 'gradient-primary shadow-[0_4px_20px_hsl(var(--primary)/0.3)]' : '')}
                                variant={plan.recommended ? 'default' : 'outline'}>Upgrade to {plan.label}</Button>
                        </div>
                    ))}
                </>
            )}
        </SubPageShell>
    );
}
