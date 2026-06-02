import { supabase } from '@/lib/supabase';
import type { IAuthRepository } from '../interfaces';
import type { User, Tenant, Company, LoginResponse } from '@shared/types';

export class SupabaseAuthRepository implements IAuthRepository {

  async login(email: string, password: string): Promise<LoginResponse> {
    const { data, error } = await supabase.rpc('app_login', {
      p_email: email,
      p_password: password,
    });

    if (error || !data) {
      // O Supabase retorna a mensagem de exceção lançada na RPC (ex: 'E-mail ou senha inválidos')
      throw new Error(error?.message || 'E-mail ou senha inválidos');
    }

    return data as LoginResponse;
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

    const { data: userRow } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, is_tenant_owner')
      .eq('id', authUser.id)
      .single();

    if (!userRow) return null;

    return {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      avatar: userRow.avatar_url,
      role: userRow.is_tenant_owner ? 'owner' : 'user',
      permissions: [],
    };
  }
}
