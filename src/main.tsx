// =============================================================================
// main.tsx v4.0 — Enterprise React 18 entry point
// StrictMode enabled, null-safe root mount, theme hydration before paint
// =============================================================================
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {applyTheme} from './stores/useThemeStore';

// ── Hydrate persisted theme BEFORE first paint (prevents flash) ──────────────
try {
  const saved = localStorage.getItem('fyk-theme');
  if (saved) {
    const parsed = JSON.parse(saved) as { state?: { themeId?: string } };
    if (parsed?.state?.themeId) {
      applyTheme(parsed.state.themeId);
    }
  }
} catch {
  // Non-critical — silently fail, default theme will be used
}

// ── Mount app ───────────────────────────────────────────────────────
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    '[FindYourKing] Root element #root not found in DOM. ' +
    'Check that index.html contains <div id="root"></div>.'
  );
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
