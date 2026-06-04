import { useState, useMemo, useCallback } from 'react';
import {
  Plus, Search, Filter, Eye,
  CheckCircle2, XCircle, AlertCircle, TrendingUp,
  ShoppingBag, DollarSign, Edit, ChevronDown,
  Phone, Mail, MapPin, RefreshCw, Download,
  X, Loader2, Building2, MessageCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StoreStatus = 'active' | 'inactive' | 'defaulter';

interface Store {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  status: StoreStatus;
  totalOrders: number;
  totalValue: number;
  lastOrder: string;
  cnpjCpf: string;
}

const STATUS_CONFIG: Record<StoreStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  active:    { label: 'Ativa',        color: 'text-green-400',        bg: 'bg-green-500/10 border-green-500/20', icon: CheckCircle2 },
  inactive:  { label: 'Inativa',      color: 'text-muted-foreground', bg: 'bg-muted/50 border-border',           icon: XCircle },
  defaulter: { label: 'Inadimplente', color: 'text-red-400',          bg: 'bg-red-500/10 border-red-500/20',     icon: AlertCircle },
};

const MOCK_STORES: Store[] = [
  { id: '1',  name: 'Padaria Bom Pão Ltda',      phone: '(11) 3456-7890',   email: 'contato@bompao.com.br',       city: 'São Paulo',   district: 'Centro',      status: 'active',    totalOrders: 142, totalValue: 8420.00,  lastOrder: '14/05/2026', cnpjCpf: '12.345.678/0001-90' },
  { id: '2',  name: 'Dog King Centro',           phone: '(11) 9 9812-3456', email: 'centro@dogking.com.br',       city: 'São Paulo',   district: 'Centro',      status: 'active',    totalOrders: 238, totalValue: 14950.00, lastOrder: '14/05/2026', cnpjCpf: '32.165.498/0001-00' },
  { id: '3',  name: 'Restaurante Sabor & Arte',   phone: '(11) 4567-8901',   email: 'saborarte@outlook.com',       city: 'São Paulo',   district: 'Pinheiros',   status: 'active',    totalOrders: 217, totalValue: 15340.00, lastOrder: '13/05/2026', cnpjCpf: '98.765.432/0001-10' },
  { id: '4',  name: 'Hamburgueria Burger House',  phone: '(11) 9 9234-5678', email: 'contato@burgerhouse.com.br',  city: 'São Paulo',   district: 'Vila Nova',   status: 'inactive',  totalOrders: 12,  totalValue: 540.00,   lastOrder: '02/03/2026', cnpjCpf: '45.678.901/0002-33' },
  { id: '5',  name: 'Farmácia Saúde Total',       phone: '(11) 3234-5678',   email: 'saude.total@farma.com',       city: 'São Paulo',   district: 'Moema',       status: 'active',    totalOrders: 89,  totalValue: 6780.00,  lastOrder: '14/05/2026', cnpjCpf: '45.678.901/0001-23' },
  { id: '6',  name: 'Pizzaria Bella Itália',      phone: '(11) 9 8765-4321', email: 'bellaitalia@gmail.com',       city: 'São Paulo',   district: 'Moema',       status: 'defaulter', totalOrders: 24,  totalValue: 1230.00,  lastOrder: '10/04/2026', cnpjCpf: '78.901.234/0001-66' },
  { id: '7',  name: 'Mercadinho do Zé',           phone: '(11) 3345-6789',   email: 'ze.mercadinho@uol.com.br',    city: 'São Paulo',   district: 'Tatuapé',     status: 'active',    totalOrders: 331, totalValue: 22100.00, lastOrder: '14/05/2026', cnpjCpf: '23.456.789/0001-34' },
  { id: '8',  name: 'Dog King Batel',            phone: '(11) 9 7654-3210', email: 'batel@dogking.com.br',        city: 'São Paulo',   district: 'Itaim Bibi',  status: 'active',    totalOrders: 167, totalValue: 9120.00,  lastOrder: '13/05/2026', cnpjCpf: '01.234.567/0001-99' },
  { id: '9',  name: 'Clínica Bem Estar',          phone: '(11) 4456-7890',   email: 'contato@clinicabem.com.br',   city: 'São Paulo',   district: 'Santana',     status: 'defaulter', totalOrders: 55,  totalValue: 4890.00,  lastOrder: '01/04/2026', cnpjCpf: '34.567.890/0001-45' },
  { id: '10', name: 'Sushi Express',              phone: '(11) 9 6543-2109', email: 'contato@sushiexpress.com.br', city: 'São Paulo',   district: 'Lapa',        status: 'inactive',  totalOrders: 8,   totalValue: 310.00,   lastOrder: '15/01/2026', cnpjCpf: '23.456.789/0002-11' },
  { id: '11', name: 'Açougue Carne Boa',          phone: '(11) 3567-8901',   email: 'carneboacontato@gmail.com',   city: 'Santo André', district: 'Centro',      status: 'active',    totalOrders: 198, totalValue: 18650.00, lastOrder: '14/05/2026', cnpjCpf: '56.789.012/0001-56' },
  { id: '12', name: 'Doceria Doce Sabor',         phone: '(11) 9 5432-1098', email: 'contato@docesabor.com.br',     city: 'Santo André', district: 'Vila Bastos', status: 'active',    totalOrders: 29,  totalValue: 1480.00,  lastOrder: '12/05/2026', cnpjCpf: '34.567.890/0002-22' },
  { id: '13', name: 'Loja Fashion Mix',           phone: '(11) 3678-9012',   email: 'fashionmix@loja.com.br',      city: 'São Paulo',   district: 'Brooklin',    status: 'active',    totalOrders: 74,  totalValue: 5210.00,  lastOrder: '11/05/2026', cnpjCpf: '67.890.123/0001-67' },
];

