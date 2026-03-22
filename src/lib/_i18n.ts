// =====================================================
// European Currencies — Symbol, format, decimal places
// =====================================================
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
  symbolPosition: 'before' | 'after';
  thousandsSeparator: string;
  decimalSeparator: string;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', decimals: 2, symbolPosition: 'after', thousandsSeparator: '.', decimalSeparator: ',' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', decimals: 2, symbolPosition: 'before', thousandsSeparator: ',', decimalSeparator: '.' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', decimals: 2, symbolPosition: 'before', thousandsSeparator: "'", decimalSeparator: '.' },
  SEK: { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',' },
  NOK: { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',' },
  DKK: { code: 'DKK', symbol: 'kr', name: 'Danish Krone', decimals: 2, symbolPosition: 'after', thousandsSeparator: '.', decimalSeparator: ',' },
  PLN: { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',' },
  CZK: { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',' },
  HUF: { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint', decimals: 0, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',' },
  RON: { code: 'RON', symbol: 'lei', name: 'Romanian Leu', decimals: 2, symbolPosition: 'after', thousandsSeparator: '.', decimalSeparator: ',' },
  BGN: { code: 'BGN', symbol: 'лв', name: 'Bulgarian Lev', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',' },
  HRK: { code: 'HRK', symbol: '€', name: 'Euro (Croatia)', decimals: 2, symbolPosition: 'after', thousandsSeparator: '.', decimalSeparator: ',' },
  TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', decimals: 2, symbolPosition: 'after', thousandsSeparator: '.', decimalSeparator: ',' },
  UAH: { code: 'UAH', symbol: '₴', name: 'Ukrainian Hryvnia', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',' },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', decimals: 2, symbolPosition: 'after', thousandsSeparator: ' ', decimalSeparator: ',' },
  ISK: { code: 'ISK', symbol: 'kr', name: 'Icelandic Króna', decimals: 0, symbolPosition: 'after', thousandsSeparator: '.', decimalSeparator: ',' },
};

export const DEFAULT_CURRENCY = 'EUR';

export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  const fixed = amount.toFixed(currency.decimals);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator);
  const formatted = currency.decimals > 0 ? `${formattedInt}${currency.decimalSeparator}${decPart}` : formattedInt;
  return currency.symbolPosition === 'before'
    ? `${currency.symbol}${formatted}`
    : `${formatted} ${currency.symbol}`;
}
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
export { LANGUAGES, DEFAULT_LANGUAGE, type LanguageInfo } from './languages';
export { CURRENCIES, DEFAULT_CURRENCY, formatCurrency, type CurrencyInfo } from './currencies';
export { detectLanguage, detectCurrency } from './detector';
export { useI18n } from './useI18n';
export { TRANSLATIONS, type TranslationKey } from './translations';
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  flag: string;
}

export const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', rtl: false, flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', rtl: false, flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', rtl: false, flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', rtl: false, flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', rtl: false, flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', rtl: false, flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', rtl: false, flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', rtl: false, flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', rtl: false, flag: '🇷🇺' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', rtl: false, flag: '🇺🇦' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', rtl: false, flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', rtl: false, flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', rtl: false, flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', rtl: false, flag: '🇫🇮' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', rtl: false, flag: '🇬🇷' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', rtl: false, flag: '🇨🇿' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', rtl: false, flag: '🇷🇴' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', rtl: false, flag: '🇭🇺' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', rtl: false, flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', rtl: false, flag: '🇭🇷' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', rtl: false, flag: '🇸🇰' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', rtl: false, flag: '🇸🇮' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', rtl: false, flag: '🇱🇹' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', rtl: false, flag: '🇱🇻' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', rtl: false, flag: '🇪🇪' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', rtl: false, flag: '🇮🇪' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', rtl: false, flag: '🇲🇹' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', rtl: false, flag: '🇮🇸' },
];

export const defaultLanguage = languages[0];

export function getLanguageByCode(code: string): Language | undefined {
  return languages.find((lang) => lang.code === code);
}

