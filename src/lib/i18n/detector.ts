// =====================================================
// Language/Currency Auto-Detector
// =====================================================
import { CURRENCIES, DEFAULT_CURRENCY } from './currencies';
import { LANGUAGES, DEFAULT_LANGUAGE } from './languages';

// Timezone → currency mapping
const TIMEZONE_CURRENCY: Record<string, string> = {
  'Europe/London': 'GBP', 'Europe/Dublin': 'EUR', 'Europe/Paris': 'EUR',
  'Europe/Berlin': 'EUR', 'Europe/Madrid': 'EUR', 'Europe/Rome': 'EUR',
  'Europe/Amsterdam': 'EUR', 'Europe/Brussels': 'EUR', 'Europe/Lisbon': 'EUR',
  'Europe/Vienna': 'EUR', 'Europe/Athens': 'EUR', 'Europe/Helsinki': 'EUR',
  'Europe/Stockholm': 'SEK', 'Europe/Oslo': 'NOK', 'Europe/Copenhagen': 'DKK',
  'Europe/Warsaw': 'PLN', 'Europe/Prague': 'CZK', 'Europe/Budapest': 'HUF',
  'Europe/Bucharest': 'RON', 'Europe/Sofia': 'BGN', 'Europe/Zagreb': 'EUR',
  'Europe/Istanbul': 'TRY', 'Europe/Kiev': 'UAH', 'Europe/Moscow': 'RUB',
  'Atlantic/Reykjavik': 'ISK', 'Europe/Zurich': 'CHF', 'Europe/Vaduz': 'CHF',
};

// Language code → currency mapping (fallback)
const LANGUAGE_CURRENCY: Record<string, string> = {
  en: 'GBP', es: 'EUR', fr: 'EUR', de: 'EUR', it: 'EUR', pt: 'EUR',
  nl: 'EUR', pl: 'PLN', ru: 'RUB', uk: 'UAH', sv: 'SEK', no: 'NOK',
  da: 'DKK', fi: 'EUR', el: 'EUR', cs: 'CZK', ro: 'RON', hu: 'HUF',
  bg: 'BGN', hr: 'EUR', sk: 'EUR', sl: 'EUR', lt: 'EUR', lv: 'EUR',
  et: 'EUR', ga: 'EUR', mt: 'EUR', is: 'ISK', tr: 'TRY',
};

export function detectLanguage(): string {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  const stored = localStorage.getItem('fyk-language');
  if (stored && LANGUAGES[stored]) return stored;
  const browserLang = navigator.language?.split('-')[0] || DEFAULT_LANGUAGE;
  return LANGUAGES[browserLang] ? browserLang : DEFAULT_LANGUAGE;
}

export function detectCurrency(): string {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;
  const stored = localStorage.getItem('fyk-currency');
  if (stored && CURRENCIES[stored]) return stored;
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONE_CURRENCY[tz]) return TIMEZONE_CURRENCY[tz];
  } catch {}
  const lang = detectLanguage();
  return LANGUAGE_CURRENCY[lang] || DEFAULT_CURRENCY;
}
