import {motion} from 'framer-motion';
import {Check, Crown, Sparkles, Zap} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {SUBSCRIPTION_PLANS, usePayments} from '@/hooks/usePayments';
import {cn} from '@/lib/utils';

interface SubscriptionPlansProps {
    onClose?: () => void;
}

export const SubscriptionPlans = ({onClose}: SubscriptionPlansProps) => {
    const {isLoading, createCheckout} = usePayments();

    const handleSubscribe = async (planId: string) => {
        await createCheckout(planId);
    };

    const getIcon = (planId: string) => {
        switch (planId) {
            case 'basic':
                return Zap;
            case 'premium':
                return Sparkles;
            case 'vip':
                return Crown;
            default:
                return Zap;
        }
    };

    return (
        <div className="p-4">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Upgrade Your Experience</h2>
                <p className="text-muted-foreground">
                    Unlock premium features and find your perfect match
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {SUBSCRIPTION_PLANS.map((plan, index) => {
                    const Icon = getIcon(plan.id);
                    return (
                        <motion.div
                            key={plan.id}
                            initial={{opacity: 0, y: 20}}
                            animate={{opacity: 1, y: 0}}
                            transition={{delay: index * 0.1}}
                            className={cn(
                                "relative  border p-6 transition-all duration-300 hover:scale-105",
                                plan.popular
                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                                    : "border-border bg-card"
                            )}
                        >
                            {plan.popular && (
                                <div
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold ">
                                    Most Popular
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <div className={cn(
                                    "w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-3",
                                    plan.popular ? "bg-primary/20" : "bg-muted"
                                )}>
                                    <Icon className={cn(
                                        "w-6 h-6",
                                        plan.popular ? "text-primary" : "text-muted-foreground"
                                    )}/>
                                </div>
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <div className="mt-2">
                                    <span className="text-3xl font-bold">${plan.price}</span>
                                    <span className="text-muted-foreground">/month</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm">
                                        <Check className={cn(
                                            "w-4 h-4 flex-shrink-0",
                                            plan.popular ? "text-primary" : "text-green-500"
                                        )}/>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handleSubscribe(plan.id)}
                                disabled={isLoading}
                                className={cn(
                                    "w-full",
                                    plan.popular
                                        ? "bg-primary hover:bg-primary/90"
                                        : "bg-secondary hover:bg-secondary/80"
                                )}
                            >
                                {isLoading ? 'Processing...' : `Get ${plan.name}`}
                            </Button>
                        </motion.div>
                    );
                })}
            </div>

            {onClose && (
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="w-full mt-4"
                >
                    Maybe Later
                </Button>
            )}
        </div>
    );
};
