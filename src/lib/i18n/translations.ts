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
