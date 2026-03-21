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
