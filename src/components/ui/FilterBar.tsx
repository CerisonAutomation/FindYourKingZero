import React, { useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface FilterChip {
    label: string;
    value: string;
    /** If omitted, derived from active === value */
    active?: boolean;
}

interface FilterBarProps {
    filters: FilterChip[];
    active?: string;
    onSelect: (value: string) => void;
    /** Allow deselecting (toggle mode) */
    allowDeselect?: boolean;
    className?: string;
}

export function FilterBar({
    filters,
    active,
    onSelect,
    allowDeselect = false,
    className,
}: FilterBarProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeRef = useRef<HTMLButtonElement>(null);

    // Auto-scroll active chip into view
    useEffect(() => {
        if (activeRef.current && scrollRef.current) {
            const container = scrollRef.current;
            const chip = activeRef.current;
            const scrollLeft =
                chip.offsetLeft - container.offsetWidth / 2 + chip.offsetWidth / 2;
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }, [active]);

    const handleSelect = useCallback(
        (value: string) => {
            if (allowDeselect && active === value) {
                onSelect('');
            } else {
                onSelect(value);
            }
        },
        [active, allowDeselect, onSelect],
    );

    return (
        <div
            ref={scrollRef}
            className={cn(
                'flex gap-2 overflow-x-auto scrollbar-hide',
                'snap-x snap-mandatory',
                'py-2 px-1',
                '-mx-1',
                className,
            )}
            role="tablist"
            aria-label="Filters"
        >
            {filters.map(chip => {
                const isActive = chip.active ?? chip.value === active;

                return (
                    <button
                        key={chip.value}
                        ref={isActive ? activeRef : undefined}
                        onClick={() => handleSelect(chip.value)}
                        role="tab"
                        aria-selected={isActive}
                        className={cn(
                            'shrink-0 snap-start',
                            'h-8 px-3.5 rounded-full',
                            'text-xs font-semibold tracking-wide',
                            'transition-all duration-150',
                            'active:scale-95',
                            isActive
                                ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                : 'bg-surface-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground',
                        )}
                    >
                        {chip.label}
                    </button>
                );
            })}
        </div>
    );
}
