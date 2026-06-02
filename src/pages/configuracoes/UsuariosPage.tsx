import { useState, useMemo } from 'react';
import {
  Users, Plus, Search, Edit, Trash2, KeyRound,
  CheckCircle2, XCircle, Clock, Shield, ChevronDown,
  Mail, Phone, MoreVertical, UserCheck, UserX,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type UserStatus = 'ativo' | 'inativo' | 'pendente';
type UserRole   = 'owner' | 'admin' | 'operador' | 'financeiro' | 'visualizador';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  lastAccess: string;
  createdAt: string;
  permissions: number;
}

const STATUS_CONFIG: Record<UserStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  ativo:    { label: 'Ativo',    color: 'text-green-400',        bg: 'bg-green-500/10 border-green-500/20',   icon: CheckCircle2 },
  inativo:  { label: 'Inativo', color: 'text-muted-foreground', bg: 'bg-muted/50 border-border',             icon: XCircle },
  pendente: { label: 'Pendente',color: 'text-yellow-400',       bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
};

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; bg: string }> = {
  owner:       { label: 'Proprietário', color: 'text-gold-400',   bg: 'bg-gold-500/10 border-gold-500/20' },
  admin:       { label: 'Administrador',color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  operador:    { label: 'Operador',     color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  financeiro:  { label: 'Financeiro',   color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
  visualizador:{ label: 'Visualizador', color: 'text-muted-foreground', bg: 'bg-muted/50 border-border' },
};

const MOCK_USERS: SystemUser[] = [
  { id: '1', name: 'Carlos Andrade',    email: 'carlos@abrasystem.com.br',    phone: '(11) 9 9000-0001', role: 'owner',       status: 'ativo',   lastAccess: 'Agora',             createdAt: '10/01/2024', permissions: 42 },
  { id: '2', name: 'Fernanda Lima',     email: 'fernanda@abrasystem.com.br',  phone: '(11) 9 9000-0002', role: 'admin',       status: 'ativo',   lastAccess: 'Hoje, 08:45',       createdAt: '15/01/2024', permissions: 38 },
  { id: '3', name: 'Ricardo Souza',     email: 'ricardo@abrasystem.com.br',   phone: '(11) 9 9000-0003', role: 'operador',    status: 'ativo',   lastAccess: 'Hoje, 09:12',       createdAt: '20/03/2024', permissions: 18 },
  { id: '4', name: 'Ana Paula Costa',   email: 'ana.paula@abrasystem.com.br', phone: '(11) 9 9000-0004', role: 'operador',    status: 'ativo',   lastAccess: 'Hoje, 07:55',       createdAt: '05/04/2024', permissions: 18 },
  { id: '5', name: 'Bruno Martins',     email: 'bruno@abrasystem.com.br',     phone: '(11) 9 9000-0005', role: 'financeiro',  status: 'ativo',   lastAccess: 'Ontem, 17:30',      createdAt: '10/04/2024', permissions: 24 },
  { id: '6', name: 'Juliana Ferraz',    email: 'juliana@abrasystem.com.br',   phone: '(11) 9 9000-0006', role: 'financeiro',  status: 'ativo',   lastAccess: 'Ontem, 16:00',      createdAt: '01/05/2024', permissions: 24 },
  { id: '7', name: 'Marcos Oliveira',   email: 'marcos@abrasystem.com.br',    phone: '(11) 9 9000-0007', role: 'operador',    status: 'inativo', lastAccess: '20/04/2026',        createdAt: '12/06/2024', permissions: 18 },
  { id: '8', name: 'Camila Torres',     email: 'camila@abrasystem.com.br',    phone: '(11) 9 9000-0008', role: 'visualizador',status: 'pendente',lastAccess: 'Nunca acessou',     createdAt: '10/05/2026', permissions: 6 },
];

const FILTER_TABS: { key: 'all' | UserStatus; label: string }[] = [
  { key: 'all',     label: 'Todos' },
  { key: 'ativo',   label: 'Ativo' },
  { key: 'inativo', label: 'Inativo' },
  { key: 'pendente',label: 'Pendente' },
];

function StatusBadge({ status }: { status: UserStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Shield className="h-2.5 w-2.5" />
      {cfg.label}
    </span>
  );
}

function UserAvatar({ name, role }: { name: string; role: UserRole }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const isOwner = role === 'owner';
  return (
    <div className={cn(
      'h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0',
      isOwner ? 'bg-gold-500/20 border border-gold-500/30 text-gold-400' : 'bg-muted border border-border text-muted-foreground'
    )}>
      {initials}
    </div>
  );
}

export function UsuariosPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => MOCK_USERS.filter((u) => {
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    return matchStatus && matchRole && matchSearch;
  }), [statusFilter, roleFilter, search]);

  const counts = useMemo(() => ({
    all:      MOCK_USERS.length,
    ativo:    MOCK_USERS.filter((u) => u.status === 'ativo').length,
    inativo:  MOCK_USERS.filter((u) => u.status === 'inativo').length,
    pendente: MOCK_USERS.filter((u) => u.status === 'pendente').length,
  }), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground">Gerenciamento de acessos e usuários do sistema</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-md shadow-gold-500/20">
          <Plus className="h-4 w-4" />
          Convidar Usuário
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><Users className="h-5 w-5 text-gold-400" /></div>
            <div><p className="text-xl font-bold">{counts.all}</p><p className="text-xs text-muted-foreground">Total Usuários</p></div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><UserCheck className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-xl font-bold text-green-400">{counts.ativo}</p><p className="text-xs text-muted-foreground">Ativos</p></div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10"><Clock className="h-5 w-5 text-yellow-400" /></div>
            <div><p className="text-xl font-bold text-yellow-400">{counts.pendente}</p><p className="text-xs text-muted-foreground">Convites pendentes</p></div>
          </CardContent>
        </Card>
        <Card className="border-muted">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted"><UserX className="h-5 w-5 text-muted-foreground" /></div>
            <div><p className="text-xl font-bold text-muted-foreground">{counts.inativo}</p><p className="text-xs text-muted-foreground">Inativos</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-gold-500" />
              Lista de Usuários
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
                  className="pl-3 pr-7 py-1.5 text-xs rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none text-muted-foreground"
                >
                  <option value="all">Todos os perfis</option>
                  {Object.entries(ROLE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Nome ou e-mail..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-48"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  statusFilter === tab.key
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {tab.label}
                <span className={cn('ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full',
                  statusFilter === tab.key ? 'bg-gold-500/20 text-gold-400' : 'bg-muted text-muted-foreground'
                )}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-t border-border">
              <colgroup>
                <col style={{ width: '28%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '14%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Usuário</th>
                  <th className="px-4 py-2.5 text-left">Contato</th>
                  <th className="px-4 py-2.5 text-center">Perfil</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5 text-center">Último Acesso</th>
                  <th className="px-4 py-2.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhum usuário encontrado</p>
                    </td>
                  </tr>
                ) : filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gold-500/5 transition-colors group">
                    {/* Usuário */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.name} role={u.role} />
                        <div>
                          <p className="font-semibold text-sm">{u.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Desde {u.createdAt} · {u.permissions} permissões</p>
                        </div>
                      </div>
                    </td>

                    {/* Contato */}
                    <td className="px-4 py-3">
                      <p className="text-xs flex items-center gap-1 text-muted-foreground">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </p>
                      <p className="text-xs flex items-center gap-1 text-muted-foreground mt-0.5">
                        <Phone className="h-3 w-3 shrink-0" />
                        {u.phone}
                      </p>
                    </td>

                    {/* Perfil */}
                    <td className="px-4 py-3 text-center">
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={u.status} />
                    </td>

                    {/* Último Acesso */}
                    <td className="px-4 py-3 text-center">
                      <p className={cn('text-xs font-medium',
                        u.lastAccess === 'Agora' ? 'text-green-400' : 'text-muted-foreground'
                      )}>
                        {u.lastAccess}
                      </p>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-md hover:bg-gold-500/10 text-muted-foreground hover:text-gold-400 transition-colors" title="Editar">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors" title="Redefinir senha">
                          <KeyRound className="h-3.5 w-3.5" />
                        </button>
                        {u.status === 'ativo'
                          ? <button className="p-1.5 rounded-md hover:bg-yellow-500/10 text-muted-foreground hover:text-yellow-400 transition-colors" title="Desativar">
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          : <button className="p-1.5 rounded-md hover:bg-green-500/10 text-muted-foreground hover:text-green-400 transition-colors" title="Ativar">
                              <UserCheck className="h-3.5 w-3.5" />
                            </button>
                        }
                        {u.role !== 'owner' && (
                          <button className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="Excluir">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                          <MoreVertical className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Usuários filtrados</p>
              <p className="text-sm font-bold mt-0.5">{filtered.length}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Slots utilizados</p>
              <p className="text-sm font-bold mt-0.5">{counts.all} / 20</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Disponíveis</p>
              <p className="text-sm font-bold text-green-400 mt-0.5">{20 - counts.all} slots</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
