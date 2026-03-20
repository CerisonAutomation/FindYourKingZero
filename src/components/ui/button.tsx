import * as React from "react";
import {Slot} from "@radix-ui/react-slot";
import {cva, type VariantProps} from "class-variance-authority";
import {cn} from "@/lib/utils";

const buttonVariants = cva(
    // Base — sharp, engineered, fast response
    [
        "inline-flex items-center justify-center gap-2 whitespace-nowrap",
        "text-sm font-semibold tracking-[-0.01em]",
        "ring-offset-background transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-40",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0",
        "active:scale-[0.97]",
    ].join(" "),
    {
        variants: {
            variant: {
                // ── Primary — electric gradient, crisp ──
                default: [
                    "text-white",
                    "transition-[transform,box-shadow,opacity] duration-120 ease-snap",
                    "hover:opacity-90 hover:-translate-y-px",
                    "shadow-[0_1px_2px_hsl(0_0%_0%/0.5),inset_0_1px_0_hsl(0_0%_100%/0.1)]",
                ].join(" "),

                // ── Destructive ──
                destructive: [
                    "bg-destructive text-destructive-foreground",
                    "hover:opacity-90 shadow-sm",
                ].join(" "),

                // ── Outline — thin border, subtle bg ──
                outline: [
                    "border bg-transparent text-foreground",
                    "border-border/50",
                    "hover:bg-surface-2 hover:border-border",
                    "transition-[background,border-color,transform] duration-120",
                ].join(" "),

                // ── Secondary ──
                secondary: [
                    "bg-surface-2 text-foreground border border-border/40",
                    "hover:bg-surface-3 hover:border-border/70",
                    "transition-[background,border-color] duration-120",
                    "shadow-[var(--shadow-xs)]",
                ].join(" "),

                // ── Ghost — minimal ──
                ghost: [
                    "bg-transparent text-muted-foreground",
                    "hover:bg-surface-2 hover:text-foreground",
                    "transition-[background,color] duration-120",
                ].join(" "),

                // ── Link ──
                link: "text-primary underline-offset-4 hover:underline p-0 h-auto",

                // ── Premium — gradient edge glow ──
                premium: [
                    "text-white relative overflow-hidden",
                    "before:absolute before:inset-0 before:opacity-0 before:bg-white/[0.06]",
                    "hover:before:opacity-100 hover:-translate-y-px",
                    "transition-[transform,box-shadow,opacity] duration-120",
                    "shadow-[0_2px_12px_hsl(221_90%_60%/0.3),inset_0_1px_0_hsl(0_0%_100%/0.12)]",
                ].join(" "),

                // ── Glass — backdrop blur ──
                glass: [
                    "bg-white/[0.06] backdrop-blur-md text-foreground",
                    "border border-white/[0.08]",
                    "hover:bg-white/[0.09] hover:border-white/[0.12]",
                    "transition-[background,border-color] duration-120",
                    "shadow-[var(--shadow-xs)]",
                ].join(" "),
            },
            size: {
                xs: "h-7  px-2.5 text-[11px] rounded-none [&_svg]:size-3",
                sm: "h-8  px-3   text-[12px] rounded-none [&_svg]:size-3.5",
                default: "h-9  px-4   text-[13px] rounded-none [&_svg]:size-4",
                lg: "h-10 px-5   text-[14px] rounded-none [&_svg]:size-4",
                xl: "h-11 px-6   text-[14px] rounded-none [&_svg]:size-4",
                icon: "h-9  w-9    rounded-none             [&_svg]:size-4",
                "icon-sm": "h-7 w-7   rounded-none             [&_svg]:size-3.5",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({className, variant, size, asChild = false, style, ...props}, ref) => {
        const Comp = asChild ? Slot : "button";

        // Primary and premium use CSS gradient via inline style for full design token support
        const isPrimary = !variant || variant === "default";
        const isPremium = variant === "premium";
        const gradientStyle =
            isPrimary || isPremium
                ? {background: "var(--gradient-primary)", ...style}
                : style;

        return (
            <Comp
                className={cn(buttonVariants({variant, size, className}))}
                ref={ref}
                style={gradientStyle}
                {...props}
            />
        );
    },
);
Button.displayName = "Button";

export {Button, buttonVariants};
