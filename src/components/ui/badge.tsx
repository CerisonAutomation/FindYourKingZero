import * as React from "react";
import {cva, type VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center gap-1 border text-[10px] font-bold tracking-[0.02em] rounded-[var(--radius-sm)] transition-colors duration-120 whitespace-nowrap px-2 py-[3px]",
    {
        variants: {
            variant: {
                default: "text-white border-transparent",
                secondary: "bg-surface-2 text-foreground/80 border-border/40",
                destructive: "bg-destructive/12 text-destructive border-destructive/20",
                outline: "bg-transparent text-foreground/70 border-border/50",
                primary: "bg-primary/10 text-primary border-primary/20",
                accent: "bg-accent/10 text-accent border-accent/20",
                gold: "bg-gold/10 text-gold border-gold/20",
                premium: "bg-gold/10 text-gold border-gold/20",
                emerald: "bg-emerald/10 text-emerald border-emerald/20",
                live: "bg-emerald/10 text-emerald border-emerald/20",
            },
        },
        defaultVariants: {variant: "default"},
    },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
}

function Badge({className, variant, style, ...props}: BadgeProps) {
    const isDefault = !variant || variant === "default";
    return (
        <div
            className={cn(badgeVariants({variant}), className)}
            style={isDefault ? {background: "var(--gradient-primary)", ...style} : style}
            {...props}
        />
    );
}

export {Badge, badgeVariants};
