import {ChevronLeft} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {motion} from 'framer-motion';
import React from 'react';

interface OnboardingShellProps {
    step: number;
    total: number;
    title: string;
    desc?: string;
    children: React.ReactNode;
    onNext?: () => void;
    onBack?: () => void;
    nextLabel?: string;
    loading?: boolean;
}

const OnboardingShell = ({
                             step, total, title, desc, children,
                             onNext, onBack, nextLabel = 'Continue', loading = false
                         }: OnboardingShellProps) => (
    <div className="min-h-screen max-h-screen w-full bg-background flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-14 pb-5">
            {/* Back */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="mb-5 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="w-4 h-4"/>
                    <span className="text-sm">Back</span>
                </button>
            )}

            {/* Progress bar */}
            <div className="flex gap-1 mb-6">
                {Array.from({length: total}).map((_, i) => (
                    <motion.div
                        key={i}
                        className="h-[3px] rounded-full flex-1"
                        animate={{backgroundColor: i < step ? 'hsl(var(--primary))' : 'hsl(var(--border))'}}
                        transition={{duration: 0.3, delay: i * 0.03}}
                    />
                ))}
            </div>

            {/* Step label */}
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-2">
                Step {step} of {total}
            </p>

            <motion.h1
                key={title}
                initial={{opacity: 0, y: 12}}
                animate={{opacity: 1, y: 0}}
                className="text-2xl font-bold tracking-tight"
            >
                {title}
            </motion.h1>
            {desc && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 scrollbar-hide">
            <motion.div
                key={title + '-body'}
                initial={{opacity: 0, y: 8}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.05}}
            >
                {children}
            </motion.div>
        </div>

        {/* CTA */}
        {onNext && (
            <div className="flex-shrink-0 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <Button
                    size="lg"
                    className="w-full h-12 gradient-primary font-semibold text-base rounded-2xl shadow-[0_8px_32px_hsl(var(--primary)/0.3)] active:scale-[0.98] transition-transform"
                    onClick={onNext}
                    disabled={loading}
                >
                    {loading ? (
                        <div
                            className="w-5 h-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin"/>
                    ) : nextLabel}
                </Button>
            </div>
        )}
    </div>
);

export default OnboardingShell;
