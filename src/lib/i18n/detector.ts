// =====================================================
// Language/Currency Auto-Detector — Production Pattern
// Cookie-first (SSR-compatible), with fallback chain:
// 1. Cookie (user preference)
// 2. URL query param (?lang=de&currency=EUR)  
// 3. Accept-Language header
// 4. Intl timezone → region
// 5. Default (English/EUR)
// =====================================================
import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyInfo } from './currencies';
import { LANGUAGES, DEFAULT_LANGUAGE, type LanguageInfo } from './languages';

// ── Cookie helpers ───────────────────────────────────
function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax; Secure`;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// ── Timezone → currency mapping ──────────────────────
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
  'Europe/Tallinn': 'EUR', 'Europe/Riga': 'EUR', 'Europe/Vilnius': 'EUR',
  'Europe/Ljubljana': 'EUR', 'Europe/Bratislava': 'EUR', 'Europe/Belgrade': 'EUR',
  'Europe/Malta': 'EUR',
  // Non-European fallbacks
  'America/New_York': 'USD', 'America/Chicago': 'USD', 'America/Los_Angeles': 'USD',
  'America/Toronto': 'CAD', 'America/Sao_Paulo': 'BRL', 'Asia/Tokyo': 'JPY',
  'Asia/Shanghai': 'CNY', 'Asia/Singapore': 'SGD', 'Australia/Sydney': 'AUD',
};

// ── Language → currency fallback ─────────────────────
const LANGUAGE_CURRENCY: Record<string, string> = {
  en: 'GBP', es: 'EUR', fr: 'EUR', de: 'EUR', it: 'EUR', pt: 'EUR',
  nl: 'EUR', pl: 'PLN', ru: 'RUB', uk: 'UAH', sv: 'SEK', no: 'NOK',
  da: 'DKK', fi: 'EUR', el: 'EUR', cs: 'CZK', ro: 'RON', hu: 'HUF',
  bg: 'BGN', hr: 'EUR', sk: 'EUR', sl: 'EUR', lt: 'EUR', lv: 'EUR',
  et: 'EUR', ga: 'EUR', mt: 'EUR', is: 'ISK', tr: 'TRY',
  ja: 'JPY', ko: 'KRW', zh: 'CNY', ar: 'SAR', hi: 'INR',
};

// ── Detect language ──────────────────────────────────
export function detectLanguage(): string {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  // 1. Cookie (user preference)
  const cookieLang = getCookie('fyk_lang');
  if (cookieLang && LANGUAGES[cookieLang]) return cookieLang;

  // 2. URL query param
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  if (urlLang && LANGUAGES[urlLang]) {
    setLanguage(urlLang);
    return urlLang;
  }

  // 3. localStorage (legacy)
  const stored = localStorage.getItem('fyk-language');
  if (stored && LANGUAGES[stored]) {
    setCookie('fyk_lang', stored);
    return stored;
  }

  // 4. Accept-Language header (via navigator.languages)
  const navLangs = navigator.languages || [navigator.language];
  for (const lang of navLangs) {
    const code = lang.split('-')[0].toLowerCase();
    if (LANGUAGES[code]) return code;
  }

  // 5. Default
  return DEFAULT_LANGUAGE;
}

// ── Detect currency ──────────────────────────────────
export function detectCurrency(): string {
  if (typeof window === 'undefined') return DEFAULT_CURRENCY;

  // 1. Cookie (user preference)
  const cookieCurrency = getCookie('fyk_currency');
  if (cookieCurrency && CURRENCIES[cookieCurrency]) return cookieCurrency;

  // 2. URL query param
  const urlCurrency = new URLSearchParams(window.location.search).get('currency');
  if (urlCurrency && CURRENCIES[urlCurrency]) {
    setCurrency(urlCurrency);
    return urlCurrency;
  }

  // 3. localStorage (legacy)
  const stored = localStorage.getItem('fyk-currency');
  if (stored && CURRENCIES[stored]) {
    setCookie('fyk_currency', stored);
    return stored;
  }

  // 4. Intl timezone → region
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (TIMEZONE_CURRENCY[tz]) return TIMEZONE_CURRENCY[tz];
  } catch {}

  // 5. Language → currency fallback
  const lang = detectLanguage();
  return LANGUAGE_CURRENCY[lang] || DEFAULT_CURRENCY;
}

// ── Set language (cookie + localStorage) ─────────────
export function setLanguage(code: string) {
  if (!LANGUAGES[code]) return;
  setCookie('fyk_lang', code);
  localStorage.setItem('fyk-language', code);
  document.documentElement.lang = code;
}

// ── Set currency (cookie + localStorage) ─────────────
export function setCurrency(code: string) {
  if (!CURRENCIES[code]) return;
  setCookie('fyk_currency', code);
  localStorage.setItem('fyk-currency', code);
}

// ── Get user's region info ───────────────────────────
export function getRegionInfo() {
  const lang = detectLanguage();
  const currency = detectCurrency();
  const language = LANGUAGES[lang];
  const currencyInfo = CURRENCIES[currency];

  return {
    language: lang,
    languageInfo: language,
    currency,
    currencyInfo,
    timezone: (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'UTC'; } })(),
    isRTL: language?.rtl ?? false,
  };
}
