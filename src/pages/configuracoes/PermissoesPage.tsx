import { useState } from 'react';
import {
  Shield, Plus, Edit, Copy, Trash2, ChevronDown, ChevronRight,
  CheckCircle2, XCircle, Users, Lock, Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Permission {
  module: string;
  actions: { label: string; granted: boolean }[];
}

interface Profile {
  id: string;
  name: string;
  description: string;
  color: string;
  usersCount: number;
  isSystem: boolean;
  permissions: Permission[];
}

const MOCK_PROFILES: Profile[] = [
  {
    id: '1', name: 'Proprietário', description: 'Acesso total a todos os módulos e configurações do sistema.',
    color: 'text-gold-400 bg-gold-500/10 border-gold-500/30', usersCount: 1, isSystem: true,
    permissions: [
      { module: 'Entregas',       actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: true }, { label: 'Editar', granted: true }, { label: 'Excluir', granted: true }] },
      { module: 'Financeiro',     actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: true }, { label: 'Editar', granted: true }, { label: 'Excluir', granted: true }] },
      { module: 'Clientes',       actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: true }, { label: 'Editar', granted: true }, { label: 'Excluir', granted: true }] },
      { module: 'Entregadores',   actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: true }, { label: 'Editar', granted: true }, { label: 'Excluir', granted: true }] },
      { module: 'Fiscal',         actions: [{ label: 'Visualizar', granted: true }, { label: 'Emitir', granted: true }, { label: 'Cancelar', granted: true }, { label: 'Configurar', granted: true }] },
      { module: 'Mensageria',     actions: [{ label: 'Visualizar', granted: true }, { label: 'Enviar', granted: true }, { label: 'Configurar', granted: true }] },
      { module: 'Configurações',  actions: [{ label: 'Visualizar', granted: true }, { label: 'Editar', granted: true }, { label: 'Usuários', granted: true }, { label: 'Permissões', granted: true }] },
    ],
  },
  {
    id: '2', name: 'Administrador', description: 'Acesso completo exceto configurações de usuários e permissões.',
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', usersCount: 1, isSystem: true,
    permissions: [
      { module: 'Entregas',       actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: true }, { label: 'Editar', granted: true }, { label: 'Excluir', granted: true }] },
      { module: 'Financeiro',     actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: true }, { label: 'Editar', granted: true }, { label: 'Excluir', granted: false }] },
      { module: 'Clientes',       actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: true }, { label: 'Editar', granted: true }, { label: 'Excluir', granted: false }] },
      { module: 'Entregadores',   actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: true }, { label: 'Editar', granted: true }, { label: 'Excluir', granted: false }] },
      { module: 'Fiscal',         actions: [{ label: 'Visualizar', granted: true }, { label: 'Emitir', granted: true }, { label: 'Cancelar', granted: true }, { label: 'Configurar', granted: false }] },
      { module: 'Mensageria',     actions: [{ label: 'Visualizar', granted: true }, { label: 'Enviar', granted: true }, { label: 'Configurar', granted: false }] },
      { module: 'Configurações',  actions: [{ label: 'Visualizar', granted: true }, { label: 'Editar', granted: true }, { label: 'Usuários', granted: false }, { label: 'Permissões', granted: false }] },
    ],
  },
  {
    id: '3', name: 'Operador', description: 'Gerencia entregas, entregadores e clientes. Sem acesso financeiro ou fiscal.',
    color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', usersCount: 3, isSystem: true,
    permissions: [
      { module: 'Entregas',       actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: true }, { label: 'Editar', granted: true }, { label: 'Excluir', granted: false }] },
      { module: 'Financeiro',     actions: [{ label: 'Visualizar', granted: false }, { label: 'Criar', granted: false }, { label: 'Editar', granted: false }, { label: 'Excluir', granted: false }] },
      { module: 'Clientes',       actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: true }, { label: 'Editar', granted: true }, { label: 'Excluir', granted: false }] },
      { module: 'Entregadores',   actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: false }, { label: 'Editar', granted: true }, { label: 'Excluir', granted: false }] },
      { module: 'Fiscal',         actions: [{ label: 'Visualizar', granted: false }, { label: 'Emitir', granted: false }, { label: 'Cancelar', granted: false }, { label: 'Configurar', granted: false }] },
      { module: 'Mensageria',     actions: [{ label: 'Visualizar', granted: true }, { label: 'Enviar', granted: true }, { label: 'Configurar', granted: false }] },
      { module: 'Configurações',  actions: [{ label: 'Visualizar', granted: false }, { label: 'Editar', granted: false }, { label: 'Usuários', granted: false }, { label: 'Permissões', granted: false }] },
    ],
  },
  {
    id: '4', name: 'Financeiro', description: 'Acesso ao módulo financeiro, fiscal e relatórios. Somente visualização de operações.',
    color: 'text-green-400 bg-green-500/10 border-green-500/30', usersCount: 2, isSystem: true,
    permissions: [
      { module: 'Entregas',       actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: false }, { label: 'Editar', granted: false }, { label: 'Excluir', granted: false }] },
      { module: 'Financeiro',     actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: true }, { label: 'Editar', granted: true }, { label: 'Excluir', granted: false }] },
      { module: 'Clientes',       actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: false }, { label: 'Editar', granted: false }, { label: 'Excluir', granted: false }] },
      { module: 'Entregadores',   actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: false }, { label: 'Editar', granted: false }, { label: 'Excluir', granted: false }] },
      { module: 'Fiscal',         actions: [{ label: 'Visualizar', granted: true }, { label: 'Emitir', granted: true }, { label: 'Cancelar', granted: false }, { label: 'Configurar', granted: false }] },
      { module: 'Mensageria',     actions: [{ label: 'Visualizar', granted: true }, { label: 'Enviar', granted: false }, { label: 'Configurar', granted: false }] },
      { module: 'Configurações',  actions: [{ label: 'Visualizar', granted: false }, { label: 'Editar', granted: false }, { label: 'Usuários', granted: false }, { label: 'Permissões', granted: false }] },
    ],
  },
  {
    id: '5', name: 'Visualizador', description: 'Somente leitura em todos os módulos. Sem permissão para criar, editar ou excluir.',
    color: 'text-muted-foreground bg-muted/50 border-border', usersCount: 1, isSystem: true,
    permissions: [
      { module: 'Entregas',       actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: false }, { label: 'Editar', granted: false }, { label: 'Excluir', granted: false }] },
      { module: 'Financeiro',     actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: false }, { label: 'Editar', granted: false }, { label: 'Excluir', granted: false }] },
      { module: 'Clientes',       actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: false }, { label: 'Editar', granted: false }, { label: 'Excluir', granted: false }] },
      { module: 'Entregadores',   actions: [{ label: 'Visualizar', granted: true }, { label: 'Criar', granted: false }, { label: 'Editar', granted: false }, { label: 'Excluir', granted: false }] },
      { module: 'Fiscal',         actions: [{ label: 'Visualizar', granted: true }, { label: 'Emitir', granted: false }, { label: 'Cancelar', granted: false }, { label: 'Configurar', granted: false }] },
      { module: 'Mensageria',     actions: [{ label: 'Visualizar', granted: true }, { label: 'Enviar', granted: false }, { label: 'Configurar', granted: false }] },
      { module: 'Configurações',  actions: [{ label: 'Visualizar', granted: false }, { label: 'Editar', granted: false }, { label: 'Usuários', granted: false }, { label: 'Permissões', granted: false }] },
    ],
  },
];