export function getSupportedLanguageCodes(): string[] {
  return languages.map((lang) => lang.code);
}
// =====================================================
// Translations — European Languages (compact keys)
// =====================================================
export type TranslationKey =
  | 'welcome' | 'sign_in' | 'sign_up' | 'sign_out' | 'profile' | 'settings'
  | 'messages' | 'events' | 'search' | 'cancel' | 'save' | 'delete' | 'edit'
  | 'back' | 'next' | 'loading' | 'error' | 'success' | 'email' | 'password'
  | 'forgot_password' | 'create_account' | 'display_name' | 'age' | 'bio'
  | 'photos' | 'verification' | 'match' | 'like' | 'pass' | 'super_like'
  | 'nearby' | 'distance' | 'online' | 'offline' | 'send_message' | 'typing'
  | 'language' | 'currency' | 'notifications' | 'privacy' | 'security'
  | 'block' | 'report' | 'unblock' | 'dark_mode' | 'quick_share'
  | 'voice_message' | 'edit_profile' | 'view_profile' | 'last_seen'
  | 'read' | 'blocked_users' | 'reset_password' | 'already_have_account'
  | 'dont_have_account';

const en: Record<TranslationKey, string> = {
  welcome: 'Welcome', sign_in: 'Sign In', sign_up: 'Sign Up', sign_out: 'Sign Out',
  profile: 'Profile', settings: 'Settings', messages: 'Messages', events: 'Events',
  search: 'Search', cancel: 'Cancel', save: 'Save', delete: 'Delete', edit: 'Edit',
  back: 'Back', next: 'Next', loading: 'Loading...', error: 'Error', success: 'Success',
  email: 'Email', password: 'Password', forgot_password: 'Forgot password?',
  create_account: 'Create Account', display_name: 'Display Name', age: 'Age', bio: 'Bio',
  photos: 'Photos', verification: 'Verification', match: 'Match', like: 'Like',
  pass: 'Pass', super_like: 'Super Like', nearby: 'Nearby', distance: 'Distance',
  online: 'Online', offline: 'Offline', send_message: 'Send message', typing: 'Typing...',
  language: 'Language', currency: 'Currency', notifications: 'Notifications',
  privacy: 'Privacy', security: 'Security', block: 'Block', report: 'Report',
  unblock: 'Unblock', dark_mode: 'Dark Mode', quick_share: 'Quick Share',
  voice_message: 'Voice Message', edit_profile: 'Edit Profile', view_profile: 'View Profile',
  last_seen: 'Last seen', read: 'Read', blocked_users: 'Blocked Users',
  reset_password: 'Reset Password', already_have_account: 'Already have an account?',
  dont_have_account: "Don't have an account?",
};

const es: Record<TranslationKey, string> = {
  welcome: 'Bienvenido', sign_in: 'Iniciar sesión', sign_up: 'Registrarse', sign_out: 'Cerrar sesión',
  profile: 'Perfil', settings: 'Ajustes', messages: 'Mensajes', events: 'Eventos',
  search: 'Buscar', cancel: 'Cancelar', save: 'Guardar', delete: 'Eliminar', edit: 'Editar',
  back: 'Atrás', next: 'Siguiente', loading: 'Cargando...', error: 'Error', success: 'Éxito',
  email: 'Correo', password: 'Contraseña', forgot_password: '¿Olvidaste tu contraseña?',
  create_account: 'Crear cuenta', display_name: 'Nombre', age: 'Edad', bio: 'Biografía',
  photos: 'Fotos', verification: 'Verificación', match: 'Match', like: 'Me gusta',
  pass: 'Pasar', super_like: 'Super Like', nearby: 'Cercanos', distance: 'Distancia',
  online: 'En línea', offline: 'Desconectado', send_message: 'Enviar mensaje', typing: 'Escribiendo...',
  language: 'Idioma', currency: 'Moneda', notifications: 'Notificaciones',
  privacy: 'Privacidad', security: 'Seguridad', block: 'Bloquear', report: 'Reportar',
  unblock: 'Desbloquear', dark_mode: 'Modo oscuro', quick_share: 'Compartir rápido',
  voice_message: 'Mensaje de voz', edit_profile: 'Editar perfil', view_profile: 'Ver perfil',
  last_seen: 'Última vez', read: 'Leído', blocked_users: 'Usuarios bloqueados',
  reset_password: 'Restablecer contraseña', already_have_account: '¿Ya tienes cuenta?',
  dont_have_account: '¿No tienes cuenta?',
};

