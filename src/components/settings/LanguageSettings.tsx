// =============================================================================
// LanguageSettings.tsx — Comprehensive language and locale settings
// =============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, Search, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { languages, type Language } from '@/lib/i18n/languages';
import { useLocaleStore } from '@/stores/useLocaleStore';

interface LanguageSettingsProps {
  trigger?: React.ReactNode;
  className?: string;
}

export const LanguageSettings: React.FC<LanguageSettingsProps> = ({
  trigger,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'rtl' | 'popular'>('all');

  const { locale, setLocale } = useLocaleStore();

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  // Popular languages
  const popularCodes = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'zh', 'ja', 'ko', 'ar', 'hi'];

  // Filter languages
  const filteredLanguages = languages.filter(lang => {
    const matchesSearch = !searchQuery ||
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (selectedCategory) {
      case 'rtl':
        return lang.rtl;
      case 'popular':
        return popularCodes.includes(lang.code);
      default:
        return true;
    }
  });

  // Group languages by region
  const groupedLanguages = filteredLanguages.reduce((groups, lang) => {
    const region = getLanguageRegion(lang.code);
    if (!groups[region]) groups[region] = [];
    groups[region].push(lang);
    return groups;
  }, {} as Record<string, Language[]>);

  function getLanguageRegion(code: string): string {
    const europe = ['en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru', 'uk', 'sv', 'no', 'da', 'fi', 'el', 'cs', 'ro', 'hu', 'bg', 'hr', 'sk', 'sl', 'lt', 'lv', 'et', 'ga', 'mt', 'is'];
    const asia = ['zh', 'ja', 'ko', 'hi', 'th', 'vi', 'id', 'ms', 'tl', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'fa', 'he', 'ar'];
    const africa = ['sw', 'am', 'ha', 'yo', 'ig', 'zu', 'xh', 'af'];

    if (europe.includes(code)) return 'Europe';
    if (asia.includes(code)) return 'Asia & Middle East';
    if (africa.includes(code)) return 'Africa';
    return 'Other';
  }

  const handleLanguageSelect = (lang: Language) => {
    setLocale(lang.code);

    // Apply RTL direction if needed
    if (lang.rtl) {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = lang.code;
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = lang.code;
    }

    setIsOpen(false);
  };

  const categories = [
    { id: 'all', label: 'All Languages', count: languages.length },
    { id: 'popular', label: 'Popular', count: popularCodes.length },
    { id: 'rtl', label: 'RTL Support', count: languages.filter(l => l.rtl).length },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            className={cn(
              'flex items-center gap-2 justify-start w-full h-auto p-3',
              className
            )}
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">Language</p>
                <p className="text-xs text-muted-foreground">
                  {currentLanguage.flag} {currentLanguage.nativeName}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Button>
        )}
      </SheetTrigger>

      <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                Language Settings
              </SheetTitle>
            </div>

            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Categories */}
            <div className="flex gap-2 mt-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-semibold transition-all',
                    selectedCategory === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>
          </SheetHeader>

          {/* Language List */}
          <div className="flex-1 overflow-y-auto p-4">
            <AnimatePresence>
              {Object.entries(groupedLanguages).map(([region, langs]) => (
                <motion.div
                  key={region}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                    {region}
                  </h3>
                  <div className="space-y-1">
                    {langs.map((lang) => (
                      <motion.button
                        key={lang.code}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleLanguageSelect(lang)}
                        className={cn(
                          'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                          locale === lang.code
                            ? 'bg-primary/10 border-2 border-primary'
                            : 'hover:bg-muted border-2 border-transparent'
                        )}
                      >
                        <span className="text-2xl">{lang.flag}</span>
                        <div className="flex-1 text-left">
                          <p className="font-semibold text-sm">{lang.name}</p>
                          <p className="text-xs text-muted-foreground">{lang.nativeName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {lang.rtl && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-500">
                              RTL
                            </span>
                          )}
                          {locale === lang.code && (
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredLanguages.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Globe className="w-12 h-12 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">No languages found</p>
                <p className="text-xs text-muted-foreground/70">Try a different search term</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Current: {currentLanguage.flag} {currentLanguage.nativeName}
              {currentLanguage.rtl && ' (Right-to-Left)'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default LanguageSettings;