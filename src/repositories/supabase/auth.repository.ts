import { supabase } from '@/lib/supabase';
import type { IAuthRepository } from '../interfaces';
import type { User, Tenant, Company, LoginResponse } from '@shared/types';

export class SupabaseAuthRepository implements IAuthRepository {

  async login(email: string, password: string): Promise<LoginResponse> {
    // 1. Autenticar com Supabase Auth nativo
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session || !authData.user) {
      throw new Error(
        authError?.message === 'Invalid login credentials'
          ? 'E-mail ou senha inválidos'
          : authError?.message || 'Erro ao autenticar'
      );
    }

    const { session, user: authUser } = authData;

    // 2. Tentar buscar perfil do usuário na tabela users (se existir)
    let userProfile: User;
    try {
      const { data: userRow } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, is_tenant_owner, role')
        .eq('id', authUser.id)
        .single();

      userProfile = {
        id: userRow?.id ?? authUser.id,
        name: userRow?.name ?? authUser.email?.split('@')[0] ?? 'Usuário',
        email: userRow?.email ?? authUser.email ?? '',
        avatar: userRow?.avatar_url ?? null,
        role: userRow?.role ?? (userRow?.is_tenant_owner ? 'owner' : 'user'),
        permissions: ['admin'],
      };
    } catch {
      // Tabela users não existe ainda — usar dados do auth
      userProfile = {
        id: authUser.id,
        name: authUser.user_metadata?.name ?? authUser.email?.split('@')[0] ?? 'Usuário',
        email: authUser.email ?? '',
        avatar: authUser.user_metadata?.avatar_url ?? null,
        role: 'admin',
        permissions: ['admin'],
      };
    }

    // 3. Tentar buscar tenant (se existir)
    let tenant: Tenant;
    try {
      const { data: tenantRow } = await supabase
        .from('tenants')
        .select('id, name, status, plan')
        .limit(1)
        .single();

      tenant = {
        id: tenantRow?.id ?? 'default',
        name: tenantRow?.name ?? 'Dog King',
        status: tenantRow?.status ?? 'active',
        plan: tenantRow?.plan ?? 'Pro',
      };
    } catch {
      tenant = {
        id: 'default',
        name: 'Dog King',
        status: 'active',
        plan: 'Pro',
      };
    }

    // 4. Tentar buscar empresas (se existir)
    let companies: Company[] = [];
    try {
      const { data: companyRows } = await supabase
        .from('companies')
        .select('id, name, cnpj, city, state')
        .limit(10);

      if (companyRows && companyRows.length > 0) {
        companies = companyRows.map((c) => ({
          id: c.id,
          name: c.name,
          cnpj: c.cnpj ?? '',
          city: c.city ?? '',
          state: c.state ?? '',
        }));
      }
    } catch {
      // sem empresas ainda
    }

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      user: userProfile,
      tenant,
      companies,
    };
  }

  async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async refreshSession(): Promise<{ accessToken: string } | null> {
    const { data } = await supabase.auth.refreshSession();
    if (data.session) {
      return { accessToken: data.session.access_token };
    }
    return null;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    try {
      const { data: userRow } = await supabase
        .from('users')
        .select('id, name, email, avatar_url, is_tenant_owner')
        .eq('id', authUser.id)
        .single();

      if (!userRow) throw new Error('no row');

      return {
        id: userRow.id,
        name: userRow.name,
        email: userRow.email,
        avatar: userRow.avatar_url,
        role: userRow.is_tenant_owner ? 'owner' : 'user',
        permissions: ['admin'],
      };
    } catch {
      return {
        id: authUser.id,
        name: authUser.user_metadata?.name ?? authUser.email?.split('@')[0] ?? 'Usuário',
        email: authUser.email ?? '',
        avatar: authUser.user_metadata?.avatar_url ?? null,
        role: 'admin',
        permissions: ['admin'],
      };
    }
  }
}