const fr: Record<TranslationKey, string> = {
  welcome: 'Bienvenue', sign_in: 'Connexion', sign_up: "S'inscrire", sign_out: 'Déconnexion',
  profile: 'Profil', settings: 'Paramètres', messages: 'Messages', events: 'Événements',
  search: 'Rechercher', cancel: 'Annuler', save: 'Enregistrer', delete: 'Supprimer', edit: 'Modifier',
  back: 'Retour', next: 'Suivant', loading: 'Chargement...', error: 'Erreur', success: 'Succès',
  email: 'E-mail', password: 'Mot de passe', forgot_password: 'Mot de passe oublié?',
  create_account: 'Créer un compte', display_name: 'Nom', age: 'Âge', bio: 'Bio',
  photos: 'Photos', verification: 'Vérification', match: 'Match', like: "J'aime",
  pass: 'Passer', super_like: 'Super Like', nearby: 'À proximité', distance: 'Distance',
  online: 'En ligne', offline: 'Hors ligne', send_message: 'Envoyer', typing: 'Écrit...',
  language: 'Langue', currency: 'Devise', notifications: 'Notifications',
  privacy: 'Confidentialité', security: 'Sécurité', block: 'Bloquer', report: 'Signaler',
  unblock: 'Débloquer', dark_mode: 'Mode sombre', quick_share: 'Partage rapide',
  voice_message: 'Message vocal', edit_profile: 'Modifier le profil', view_profile: 'Voir le profil',
  last_seen: 'Vu', read: 'Lu', blocked_users: 'Utilisateurs bloqués',
  reset_password: 'Réinitialiser', already_have_account: 'Déjà un compte?',
  dont_have_account: 'Pas de compte?',
};

const de: Record<TranslationKey, string> = {
  welcome: 'Willkommen', sign_in: 'Anmelden', sign_up: 'Registrieren', sign_out: 'Abmelden',
  profile: 'Profil', settings: 'Einstellungen', messages: 'Nachrichten', events: 'Events',
  search: 'Suchen', cancel: 'Abbrechen', save: 'Speichern', delete: 'Löschen', edit: 'Bearbeiten',
  back: 'Zurück', next: 'Weiter', loading: 'Laden...', error: 'Fehler', success: 'Erfolg',
  email: 'E-Mail', password: 'Passwort', forgot_password: 'Passwort vergessen?',
  create_account: 'Konto erstellen', display_name: 'Name', age: 'Alter', bio: 'Bio',
  photos: 'Fotos', verification: 'Verifizierung', match: 'Match', like: 'Gefällt mir',
  pass: 'Überspringen', super_like: 'Super Like', nearby: 'In der Nähe', distance: 'Entfernung',
  online: 'Online', offline: 'Offline', send_message: 'Nachricht senden', typing: 'Tippt...',
  language: 'Sprache', currency: 'Währung', notifications: 'Benachrichtigungen',
  privacy: 'Datenschutz', security: 'Sicherheit', block: 'Blockieren', report: 'Melden',
  unblock: 'Entblocken', dark_mode: 'Dunkelmodus', quick_share: 'Schnell teilen',
  voice_message: 'Sprachnachricht', edit_profile: 'Profil bearbeiten', view_profile: 'Profil ansehen',
  last_seen: 'Zuletzt gesehen', read: 'Gelesen', blocked_users: 'Blockierte Nutzer',
  reset_password: 'Passwort zurücksetzen', already_have_account: 'Schon ein Konto?',
  dont_have_account: 'Noch kein Konto?',
};

