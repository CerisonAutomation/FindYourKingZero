import {createRoot} from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import {applyTheme} from './stores/useThemeStore';

// Apply persisted theme before first paint
try {
    const saved = localStorage.getItem('fyk-theme');
    if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.state?.themeId) applyTheme(parsed.state.themeId);
    }
} catch (_) { /* silent */
}

createRoot(document.getElementById("root")!).render(<App/>);
