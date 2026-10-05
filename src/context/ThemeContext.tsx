import React, { createContext, useContext, useState, useEffect } from 'react';

type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'accs_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored;
      }
      const userStr = localStorage.getItem('accs_user');
      if (userStr) {
        const u = JSON.parse(userStr);
        if (u.themePreference === 'dark' || u.themePreference === 'light' || u.themePreference === 'system') {
          return u.themePreference;
        }
      }
    } catch {
      // LocalStorage access fallback
    }
    return 'light'; // Clean Creator Editorial Cream default
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const applyTheme = () => {
      let activeIsDark = false;

      if (theme === 'system') {
        activeIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      } else {
        activeIsDark = theme === 'dark';
      }

      setIsDark(activeIsDark);

      const root = document.documentElement;
      if (activeIsDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
      }

      try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
        const userStr = localStorage.getItem('accs_user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          if (userObj.themePreference !== theme) {
            userObj.themePreference = theme;
            localStorage.setItem('accs_user', JSON.stringify(userObj));
          }
        }
      } catch {
        // Storage fail-safe
      }
    };

    applyTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