const it: Record<TranslationKey, string> = {
  welcome: 'Benvenuto', sign_in: 'Accedi', sign_up: 'Registrati', sign_out: 'Esci',
  profile: 'Profilo', settings: 'Impostazioni', messages: 'Messaggi', events: 'Eventi',
  search: 'Cerca', cancel: 'Annulla', save: 'Salva', delete: 'Elimina', edit: 'Modifica',
  back: 'Indietro', next: 'Avanti', loading: 'Caricamento...', error: 'Errore', success: 'Successo',
  email: 'Email', password: 'Password', forgot_password: 'Password dimenticata?',
  create_account: 'Crea account', display_name: 'Nome', age: 'Età', bio: 'Bio',
  photos: 'Foto', verification: 'Verifica', match: 'Match', like: 'Mi piace',
  pass: 'Passa', super_like: 'Super Like', nearby: 'Vicini', distance: 'Distanza',
  online: 'Online', offline: 'Offline', send_message: 'Invia messaggio', typing: 'Sta scrivendo...',
  language: 'Lingua', currency: 'Valuta', notifications: 'Notifiche',
  privacy: 'Privacy', security: 'Sicurezza', block: 'Blocca', report: 'Segnala',
  unblock: 'Sblocca', dark_mode: 'Modalità scura', quick_share: 'Condivisione rapida',
  voice_message: 'Messaggio vocale', edit_profile: 'Modifica profilo', view_profile: 'Vedi profilo',
  last_seen: 'Ultimo accesso', read: 'Letto', blocked_users: 'Utenti bloccati',
  reset_password: 'Reimposta password', already_have_account: 'Hai già un account?',
  dont_have_account: 'Non hai un account?',
};

const pt: Record<TranslationKey, string> = {
  welcome: 'Bem-vindo', sign_in: 'Entrar', sign_up: 'Registrar', sign_out: 'Sair',
  profile: 'Perfil', settings: 'Definições', messages: 'Mensagens', events: 'Eventos',
  search: 'Pesquisar', cancel: 'Cancelar', save: 'Guardar', delete: 'Eliminar', edit: 'Editar',
  back: 'Voltar', next: 'Seguinte', loading: 'A carregar...', error: 'Erro', success: 'Sucesso',
  email: 'Email', password: 'Palavra-passe', forgot_password: 'Esqueceu-se?',
  create_account: 'Criar conta', display_name: 'Nome', age: 'Idade', bio: 'Bio',
  photos: 'Fotos', verification: 'Verificação', match: 'Match', like: 'Gosto',
  pass: 'Passar', super_like: 'Super Like', nearby: 'Perto', distance: 'Distância',
  online: 'Online', offline: 'Offline', send_message: 'Enviar', typing: 'A escrever...',
  language: 'Idioma', currency: 'Moeda', notifications: 'Notificações',
  privacy: 'Privacidade', security: 'Segurança', block: 'Bloquear', report: 'Reportar',
  unblock: 'Desbloquear', dark_mode: 'Modo escuro', quick_share: 'Partilha rápida',
  voice_message: 'Nota de voz', edit_profile: 'Editar perfil', view_profile: 'Ver perfil',
  last_seen: 'Última vez', read: 'Lido', blocked_users: 'Utilizadores bloqueados',
  reset_password: 'Repor palavra-passe', already_have_account: 'Já tem conta?',
  dont_have_account: 'Não tem conta?',
};

