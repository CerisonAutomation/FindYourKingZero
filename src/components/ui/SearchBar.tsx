import React, { useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    onSubmit?: (value: string) => void;
    /** Optional filter chips rendered inline */
    filters?: React.ReactNode;
    autoFocus?: boolean;
    className?: string;
}

export function SearchBar({
    value,
    onChange,
    placeholder = 'Search…',
    onSubmit,
    filters,
    autoFocus = false,
    className,
}: SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            onSubmit?.(value);
        },
        [onSubmit, value],
    );

    const handleClear = useCallback(() => {
        onChange('');
        inputRef.current?.focus();
    }, [onChange]);

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            <form onSubmit={handleSubmit} className="relative">
                {/* Search icon */}
                <Search
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                    strokeWidth={2}
                />

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoComplete="off"
                    autoFocus={autoFocus}
                    className={cn(
                        'w-full h-11 pl-10 pr-10',
                        'bg-surface-2 border border-border rounded-xl',
                        'text-sm text-foreground placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50',
                        'transition-all duration-120',
                    )}
                />

                {/* Clear button */}
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label="Clear search"
                        className={cn(
                            'absolute right-3 top-1/2 -translate-y-1/2',
                            'w-6 h-6 flex items-center justify-center rounded-full',
                            'text-muted-foreground hover:text-foreground',
                            'hover:bg-surface-3',
                            'transition-colors duration-120',
                        )}
                    >
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                    </button>
                )}
            </form>

            {/* Optional filter chips — horizontal scroll */}
            {filters && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-1">
                    {filters}
                </div>
            )}
        </div>
    );
}
