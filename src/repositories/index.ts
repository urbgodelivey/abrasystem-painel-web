// ═══════════════════════════════════════════
// Container de Repositórios — Ponto único de troca de provider
//
// Para migrar de Supabase para REST, basta trocar os imports aqui.
// O restante da aplicação continua usando as interfaces.
// ═══════════════════════════════════════════

import type {
  IAuthRepository,
  ITenantRepository,
  ICompanyRepository,
  IUserRepository,
} from './interfaces.ts';

import {
  SupabaseAuthRepository,
  SupabaseTenantRepository,
  SupabaseCompanyRepository,
  SupabaseUserRepository,
} from './supabase';

// Instâncias singleton
export const authRepository: IAuthRepository = new SupabaseAuthRepository();
export const tenantRepository: ITenantRepository = new SupabaseTenantRepository();
export const companyRepository: ICompanyRepository = new SupabaseCompanyRepository();
export const userRepository: IUserRepository = new SupabaseUserRepository();

// Re-export interfaces para uso em tipos
export type { IAuthRepository, ITenantRepository, ICompanyRepository, IUserRepository, ICrudRepository } from './interfaces.ts';