const nl: Record<TranslationKey, string> = {
  welcome: 'Welkom', sign_in: 'Inloggen', sign_up: 'Registreren', sign_out: 'Uitloggen',
  profile: 'Profiel', settings: 'Instellingen', messages: 'Berichten', events: 'Evenementen',
  search: 'Zoeken', cancel: 'Annuleren', save: 'Opslaan', delete: 'Verwijderen', edit: 'Bewerken',
  back: 'Terug', next: 'Volgende', loading: 'Laden...', error: 'Fout', success: 'Gelukt',
  email: 'E-mail', password: 'Wachtwoord', forgot_password: 'Wachtwoord vergeten?',
  create_account: 'Account aanmaken', display_name: 'Naam', age: 'Leeftijd', bio: 'Bio',
  photos: "Foto's", verification: 'Verificatie', match: 'Match', like: 'Leuk',
  pass: 'Overslaan', super_like: 'Super Like', nearby: 'In de buurt', distance: 'Afstand',
  online: 'Online', offline: 'Offline', send_message: 'Bericht sturen', typing: 'Typt...',
  language: 'Taal', currency: 'Valuta', notifications: 'Meldingen',
  privacy: 'Privacy', security: 'Beveiliging', block: 'Blokkeren', report: 'Rapporteren',
  unblock: 'Deblokkeren', dark_mode: 'Donkere modus', quick_share: 'Snel delen',
  voice_message: 'Spraakbericht', edit_profile: 'Profiel bewerken', view_profile: 'Profiel bekijken',
  last_seen: 'Laatst gezien', read: 'Gelezen', blocked_users: 'Geblokkeerde gebruikers',
  reset_password: 'Wachtwoord resetten', already_have_account: 'Al een account?',
  dont_have_account: 'Nog geen account?',
};

const pl: Record<TranslationKey, string> = {
  welcome: 'Witaj', sign_in: 'Zaloguj się', sign_up: 'Zarejestruj się', sign_out: 'Wyloguj się',
  profile: 'Profil', settings: 'Ustawienia', messages: 'Wiadomości', events: 'Wydarzenia',
  search: 'Szukaj', cancel: 'Anuluj', save: 'Zapisz', delete: 'Usuń', edit: 'Edytuj',
  back: 'Wstecz', next: 'Dalej', loading: 'Ładowanie...', error: 'Błąd', success: 'Sukces',
  email: 'Email', password: 'Hasło', forgot_password: 'Zapomniałeś hasła?',
  create_account: 'Utwórz konto', display_name: 'Nazwa', age: 'Wiek', bio: 'Bio',
  photos: 'Zdjęcia', verification: 'Weryfikacja', match: 'Dopasowanie', like: 'Lubię',
  pass: 'Pomiń', super_like: 'Super Lubię', nearby: 'W pobliżu', distance: 'Dystans',
  online: 'Online', offline: 'Offline', send_message: 'Wyślij', typing: 'Pisze...',
  language: 'Język', currency: 'Waluta', notifications: 'Powiadomienia',
  privacy: 'Prywatność', security: 'Bezpieczeństwo', block: 'Zablokuj', report: 'Zgłoś',
  unblock: 'Odblokuj', dark_mode: 'Tryb ciemny', quick_share: 'Szybki udział',
  voice_message: 'Wiadomość głosowa', edit_profile: 'Edytuj profil', view_profile: 'Zobacz profil',
  last_seen: 'Ostatnio widziany', read: 'Przeczytano', blocked_users: 'Zablokowani',
  reset_password: 'Zresetuj hasło', already_have_account: 'Masz już konto?',
  dont_have_account: 'Nie masz konta?',
};

const ru: Record<TranslationKey, string> = {
  welcome: 'Добро пожаловать', sign_in: 'Войти', sign_up: 'Регистрация', sign_out: 'Выйти',
  profile: 'Профиль', settings: 'Настройки', messages: 'Сообщения', events: 'События',
  search: 'Поиск', cancel: 'Отмена', save: 'Сохранить', delete: 'Удалить', edit: 'Редактировать',
  back: 'Назад', next: 'Далее', loading: 'Загрузка...', error: 'Ошибка', success: 'Успех',
  email: 'Email', password: 'Пароль', forgot_password: 'Забыли пароль?',
  create_account: 'Создать аккаунт', display_name: 'Имя', age: 'Возраст', bio: 'Био',
  photos: 'Фото', verification: 'Верификация', match: 'Совпадение', like: 'Нравится',
  pass: 'Пропустить', super_like: 'Супер лайк', nearby: 'Рядом', distance: 'Расстояние',
  online: 'Онлайн', offline: 'Оффлайн', send_message: 'Отправить', typing: 'Печатает...',
  language: 'Язык', currency: 'Валюта', notifications: 'Уведомления',
  privacy: 'Конфиденциальность', security: 'Безопасность', block: 'Заблокировать', report: 'Пожаловаться',
  unblock: 'Разблокировать', dark_mode: 'Тёмная тема', quick_share: 'Быстрый обмен',
  voice_message: 'Голосовое', edit_profile: 'Редактировать', view_profile: 'Профиль',
  last_seen: 'Был в сети', read: 'Прочитано', blocked_users: 'Заблокированные',
  reset_password: 'Сброс пароля', already_have_account: 'Уже есть аккаунт?',
  dont_have_account: 'Нет аккаунта?',
};

