import * as React from "react";
import {cn} from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
    ({className, type, ...props}, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-9 w-full",
                    "bg-surface-1 border border-border/50",
                    "text-[13px] text-foreground font-medium",
                    "placeholder:text-muted-foreground/40",
                    "rounded-none",
                    "px-3",
                    "transition-[border-color,box-shadow] duration-120",
                    "focus-visible:outline-none",
                    "focus-visible:border-primary/50",
                    "focus-visible:shadow-[0_0_0_3px_hsl(var(--primary)/0.12),0_0_0_1px_hsl(var(--primary)/0.25)]",
                    "disabled:pointer-events-none disabled:opacity-40",
                    "file:border-0 file:bg-transparent file:text-[12px] file:font-semibold",
                    className,
                )}
                ref={ref}
                {...props}
            />
        );
    },
);
Input.displayName = "Input";

export {Input};
