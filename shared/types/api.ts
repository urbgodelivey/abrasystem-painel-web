// ──────────────────────────────────────────
// Tipos de API — resposta padronizada
// ──────────────────────────────────────────

/**
 * Result pattern: toda resposta da API usa { data, error }.
 * Nunca throw — sempre retorna.
 */
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  error: ApiError | null;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// ── Configuração de conexão com banco ─────

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// ── Electron API exposta via contextBridge ─

export interface ElectronAPI {
  getServerPort: () => Promise<number | null>;
  safeStorage: {
    encrypt: (text: string) => Promise<string | null>;
    decrypt: (encrypted: string) => Promise<string | null>;
  };
  getAppVersion: () => Promise<string>;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
}

// Declaração global para uso no renderer
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