const uk: Record<TranslationKey, string> = {
  welcome: 'Ласкаво просимо', sign_in: 'Увійти', sign_up: 'Реєстрація', sign_out: 'Вийти',
  profile: 'Профіль', settings: 'Налаштування', messages: 'Повідомлення', events: 'Події',
  search: 'Пошук', cancel: 'Скасувати', save: 'Зберегти', delete: 'Видалити', edit: 'Редагувати',
  back: 'Назад', next: 'Далі', loading: 'Завантаження...', error: 'Помилка', success: 'Успіх',
  email: 'Email', password: 'Пароль', forgot_password: 'Забули пароль?',
  create_account: 'Створити акаунт', display_name: "Ім'я", age: 'Вік', bio: 'Біо',
  photos: 'Фото', verification: 'Верифікація', match: 'Збіг', like: 'Подобається',
  pass: 'Пропустити', super_like: 'Супер лайк', nearby: 'Поруч', distance: 'Відстань',
  online: 'Онлайн', offline: 'Офлайн', send_message: 'Надіслати', typing: 'Друкує...',
  language: 'Мова', currency: 'Валюта', notifications: 'Сповіщення',
  privacy: 'Конфіденційність', security: 'Безпека', block: 'Заблокувати', report: 'Поскаржитися',
  unblock: 'Розблокувати', dark_mode: 'Темна тема', quick_share: 'Швидкий обмін',
  voice_message: 'Голосове', edit_profile: 'Редагувати', view_profile: 'Профіль',
  last_seen: 'Був в мережі', read: 'Прочитано', blocked_users: 'Заблоковані',
  reset_password: 'Скидання пароля', already_have_account: 'Вже є акаунт?',
  dont_have_account: 'Немає акаунта?',
};

export const TRANSLATIONS: Record<string, Record<TranslationKey, string>> = {
  en, es, fr, de, it, pt, nl, pl, ru, uk,
};
// =====================================================
// useI18n Hook — Translations + Currency + Detection
// Cookie-persisted, SSR-compatible
// =====================================================
import { useState, useCallback, useEffect, useMemo } from 'react';
import { LANGUAGES, DEFAULT_LANGUAGE } from './languages';
import { CURRENCIES, formatCurrency as fc, DEFAULT_CURRENCY } from './currencies';
import { detectLanguage, detectCurrency, setLanguage as setLangCookie, setCurrency as setCurrencyCookie, getRegionInfo } from './detector';
import { TRANSLATIONS, TranslationKey } from './translations';

export function useI18n() {
  const [language, setLanguageState] = useState<string>(DEFAULT_LANGUAGE);
  const [currency, setCurrencyState] = useState<string>(DEFAULT_CURRENCY);

  useEffect(() => {
    const lang = detectLanguage();
    const cur = detectCurrency();
    setLanguageState(lang);
    setCurrencyState(cur);
    document.documentElement.lang = lang;
  }, []);

  const setLanguage = useCallback((code: string) => {
    if (LANGUAGES[code]) {
      setLanguageState(code);
      setLangCookie(code);
      document.documentElement.lang = code;
    }
  }, []);

  const setCurrency = useCallback((code: string) => {
    if (CURRENCIES[code]) {
      setCurrencyState(code);
      setCurrencyCookie(code);
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
  const regionInfo = useMemo(() => getRegionInfo(), []);

  return {
    language, currency, currentLanguage, currentCurrency,
    setLanguage, setCurrency, t, formatCurrency,
    languages: Object.values(LANGUAGES),
    currencies: Object.values(CURRENCIES),
    regionInfo,
  };
}
