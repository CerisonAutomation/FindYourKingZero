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
