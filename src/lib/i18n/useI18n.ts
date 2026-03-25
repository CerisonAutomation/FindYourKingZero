// =====================================================
// useI18n Hook — Translations + Currency + Detection
// =====================================================
import {useCallback, useEffect, useMemo, useState} from 'react';
import {DEFAULT_LANGUAGE, LANGUAGES} from './languages';
import {CURRENCIES, DEFAULT_CURRENCY, formatCurrency as fc} from './currencies';
import {detectCurrency, detectLanguage} from './detector';
import {TranslationKey, TRANSLATIONS} from './translations';

export function useI18n() {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);

  useEffect(() => {
    setLanguageState(detectLanguage());
    setCurrencyState(detectCurrency());
  }, []);

  const setLanguage = useCallback((code: string) => {
    if (LANGUAGES[code]) {
      setLanguageState(code);
      localStorage.setItem('fyk-language', code);
      document.documentElement.lang = code;
    }
  }, []);

  const setCurrency = useCallback((code: string) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      localStorage.setItem('fyk-currency', code);
    }
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return TRANSLATIONS[language]?.[key] || TRANSLATIONS[DEFAULT_LANGUAGE]?.[key] || key;
  }, [language]);

  const formatCurrency = useCallback((amount: number, code?: string): string => {
    return fc(amount, code || currency);
  }, [currency]);

  const currentLanguage = useMemo(() => LANGUAGES[language] || LANGUAGES[DEFAULT_LANGUAGE], [language]);
  const currentCurrency = useMemo(() => CURRENCIES[currency] || CURRENCIES[DEFAULT_CURRENCY], [currency]);

  return {
    language, currency, currentLanguage, currentCurrency,
    setLanguage, setCurrency, t, formatCurrency,
    languages: Object.values(LANGUAGES),
    currencies: Object.values(CURRENCIES),
  };
}
