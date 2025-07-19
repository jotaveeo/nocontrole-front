// Utilidades para persistir configurações do usuário

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  language: string;
}

const SETTINGS_KEY = 'financeflow_user_settings';

export const defaultSettings: UserSettings = {
  theme: 'system',
  notifications: true,
  language: 'pt-BR',
};

export function saveUserSettings(settings: Partial<UserSettings>): void {
  try {
    const currentSettings = getUserSettings();
    const newSettings = { ...currentSettings, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
  }
}

export function getUserSettings(): UserSettings {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
  }
  return defaultSettings;
}

export function clearUserSettings(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
  } catch (error) {
    console.error('Erro ao limpar configurações:', error);
  }
}
