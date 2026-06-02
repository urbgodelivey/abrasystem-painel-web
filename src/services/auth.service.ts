import { authRepository } from '@/repositories';
import type { LoginResponse } from '@shared/types';
import type { ApiResponse } from '@shared/types';

export const authService = {
  async login(data: { email: string; password: string }): Promise<ApiResponse<LoginResponse>> {
    try {
      const result = await authRepository.login(data.email, data.password);
      return { data: result, error: null };
    } catch (err) {
      return {
        data: null,
        error: {
          code: 'AUTH_ERROR',
          message: err instanceof Error ? err.message : 'Erro no login',
        },
      };
    }
  },

  async logout(): Promise<void> {
    await authRepository.logout();
  },

  async refreshSession(): Promise<ApiResponse<{ accessToken: string }>> {
    try {
      const result = await authRepository.refreshSession();
      if (!result) {
        return { data: null, error: { code: 'NO_SESSION', message: 'Sessão expirada' } };
      }
      return { data: result, error: null };
    } catch {
      return { data: null, error: { code: 'REFRESH_ERROR', message: 'Falha ao renovar sessão' } };
    }
  },
};