const FILTER_TABS: { key: 'all' | StoreStatus; label: string }[] = [
  { key: 'all',       label: 'Todas' },
  { key: 'active',    label: 'Ativas' },
  { key: 'inactive',  label: 'Inativas' },
  { key: 'defaulter', label: 'Inadimplentes' },
];

function StatusBadge({ status }: { status: StoreStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-gold-500/15 border border-gold-500/20 flex items-center justify-center shrink-0">
      <span className="text-[11px] font-bold text-gold-500">{initials}</span>
    </div>
  );
}

export function LojasPage() {
  const [stores, setStores] = useState<Store[]>(MOCK_STORES);
  const [activeFilter, setActiveFilter] = useState<'all' | StoreStatus>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [detailStore, setDetailStore] = useState<Store | null>(null);
  const [editStore, setEditStore] = useState<Store | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<StoreStatus>('active');
  const [editSaving, setEditSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCnpjCpf, setFormCnpjCpf] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formDistrict, setFormDistrict] = useState('');

  const filtered = useMemo(() => stores.filter((s) => {
    const matchStatus = activeFilter === 'all' || s.status === activeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.phone.includes(q) ||
      s.email.toLowerCase().includes(q) || s.district.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) || s.cnpjCpf.includes(q);
    return matchStatus && matchSearch;
  }), [stores, activeFilter, search]);

  const counts = useMemo(() => ({
    all:       stores.length,
    active:    stores.filter((s) => s.status === 'active').length,
    inactive:  stores.filter((s) => s.status === 'inactive').length,
    defaulter: stores.filter((s) => s.status === 'defaulter').length,
  }), [stores]);

  const totalRevenue = useMemo(
    () => stores.filter((s) => s.status === 'active').reduce((sum, s) => sum + s.totalValue, 0), [stores],
  );
  const totalOrders = useMemo(() => stores.reduce((sum, s) => sum + s.totalOrders, 0), [stores]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setRefreshing(false);
  }, []);

  const resetForm = () => { setFormName(''); setFormPhone(''); setFormEmail(''); setFormCnpjCpf(''); setFormCity(''); setFormDistrict(''); };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['Nome da Loja', 'Telefone', 'Email', 'CNPJ/CPF', 'Cidade', 'Bairro', 'Status', 'Pedidos', 'Faturamento', 'Último Pedido'],
      ...stores.map((s) => [
        s.name, s.phone, s.email, s.cnpjCpf, s.city, s.district,
        STATUS_CONFIG[s.status].label, String(s.totalOrders), s.totalValue.toFixed(2), s.lastOrder,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lojas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Lojas exportadas com sucesso!');
  }, [stores, showToast]);

  const handleOpenEdit = useCallback((s: Store) => {
    setEditStore(s);
    setEditName(s.name);
    setEditPhone(s.phone);
    setEditEmail(s.email);
    setEditStatus(s.status);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editStore) return;
    setEditSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setStores((prev) => prev.map((s) => s.id === editStore.id ? { ...s, name: editName, phone: editPhone, email: editEmail, status: editStatus } : s));
    setEditSaving(false);
    setEditStore(null);
    showToast('Loja atualizada com sucesso!');
  }, [editStore, editName, editPhone, editEmail, editStatus, showToast]);

  const handleWhatsApp = useCallback((phone: string, name: string) => {
    const clean = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá ${name}! Aqui é da AbraSystem.`);
    window.open(`https://wa.me/55${clean}?text=${msg}`, '_blank');
  }, []);

  const handleCall = useCallback((phone: string) => {
    const clean = phone.replace(/\D/g, '');
    window.open(`tel:+55${clean}`, '_self');
  }, []);

  const handleEmail = useCallback((email: string) => {
    window.open(`mailto:${email}`, '_self');
  }, []);

  const handleCreateStore = async () => {
    if (!formName || !formPhone) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    const newStore: Store = {
      id: String(stores.length + 1),
      name: formName,
      phone: formPhone,
      email: formEmail,
      cnpjCpf: formCnpjCpf,
      city: formCity || 'São Paulo',
      district: formDistrict || 'Centro',
      status: 'active',
      totalOrders: 0,
      totalValue: 0,
      lastOrder: '—',
    };
    setStores((prev) => [newStore, ...prev]);
    setSaving(false);
    setModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lojas</h1>
          <p className="text-muted-foreground">Gerencie sua base de lojas parceiras</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Atualizado às {lastUpdate}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors',
              refreshing && 'opacity-60 cursor-not-allowed'
            )}
          >
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-md shadow-gold-500/20"
          >
            <Plus className="h-4 w-4" />
            Nova Loja
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><Building2 className="h-5 w-5 text-gold-400" /></div>
            <div><p className="text-2xl font-bold">{counts.all}</p><p className="text-xs text-muted-foreground">Total de Lojas</p></div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-2xl font-bold">{counts.active}</p><p className="text-xs text-muted-foreground">Ativas</p></div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><ShoppingBag className="h-5 w-5 text-gold-400" /></div>
            <div><p className="text-2xl font-bold">{totalOrders.toLocaleString('pt-BR')}</p><p className="text-xs text-muted-foreground">Pedidos Totais</p></div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><DollarSign className="h-5 w-5 text-gold-500" /></div>
            <div><p className="text-xl font-bold">{totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><p className="text-xs text-muted-foreground">Faturamento (ativas)</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Card da tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gold-500" />
              Base de Lojas
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar loja..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-52"
                />
              </div>
              <div className="relative">
                <button onClick={() => setFilterDropdownOpen(!filterDropdownOpen)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border bg-muted hover:bg-accent transition-colors text-muted-foreground">
                  <Filter className="h-3.5 w-3.5" />
                  Filtros
                  <ChevronDown className={cn('h-3 w-3 transition-transform', filterDropdownOpen && 'rotate-180')} />
                </button>
                {filterDropdownOpen && (
                  <div className="absolute right-0 top-10 z-20 w-48 bg-card border border-border rounded-lg shadow-xl shadow-black/30 py-1 animate-fade-in">
                    <button onClick={() => { setActiveFilter('active'); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-400" /> Apenas Ativas
                    </button>
                    <button onClick={() => { setActiveFilter('inactive'); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <XCircle className="h-3 w-3 text-muted-foreground" /> Inativas
                    </button>
                    <button onClick={() => { setActiveFilter('defaulter'); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-red-400" /> Inadimplentes
                    </button>
                    <div className="border-t border-border my-1" />
                    <button onClick={() => { setActiveFilter('all'); setSearch(''); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors text-gold-400 font-medium">
                      Limpar Filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2 flex-wrap">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  activeFilter === tab.key
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {tab.label}
                <span className={cn(
                  'ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full',
                  activeFilter === tab.key ? 'bg-gold-500/20 text-gold-400' : 'bg-muted text-muted-foreground'
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
                <col style={{ width: '30%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '6%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Loja</th>
                  <th className="px-4 py-2.5 text-left">Contato</th>
                  <th className="px-4 py-2.5 text-left">Localização</th>
                  <th className="px-4 py-2.5 text-left">Último Pedido</th>
                  <th className="px-4 py-2.5 text-center">Pedidos</th>
                  <th className="px-4 py-2.5 text-right">Faturamento</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      <Building2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhuma loja encontrada</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-gold-500/5 transition-colors group"
                    >
                      {/* Loja */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={s.name} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{s.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{s.cnpjCpf}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contato */}
                      <td className="px-4 py-3">
                        <p className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3 shrink-0" />{s.phone}
                        </p>
                        <p className="text-[11px] flex items-center gap-1 text-muted-foreground mt-0.5 truncate">
                          <Mail className="h-2.5 w-2.5 shrink-0" />{s.email}
                        </p>
                      </td>

                      {/* Localização */}
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium">{s.city}</p>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-2.5 w-2.5 shrink-0" />{s.district}
                        </p>
                      </td>

                      {/* Último pedido */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-muted-foreground">{s.lastOrder}</p>
                      </td>

                      {/* Pedidos */}
                      <td className="px-4 py-3 text-center">
                        <p className="text-sm font-semibold">{s.totalOrders}</p>
                      </td>

                      {/* Faturamento */}
                      <td className="px-4 py-3 text-right">
                        <p className={cn('text-sm font-semibold', s.status === 'defaulter' ? 'text-red-400' : '')}>
                          {s.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </td>

                      {/* Status + ações */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <StatusBadge status={s.status} />
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => handleOpenEdit(s)} className="p-1 rounded-md hover:bg-gold-500/10 text-muted-foreground hover:text-gold-400 transition-colors" title="Editar">
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setDetailStore(s)} className="p-1 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors" title="Ver detalhes">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground bg-muted/20">
            <span>{filtered.length} loja{filtered.length !== 1 ? 's' : ''} exibida{filtered.length !== 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              {counts.active} ativas de {counts.all} cadastradas
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Modal Nova Loja */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setModalOpen(false); resetForm(); }} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl shadow-black/40 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold-500/10"><Building2 className="h-5 w-5 text-gold-500" /></div>
                <div>
                  <h2 className="text-lg font-bold">Nova Loja</h2>
                  <p className="text-xs text-muted-foreground">Preencha os dados da loja</p>
                </div>
              </div>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nome da Loja / Razão Social *</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Padaria Bom Pão Ltda"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Telefone *</label>
                  <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="(11) 9 9999-9999"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">CNPJ / CPF</label>
                  <input type="text" value={formCnpjCpf} onChange={(e) => setFormCnpjCpf(e.target.value)} placeholder="00.000.000/0000-00"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">E-mail</label>
                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="loja@email.com"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Cidade</label>
                  <input type="text" value={formCity} onChange={(e) => setFormCity(e.target.value)} placeholder="São Paulo"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Bairro</label>
                  <input type="text" value={formDistrict} onChange={(e) => setFormDistrict(e.target.value)} placeholder="Centro"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancelar
              </button>
              <button
                disabled={!formName || !formPhone || saving}
                onClick={handleCreateStore}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                  formName && formPhone && !saving
                    ? 'bg-gold-500 hover:bg-gold-600 text-black shadow-md shadow-gold-500/20'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {saving ? 'Salvando...' : 'Cadastrar Loja'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer de Detalhes */}
      {detailStore && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailStore(null)} />
          <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl shadow-black/40 animate-fade-in flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={detailStore.name} />
                <div>
                  <h2 className="text-lg font-bold">{detailStore.name}</h2>
                  <p className="text-xs text-muted-foreground font-mono">{detailStore.cnpjCpf}</p>
                </div>
              </div>
              <button onClick={() => setDetailStore(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={detailStore.status} />
                <span className="text-xs text-muted-foreground">Último pedido: {detailStore.lastOrder}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Pedidos</p>
                  <p className="text-lg font-bold">{detailStore.totalOrders}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Faturamento</p>
                  <p className="text-lg font-bold text-gold-400">{detailStore.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Contato</p>
                <p className="text-sm flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{detailStore.phone}</p>
                <p className="text-sm flex items-center gap-1.5 mt-1"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{detailStore.email}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Localização</p>
                <p className="text-sm flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gold-500" />{detailStore.district}, {detailStore.city}</p>
              </div>
            </div>
            <div className="shrink-0 border-t border-border p-4 space-y-2">
              <div className="flex gap-2">
                <button onClick={() => handleCall(detailStore.phone)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Phone className="h-3.5 w-3.5" /> Ligar
                </button>
                <button onClick={() => handleWhatsApp(detailStore.phone, detailStore.name)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-sm text-green-400 transition-colors">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </button>
                <button onClick={() => handleEmail(detailStore.email)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Mail className="h-3.5 w-3.5" /> Email
                </button>
              </div>
              <button onClick={() => { handleOpenEdit(detailStore); setDetailStore(null); }} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-black font-semibold text-sm transition-colors">
                <Edit className="h-3.5 w-3.5" /> Editar Loja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer de Edição */}
      {editStore && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditStore(null)} />
          <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl shadow-black/40 animate-fade-in flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold-500/10"><Edit className="h-5 w-5 text-gold-500" /></div>
                <div>
                  <h2 className="text-lg font-bold">Editar Loja</h2>
                  <p className="text-xs text-muted-foreground font-mono">{editStore.cnpjCpf}</p>
                </div>
              </div>
              <button onClick={() => setEditStore(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nome *</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Telefone *</label>
                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">E-mail</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Status</label>
                <div className="flex gap-2">
                  {(['active', 'inactive', 'defaulter'] as StoreStatus[]).map((status) => (
                    <button key={status} onClick={() => setEditStatus(status)} className={cn('flex-1 py-2 rounded-lg border text-xs font-medium transition-all', editStatus === status ? `${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].color}` : 'border-border text-muted-foreground hover:bg-muted')}>
                      {STATUS_CONFIG[status].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="shrink-0 border-t border-border p-4 flex items-center justify-end gap-2">
              <button onClick={() => setEditStore(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              <button disabled={!editName || !editPhone || editSaving} onClick={handleSaveEdit} className={cn('inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all', editName && editPhone && !editSaving ? 'bg-gold-500 hover:bg-gold-600 text-black shadow-md shadow-gold-500/20' : 'bg-muted text-muted-foreground cursor-not-allowed')}>
                {editSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {editSaving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-gold-500/30 rounded-lg px-4 py-3 shadow-xl shadow-black/30 animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
