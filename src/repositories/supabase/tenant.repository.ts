import { supabase } from '@/lib/supabase';
import type { ITenantRepository } from '../interfaces';
import type { Tenant } from '@shared/types';

export class SupabaseTenantRepository implements ITenantRepository {

  async getById(id: string): Promise<Tenant | null> {
    const { data, error } = await supabase
      .from('tenants')
      .select('id, name, status, plan_id, plans(slug)')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      status: data.status as Tenant['status'],
      plan: (data as any).plans?.slug ?? 'starter',
    };
  }
}