export function PermissoesPage() {
  const [expandedId, setExpandedId] = useState<string | null>('3');

  const toggle = (id: string) => setExpandedId(expandedId === id ? null : id);

  const grantedCount = (p: Profile) =>
    p.permissions.reduce((s, mod) => s + mod.actions.filter((a) => a.granted).length, 0);
  const totalCount = (p: Profile) =>
    p.permissions.reduce((s, mod) => s + mod.actions.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Permissões</h1>
          <p className="text-muted-foreground">Perfis de acesso e controle de permissões por módulo</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-md shadow-gold-500/20">
          <Plus className="h-4 w-4" />
          Novo Perfil
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Perfis ativos',  value: MOCK_PROFILES.length,                                          color: 'text-gold-400',   bg: 'bg-gold-500/10',   icon: <Shield className="h-5 w-5 text-gold-400" /> },
          { label: 'Total usuários', value: MOCK_PROFILES.reduce((s, p) => s + p.usersCount, 0),           color: '',               bg: 'bg-muted',         icon: <Users className="h-5 w-5 text-muted-foreground" /> },
          { label: 'Módulos',        value: MOCK_PROFILES[0].permissions.length,                            color: 'text-blue-400',  bg: 'bg-blue-500/10',   icon: <Lock className="h-5 w-5 text-blue-400" /> },
          { label: 'Perfis sistema', value: MOCK_PROFILES.filter((p) => p.isSystem).length,                 color: 'text-purple-400',bg: 'bg-purple-500/10', icon: <Shield className="h-5 w-5 text-purple-400" /> },
        ].map(({ label, value, bg, icon }) => (
          <Card key={label} className="border-gold-500/10">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('p-2 rounded-lg', bg)}>{icon}</div>
              <div><p className="text-xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de perfis */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-gold-500" />
            Perfis de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border border-t border-border">
            {MOCK_PROFILES.map((profile) => {
              const isExpanded = expandedId === profile.id;
              const granted    = grantedCount(profile);
              const total      = totalCount(profile);
              const pct        = Math.round((granted / total) * 100);

              return (
                <div key={profile.id}>
                  {/* Linha do perfil */}
                  <div
                    className="flex items-center gap-4 px-4 py-4 cursor-pointer hover:bg-gold-500/5 transition-colors group"
                    onClick={() => toggle(profile.id)}
                  >
                    {/* Ícone expand */}
                    <div className="text-muted-foreground shrink-0">
                      {isExpanded
                        ? <ChevronDown className="h-4 w-4 text-gold-500" />
                        : <ChevronRight className="h-4 w-4" />
                      }
                    </div>

                    {/* Nome + descrição */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border', profile.color)}>
                          <Shield className="h-3 w-3" />
                          {profile.name}
                        </span>
                        {profile.isSystem && (
                          <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">Sistema</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{profile.description}</p>
                    </div>

                    {/* Barra de permissões */}
                    <div className="hidden md:flex items-center gap-3 w-40 shrink-0">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-gold-500/70" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground w-16 text-right">{granted}/{total} permissões</span>
                    </div>

                    {/* Usuários */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                      <Users className="h-3.5 w-3.5" />
                      {profile.usersCount} {profile.usersCount === 1 ? 'usuário' : 'usuários'}
                    </div>

                    {/* Ações */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <button className="p-1.5 rounded-md hover:bg-gold-500/10 text-muted-foreground hover:text-gold-400 transition-colors" title="Editar">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-purple-500/10 text-muted-foreground hover:text-purple-400 transition-colors" title="Duplicar">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      {!profile.isSystem && (
                        <button className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="Excluir">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tabela de permissões expandida */}
                  {isExpanded && (
                    <div className="px-4 pb-4 bg-muted/20 border-t border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold pt-3 pb-2">
                        Permissões por módulo
                      </p>
                      <div className="rounded-xl border border-border overflow-hidden">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted/60 text-xs font-semibold text-muted-foreground">
                              <th className="px-4 py-2 text-left w-1/4">Módulo</th>
                              {profile.permissions[0].actions.map((a) => (
                                <th key={a.label} className="px-3 py-2 text-center">{a.label}</th>
                              ))}
                              <th className="px-3 py-2 text-center">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {profile.permissions.map((mod) => {
                              const modGranted = mod.actions.filter((a) => a.granted).length;
                              return (
                                <tr key={mod.module} className="hover:bg-muted/30 transition-colors">
                                  <td className="px-4 py-2.5">
                                    <p className="text-xs font-semibold">{mod.module}</p>
                                  </td>
                                  {mod.actions.map((action) => (
                                    <td key={action.label} className="px-3 py-2.5 text-center">
                                      {action.granted
                                        ? <CheckCircle2 className="h-4 w-4 text-green-400 mx-auto" />
                                        : <XCircle className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                                      }
                                    </td>
                                  ))}
                                  <td className="px-3 py-2.5 text-center">
                                    <span className={cn('text-xs font-bold',
                                      modGranted === mod.actions.length ? 'text-green-400' :
                                      modGranted === 0 ? 'text-muted-foreground' : 'text-yellow-400'
                                    )}>
                                      {modGranted}/{mod.actions.length}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
