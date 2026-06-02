// ═══════════════════════════════════════════
// Interfaces de Repositório — Contratos
// Separados do provider (Supabase, REST, etc.)
// ═══════════════════════════════════════════

import type { User, Tenant, Company, LoginResponse } from '@shared/types';

// ── Auth ──────────────────────────────────
export interface IAuthRepository {
  login(email: string, password: string): Promise<LoginResponse>;
  logout(): Promise<void>;
  refreshSession(): Promise<{ accessToken: string } | null>;
  getCurrentUser(): Promise<User | null>;
}

// ── Tenants ───────────────────────────────
export interface ITenantRepository {
  getById(id: string): Promise<Tenant | null>;
}

// ── Companies ─────────────────────────────
export interface ICompanyRepository {
  getByTenantId(tenantId: string): Promise<Company[]>;
  getById(id: string): Promise<Company | null>;
}

// ── Users ─────────────────────────────────
export interface IUserRepository {
  getById(id: string): Promise<User | null>;
  getByTenantId(tenantId: string): Promise<User[]>;
  getPermissions(userId: string, companyId: string): Promise<string[]>;
}

// ── Generic CRUD ──────────────────────────
export interface ICrudRepository<T, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  findAll(filters?: Record<string, unknown>): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<void>;
}
