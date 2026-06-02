import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface UIState {
  sidebarCollapsed: boolean;
  theme: Theme;

  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setTheme: (theme: Theme) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'light',

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      setSidebarCollapsed: (collapsed) =>
        set({ sidebarCollapsed: collapsed }),

      setTheme: (theme) => {
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        if (theme === 'system') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          root.classList.add(prefersDark ? 'dark' : 'light');
        } else {
          root.classList.add(theme);
        }
        set({ theme });
      },


    }),
    {
      name: 'abrasystem-ui',
    }
  )
);
