import { supabase } from '@/lib/supabase';
import type { ICompanyRepository } from '../interfaces';
import type { Company } from '@shared/types';

export class SupabaseCompanyRepository implements ICompanyRepository {

  async getByTenantId(tenantId: string): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, document, address_city, address_state')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name');

    if (error || !data) return [];

    return data.map((c) => ({
      id: c.id,
      name: c.name,
      cnpj: c.document ?? '',
      city: c.address_city ?? '',
      state: c.address_state ?? '',
    }));
  }

  async getById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('id, name, document, address_city, address_state')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      cnpj: data.document ?? '',
      city: data.address_city ?? '',
      state: data.address_state ?? '',
    };
  }
}
