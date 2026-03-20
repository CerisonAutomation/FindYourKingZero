import {useState} from 'react';
import {motion} from 'framer-motion';
import {RotateCcw} from 'lucide-react';
import {FilterPreferences} from '@/types';
import {LOOKING_FOR, TRIBES} from '@/data/mockData';
import {Sheet, SheetContent, SheetHeader, SheetTitle} from '@/components/ui/sheet';
import {Slider} from '@/components/ui/slider';
import {Switch} from '@/components/ui/switch';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {cn} from '@/lib/utils';

interface FilterDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters: FilterPreferences;
    onFiltersChange: (filters: FilterPreferences) => void;
}

export function FilterDialog({open, onOpenChange, filters, onFiltersChange}: FilterDialogProps) {
    const [localFilters, setLocalFilters] = useState<FilterPreferences>(filters);

    const handleReset = () => {
        const resetFilters: FilterPreferences = {
            ageRange: [18, 60],
            distanceRadius: 50,
            tribes: [],
            lookingFor: [],
            showOnlineOnly: false,
            showVerifiedOnly: false,
        };
        setLocalFilters(resetFilters);
    };

    const handleApply = () => {
        onFiltersChange(localFilters);
        onOpenChange(false);
    };

    const toggleTribe = (tribe: string) => {
        setLocalFilters(prev => ({
            ...prev,
            tribes: prev.tribes.includes(tribe)
                ? prev.tribes.filter(t => t !== tribe)
                : [...prev.tribes, tribe]
        }));
    };

    const toggleLookingFor = (item: string) => {
        setLocalFilters(prev => ({
            ...prev,
            lookingFor: prev.lookingFor.includes(item)
                ? prev.lookingFor.filter(l => l !== item)
                : [...prev.lookingFor, item]
        }));
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl bg-card border-border">
                <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
                    <SheetTitle className="text-xl font-semibold">Filters</SheetTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleReset}
                        className="text-muted-foreground hover:text-foreground"
                    >
                        <RotateCcw className="w-4 h-4 mr-2"/>
                        Reset
                    </Button>
                </SheetHeader>

                <div className="overflow-y-auto h-[calc(100%-8rem)] py-6 space-y-8 scrollbar-hide">
                    {/* Age Range */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Age Range</Label>
                            <span className="text-sm text-primary font-medium">
                {localFilters.ageRange[0]} - {localFilters.ageRange[1]}
              </span>
                        </div>
                        <Slider
                            value={localFilters.ageRange}
                            onValueChange={(value) => setLocalFilters(prev => ({
                                ...prev,
                                ageRange: value as [number, number]
                            }))}
                            min={18}
                            max={80}
                            step={1}
                            className="py-4"
                        />
                    </div>

                    {/* Distance */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">Distance</Label>
                            <span className="text-sm text-primary font-medium">
                {localFilters.distanceRadius} mi
              </span>
                        </div>
                        <Slider
                            value={[localFilters.distanceRadius]}
                            onValueChange={(value) => setLocalFilters(prev => ({...prev, distanceRadius: value[0]}))}
                            min={1}
                            max={100}
                            step={1}
                            className="py-4"
                        />
                    </div>

                    {/* Tribes */}
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Tribes</Label>
                        <div className="flex flex-wrap gap-2">
                            {TRIBES.map((tribe) => (
                                <motion.button
                                    key={tribe}
                                    whileTap={{scale: 0.95}}
                                    onClick={() => toggleTribe(tribe)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                        localFilters.tribes.includes(tribe)
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                    )}
                                >
                                    {tribe}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Looking For */}
                    <div className="space-y-4">
                        <Label className="text-base font-medium">Looking For</Label>
                        <div className="flex flex-wrap gap-2">
                            {LOOKING_FOR.map((item) => (
                                <motion.button
                                    key={item}
                                    whileTap={{scale: 0.95}}
                                    onClick={() => toggleLookingFor(item)}
                                    className={cn(
                                        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                                        localFilters.lookingFor.includes(item)
                                            ? "bg-accent text-accent-foreground"
                                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                    )}
                                >
                                    {item}
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                            <div>
                                <Label className="text-base font-medium">Online Only</Label>
                                <p className="text-sm text-muted-foreground">Show only users who are online</p>
                            </div>
                            <Switch
                                checked={localFilters.showOnlineOnly}
                                onCheckedChange={(checked) => setLocalFilters(prev => ({
                                    ...prev,
                                    showOnlineOnly: checked
                                }))}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50">
                            <div>
                                <Label className="text-base font-medium">Verified Only</Label>
                                <p className="text-sm text-muted-foreground">Show only verified profiles</p>
                            </div>
                            <Switch
                                checked={localFilters.showVerifiedOnly}
                                onCheckedChange={(checked) => setLocalFilters(prev => ({
                                    ...prev,
                                    showVerifiedOnly: checked
                                }))}
                            />
                        </div>
                    </div>
                </div>

                {/* Apply Button */}
                <div
                    className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-card via-card to-transparent pt-8">
                    <Button
                        onClick={handleApply}
                        className="w-full h-14 text-lg font-semibold gradient-primary hover:opacity-90 transition-opacity"
                    >
                        Apply Filters
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
