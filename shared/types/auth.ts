// ──────────────────────────────────────────
// Tipos de Autenticação — compartilhados main ↔ renderer
// ──────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  permissions: string[];
}

export interface Tenant {
  id: string;
  name: string;
  status: TenantStatus;
  plan: string;
}

export type TenantStatus = 'active' | 'trial' | 'suspended' | 'cancelled';

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  city: string;
  state: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  tenant: Tenant;
  companies: Company[];
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface JWTPayload {
  tenant_id: string;
  company_id: string;
  user_id: string;
  permissions: string[];
  iat: number;
  exp: number;
}
