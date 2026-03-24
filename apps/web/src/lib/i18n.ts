// ═══════════════════════════════════════════════════════════════
// I18N — Internationalization for FindYourKing
// 9 languages, nested keys, localStorage persistence
// ═══════════════════════════════════════════════════════════════

export type Locale = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ja' | 'ko' | 'zh';

export interface LocaleConfig {
  code: Locale;
  label: string;
  flag: string;
}

export const LOCALES: LocaleConfig[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export interface Translation {
  [key: string]: string | Translation;
}

const translations: Record<Locale, Translation> = {
  en: {
    common: {
      loading: 'Loading...', error: 'Error', retry: 'Retry', cancel: 'Cancel',
      save: 'Save', delete: 'Delete', edit: 'Edit', close: 'Close',
      confirm: 'Confirm', back: 'Back', next: 'Next', done: 'Done',
    },
    auth: {
      signIn: 'Sign In', signUp: 'Sign Up', signOut: 'Sign Out', welcome: 'Welcome',
      email: 'Email', password: 'Password', forgotPassword: 'Forgot Password?',
    },
    navigation: {
      home: 'Home', explore: 'Explore', messages: 'Messages', profile: 'Profile',
      settings: 'Settings', notifications: 'Notifications',
    },
    features: {
      grid: 'Grid', events: 'Events', chat: 'Chat', ai: 'AI Assistant',
      safety: 'Safety', admin: 'Admin', albums: 'Albums',
    },
  },
  es: {
    common: {
      loading: 'Cargando...', error: 'Error', retry: 'Reintentar', cancel: 'Cancelar',
      save: 'Guardar', delete: 'Eliminar', edit: 'Editar', close: 'Cerrar',
      confirm: 'Confirmar', back: 'Atrás', next: 'Siguiente', done: 'Hecho',
    },
    auth: {
      signIn: 'Iniciar Sesión', signUp: 'Registrarse', signOut: 'Cerrar Sesión',
      welcome: 'Bienvenido', email: 'Correo', password: 'Contraseña', forgotPassword: '¿Olvidaste tu contraseña?',
    },
    navigation: {
      home: 'Inicio', explore: 'Explorar', messages: 'Mensajes', profile: 'Perfil',
      settings: 'Configuración', notifications: 'Notificaciones',
    },
    features: {
      grid: 'Cuadrícula', events: 'Eventos', chat: 'Chat', ai: 'Asistente IA',
      safety: 'Seguridad', admin: 'Admin', albums: 'Álbumes',
    },
  },
  fr: {
    common: {
      loading: 'Chargement...', error: 'Erreur', retry: 'Réessayer', cancel: 'Annuler',
      save: 'Sauvegarder', delete: 'Supprimer', edit: 'Modifier', close: 'Fermer',
      confirm: 'Confirmer', back: 'Retour', next: 'Suivant', done: 'Terminé',
    },
    auth: {
      signIn: 'Se Connecter', signUp: "S'inscrire", signOut: 'Se Déconnecter',
      welcome: 'Bienvenue', email: 'Email', password: 'Mot de passe', forgotPassword: 'Mot de passe oublié?',
    },
    navigation: {
      home: 'Accueil', explore: 'Explorer', messages: 'Messages', profile: 'Profil',
      settings: 'Paramètres', notifications: 'Notifications',
    },
    features: {
      grid: 'Grille', events: 'Événements', chat: 'Chat', ai: 'Assistant IA',
      safety: 'Sécurité', admin: 'Admin', albums: 'Albums',
    },
  },
  de: {
    common: {
      loading: 'Laden...', error: 'Fehler', retry: 'Wiederholen', cancel: 'Abbrechen',
      save: 'Speichern', delete: 'Löschen', edit: 'Bearbeiten', close: 'Schließen',
      confirm: 'Bestätigen', back: 'Zurück', next: 'Weiter', done: 'Fertig',
    },
    auth: {
      signIn: 'Anmelden', signUp: 'Registrieren', signOut: 'Abmelden',
      welcome: 'Willkommen', email: 'E-Mail', password: 'Passwort', forgotPassword: 'Passwort vergessen?',
    },
    navigation: {
      home: 'Startseite', explore: 'Entdecken', messages: 'Nachrichten', profile: 'Profil',
      settings: 'Einstellungen', notifications: 'Benachrichtigungen',
    },
    features: {
      grid: 'Raster', events: 'Ereignisse', chat: 'Chat', ai: 'KI-Assistent',
      safety: 'Sicherheit', admin: 'Admin', albums: 'Alben',
    },
  },
  it: {
    common: {
      loading: 'Caricamento...', error: 'Errore', retry: 'Riprova', cancel: 'Annulla',
      save: 'Salva', delete: 'Elimina', edit: 'Modifica', close: 'Chiudi',
      confirm: 'Conferma', back: 'Indietro', next: 'Avanti', done: 'Fatto',
    },
    auth: {
      signIn: 'Accedi', signUp: 'Registrati', signOut: 'Esci',
      welcome: 'Benvenuto', email: 'Email', password: 'Password', forgotPassword: 'Password dimenticata?',
    },
    navigation: {
      home: 'Home', explore: 'Esplora', messages: 'Messaggi', profile: 'Profilo',
      settings: 'Impostazioni', notifications: 'Notifiche',
    },
    features: {
      grid: 'Griglia', events: 'Eventi', chat: 'Chat', ai: 'Assistente IA',
      safety: 'Sicurezza', admin: 'Admin', albums: 'Album',
    },
  },
  pt: {
    common: {
      loading: 'Carregando...', error: 'Erro', retry: 'Tentar novamente', cancel: 'Cancelar',
      save: 'Salvar', delete: 'Excluir', edit: 'Editar', close: 'Fechar',
      confirm: 'Confirmar', back: 'Voltar', next: 'Próximo', done: 'Concluído',
    },
    auth: {
      signIn: 'Entrar', signUp: 'Cadastrar', signOut: 'Sair',
      welcome: 'Bem-vindo', email: 'Email', password: 'Senha', forgotPassword: 'Esqueceu a senha?',
    },
    navigation: {
      home: 'Início', explore: 'Explorar', messages: 'Mensagens', profile: 'Perfil',
      settings: 'Configurações', notifications: 'Notificações',
    },
    features: {
      grid: 'Grade', events: 'Eventos', chat: 'Chat', ai: 'Assistente IA',
      safety: 'Segurança', admin: 'Admin', albums: 'Álbuns',
    },
  },
  ja: {
    common: {
      loading: '読み込み中...', error: 'エラー', retry: '再試行', cancel: 'キャンセル',
      save: '保存', delete: '削除', edit: '編集', close: '閉じる',
      confirm: '確認', back: '戻る', next: '次へ', done: '完了',
    },
    auth: {
      signIn: 'ログイン', signUp: 'サインアップ', signOut: 'ログアウト',
      welcome: 'ようこそ', email: 'メール', password: 'パスワード', forgotPassword: 'パスワードを忘れましたか？',
    },
    navigation: {
      home: 'ホーム', explore: '探索', messages: 'メッセージ', profile: 'プロフィール',
      settings: '設定', notifications: '通知',
    },
    features: {
      grid: 'グリッド', events: 'イベント', chat: 'チャット', ai: 'AIアシスタント',
      safety: 'セキュリティ', admin: '管理者', albums: 'アルバム',
    },
  },
  ko: {
    common: {
      loading: '로딩 중...', error: '오류', retry: '다시 시도', cancel: '취소',
      save: '저장', delete: '삭제', edit: '편집', close: '닫기',
      confirm: '확인', back: '뒤로', next: '다음', done: '완료',
    },
    auth: {
      signIn: '로그인', signUp: '가입', signOut: '로그아웃',
      welcome: '환영합니다', email: '이메일', password: '비밀번호', forgotPassword: '비밀번호를 잊으셨나요?',
    },
    navigation: {
      home: '홈', explore: '탐색', messages: '메시지', profile: '프로필',
      settings: '설정', notifications: '알림',
    },
    features: {
      grid: '그리드', events: '이벤트', chat: '채팅', ai: 'AI 비서',
      safety: '보안', admin: '관리자', albums: '앨범',
    },
  },
  zh: {
    common: {
      loading: '加载中...', error: '错误', retry: '重试', cancel: '取消',
      save: '保存', delete: '删除', edit: '编辑', close: '关闭',
      confirm: '确认', back: '返回', next: '下一步', done: '完成',
    },
    auth: {
      signIn: '登录', signUp: '注册', signOut: '退出',
      welcome: '欢迎', email: '邮箱', password: '密码', forgotPassword: '忘记密码？',
    },
    navigation: {
      home: '首页', explore: '探索', messages: '消息', profile: '个人资料',
      settings: '设置', notifications: '通知',
    },
    features: {
      grid: '网格', events: '活动', chat: '聊天', ai: 'AI助手',
      safety: '安全', admin: '管理', albums: '相册',
    },
  },
};

// ── Locale state ──────────────────────────────────────────────
let currentLocale: Locale = (typeof localStorage !== 'undefined'
  ? (localStorage.getItem('king-locale') as Locale) ?? 'en'
  : 'en');

const listeners = new Set<(locale: Locale) => void>();

export function initLocale(locale: Locale = 'en'): Locale {
  currentLocale = locale;
  if (typeof localStorage !== 'undefined') localStorage.setItem('king-locale', locale);
  return locale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  if (typeof localStorage !== 'undefined') localStorage.setItem('king-locale', locale);
  for (const cb of listeners) cb(locale);
}

export function getLocale(): Locale {
  return currentLocale;
}

export function onLocaleChange(cb: (locale: Locale) => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

// ── Translation lookup ────────────────────────────────────────
export function t(key: string, locale?: Locale): string {
  const targetLocale = locale || currentLocale;
  const keys = key.split('.');
  let value: any = translations[targetLocale];

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  return typeof value === 'string' ? value : key;
}

export function getAllLocales(): Locale[] {
  return Object.keys(translations) as Locale[];
}

export function getTranslationKeys(locale: Locale): string[] {
  const keys: string[] = [];
  function collectKeys(obj: Translation, prefix: string = ''): void {
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'string') {
        keys.push(fullKey);
      } else {
        collectKeys(obj[key] as Translation, fullKey);
      }
    }
  }
  collectKeys(translations[locale]);
  return keys;
}