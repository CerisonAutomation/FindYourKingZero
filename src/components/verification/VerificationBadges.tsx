import {BadgeCheck, Crown, Phone, Shield} from 'lucide-react';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {cn} from '@/lib/utils';

interface VerificationBadgesProps {
    ageVerified?: boolean;
    photoVerified?: boolean;
    idVerified?: boolean;
    phoneVerified?: boolean;
    size?: 'sm' | 'md' | 'lg';
    showLabels?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
};

export const VerificationBadges = ({
                                       ageVerified = false,
                                       photoVerified = false,
                                       idVerified = false,
                                       phoneVerified = false,
                                       size = 'md',
                                       showLabels = false,
                                       className,
                                   }: VerificationBadgesProps) => {
    const badges = [
        {
            verified: ageVerified,
            icon: Shield,
            label: 'Age Verified',
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
        },
        {
            verified: photoVerified,
            icon: BadgeCheck,
            label: 'Photo Verified',
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            verified: idVerified,
            icon: Crown,
            label: 'ID Verified',
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
        },
        {
            verified: phoneVerified,
            icon: Phone,
            label: 'Phone Verified',
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
    ];

    const verifiedBadges = badges.filter(b => b.verified);

    if (verifiedBadges.length === 0) return null;

    return (
        <TooltipProvider>
            <div className={cn('flex items-center gap-1', className)}>
                {verifiedBadges.map((badge) => (
                    <Tooltip key={badge.label}>
                        <TooltipTrigger asChild>
                            <div
                                className={cn(
                                    'flex items-center gap-1 rounded-full p-1',
                                    badge.bgColor,
                                    showLabels && 'px-2'
                                )}
                            >
                                <badge.icon className={cn(sizeClasses[size], badge.color)}/>
                                {showLabels && (
                                    <span className={cn('text-xs font-medium', badge.color)}>
                    {badge.label.split(' ')[0]}
                  </span>
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{badge.label}</p>
                        </TooltipContent>
                    </Tooltip>
                ))}
            </div>
        </TooltipProvider>
    );
};
