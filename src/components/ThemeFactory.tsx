import {motion} from 'framer-motion';
import {Check, Palette} from 'lucide-react';
import {THEMES, useThemeStore} from '@/stores/useThemeStore';
import {useAuth} from '@/hooks/useAuth';
import {cn} from '@/lib/utils';

export function ThemeFactory({onClose}: { onClose?: () => void }) {
    const {themeId, setTheme} = useThemeStore();
    const {user} = useAuth();

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <Palette className="w-4 h-4 text-primary"/>
                <h3 className="font-bold text-sm">Choose Your Theme</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
                {THEMES.map(theme => {
                    const active = themeId === theme.id;
                    return (
                        <motion.button
                            key={theme.id}
                            whileHover={{scale: 1.02}}
                            whileTap={{scale: 0.97}}
                            onClick={() => {
                                setTheme(theme.id, user?.id);
                                onClose?.();
                            }}
                            className={cn(
                                'relative p-4 rounded-2xl border text-left transition-all',
                                active
                                    ? 'border-primary bg-primary/10 shadow-[0_0_16px_hsl(var(--primary)/0.2)]'
                                    : 'border-border/30 bg-card hover:border-primary/30'
                            )}
                        >
                            {active && (
                                <div
                                    className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white"/>
                                </div>
                            )}
                            {/* Color swatch */}
                            <div className="flex gap-1.5 mb-3">
                                {theme.preview.map((color, i) => (
                                    <div
                                        key={i}
                                        className={cn('rounded-full', i === 2 ? 'w-4 h-4' : 'w-6 h-6')}
                                        style={{backgroundColor: color}}
                                    />
                                ))}
                            </div>
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-base leading-none">{theme.emoji}</span>
                                <span className="font-bold text-[13px]">{theme.name}</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">{theme.desc}</p>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
