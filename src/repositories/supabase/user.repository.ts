import { supabase } from '@/lib/supabase';
import type { IUserRepository } from '../interfaces';
import type { User } from '@shared/types';

export class SupabaseUserRepository implements IUserRepository {

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, is_tenant_owner')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar_url,
      role: data.is_tenant_owner ? 'owner' : 'user',
      permissions: [],
    };
  }

  async getByTenantId(tenantId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, avatar_url, is_tenant_owner, status')
      .eq('tenant_id', tenantId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('name');

    if (error || !data) return [];

    return data.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      avatar: u.avatar_url,
      role: u.is_tenant_owner ? 'owner' : 'user',
      permissions: [],
    }));
  }

  async getPermissions(userId: string, companyId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_company_roles')
      .select('roles(slug, permissions)')
      .eq('user_id', userId)
      .eq('company_id', companyId)
      .eq('is_active', true);

    if (error || !data) return [];

    const perms = new Set<string>();
    for (const ucr of data) {
      const role = (ucr as any).roles;
      if (role?.slug === 'admin') { perms.add('admin'); continue; }
      if (role?.permissions && typeof role.permissions === 'object') {
        for (const [mod, actions] of Object.entries(role.permissions as Record<string, Record<string, boolean>>)) {
          for (const [action, allowed] of Object.entries(actions)) {
            if (allowed) perms.add(`${mod}.${action}`);
          }
        }
      }
    }
    return Array.from(perms);
  }
}
