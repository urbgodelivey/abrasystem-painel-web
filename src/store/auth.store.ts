import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Tenant, Company } from '@shared/types';

interface AuthState {
  // Estado
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  tenant: Tenant | null;
  companies: Company[];
  activeCompanyId: string | null;

  // Computed
  isAuthenticated: boolean;

  // Ações
  setAuth: (data: {
    accessToken: string;
    refreshToken: string;
    user: User;
    tenant: Tenant;
    companies: Company[];
  }) => void;
  setAccessToken: (token: string) => void;
  setActiveCompany: (companyId: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      tenant: null,
      companies: [],
      activeCompanyId: null,
      isAuthenticated: false,

      setAuth: (data) =>
        set({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
          tenant: data.tenant,
          companies: data.companies,
          activeCompanyId: data.companies[0]?.id ?? null,
          isAuthenticated: true,
        }),

      setAccessToken: (token) => set({ accessToken: token }),

      setActiveCompany: (companyId) => set({ activeCompanyId: companyId }),

      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          tenant: null,
          companies: [],
          activeCompanyId: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'abrasystem-auth',
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        activeCompanyId: state.activeCompanyId,
      }),
    }
  )
);
