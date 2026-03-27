/**
 * =============================================================================
 * STORES CANONICAL BARREL — Enterprise-Grade State Management Consolidation
 * =============================================================================
 *
 * Single source of truth for ALL Zustand state stores.
 * Consolidates theme, locale, and future store modules.
 *
 * Standards: 15/10 Legendary | Zero-Trust | Enterprise Production
 *
 * @module stores
 * @version 15.0.0
 */

// =============================================================================
// THEME STORE — Application theming and visual customization
// =============================================================================
export {
  useThemeStore,
  applyTheme,
  THEMES,
  type ThemeId,
  type ThemeConfig,
} from './useThemeStore';

// =============================================================================
// LOCALE STORE — Internationalization and localization state
// =============================================================================
export {
  useLocaleStore,
} from './useLocaleStore';

export type {
  LocaleStore,
} from './useLocaleStore';
