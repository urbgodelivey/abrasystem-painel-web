import { useState, useMemo, useCallback } from 'react';
import {
  Factory, Plus, Search, Filter, Eye, Edit,
  CheckCircle2, XCircle, Clock, ChevronDown,
  Phone, Mail, MapPin, DollarSign, TrendingUp,
  ShoppingCart, Tag, RefreshCw, Download, X, Loader2, MessageCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type SupplierStatus = 'active' | 'inactive' | 'pending';

type SupplierCategory =
  | 'embalagens'
  | 'alimentos'
  | 'limpeza'
  | 'tecnologia'
  | 'combustivel'
  | 'manutencao'
  | 'escritorio';

interface Supplier {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  category: SupplierCategory;
  status: SupplierStatus;
  contact: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  paymentTerm: string;
}

const STATUS_CONFIG: Record<SupplierStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  active:  { label: 'Ativo',          color: 'text-green-400',        bg: 'bg-green-500/10 border-green-500/20',   icon: CheckCircle2 },
  inactive:{ label: 'Inativo',        color: 'text-muted-foreground', bg: 'bg-muted/50 border-border',             icon: XCircle },
  pending: { label: 'Em Homologação', color: 'text-yellow-400',       bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
};

const CATEGORY_CONFIG: Record<SupplierCategory, { label: string; color: string; bg: string }> = {
  embalagens:  { label: 'Embalagens',  color: 'text-blue-400',   bg: 'bg-blue-500/10' },
  alimentos:   { label: 'Alimentos',   color: 'text-green-400',  bg: 'bg-green-500/10' },
  limpeza:     { label: 'Limpeza',     color: 'text-cyan-400',   bg: 'bg-cyan-500/10' },
  tecnologia:  { label: 'Tecnologia',  color: 'text-purple-400', bg: 'bg-purple-500/10' },
  combustivel: { label: 'Combustível', color: 'text-orange-400', bg: 'bg-orange-500/10' },
  manutencao:  { label: 'Manutenção',  color: 'text-red-400',    bg: 'bg-red-500/10' },
  escritorio:  { label: 'Escritório',  color: 'text-gold-400',   bg: 'bg-gold-500/10' },
};

const MOCK_SUPPLIERS: Supplier[] = [
  { id: '1',  name: 'PackBrasil Embalagens Ltda',  cnpj: '11.222.333/0001-44', phone: '(11) 3001-2345', email: 'vendas@packbrasil.com.br',    city: 'São Paulo',       state: 'SP', category: 'embalagens',  status: 'active',   contact: 'Roberto Lima',    totalOrders: 48,  totalSpent: 32400.00, lastOrder: '10/05/2026', paymentTerm: '30 dias' },
  { id: '2',  name: 'Distribuidora FoodMax',       cnpj: '22.333.444/0001-55', phone: '(11) 3002-3456', email: 'pedidos@foodmax.com.br',       city: 'Guarulhos',       state: 'SP', category: 'alimentos',   status: 'active',   contact: 'Carla Souza',     totalOrders: 120, totalSpent: 89500.00, lastOrder: '14/05/2026', paymentTerm: '15 dias' },
  { id: '3',  name: 'CleanPro Produtos',           cnpj: '33.444.555/0001-66', phone: '(11) 3003-4567', email: 'contato@cleanpro.com.br',      city: 'São Bernardo',    state: 'SP', category: 'limpeza',     status: 'active',   contact: 'Marcos Freitas',  totalOrders: 24,  totalSpent: 8700.00,  lastOrder: '08/05/2026', paymentTerm: '30 dias' },
  { id: '4',  name: 'TechSupply Sistemas',         cnpj: '44.555.666/0001-77', phone: '(11) 3004-5678', email: 'suporte@techsupply.com.br',    city: 'São Paulo',       state: 'SP', category: 'tecnologia',  status: 'active',   contact: 'Ana Paula Tech',  totalOrders: 12,  totalSpent: 45200.00, lastOrder: '01/05/2026', paymentTerm: '45 dias' },
  { id: '5',  name: 'Posto Veloz Combustíveis',    cnpj: '55.666.777/0001-88', phone: '(11) 3005-6789', email: 'frota@postoveloz.com.br',      city: 'São Paulo',       state: 'SP', category: 'combustivel', status: 'active',   contact: 'José Veloz',      totalOrders: 89,  totalSpent: 67300.00, lastOrder: '13/05/2026', paymentTerm: '7 dias' },
  { id: '6',  name: 'MotoBike Peças & Serviços',   cnpj: '66.777.888/0001-99', phone: '(11) 3006-7890', email: 'oficina@motobike.com.br',      city: 'Diadema',         state: 'SP', category: 'manutencao',  status: 'active',   contact: 'Paulo Mecânico',  totalOrders: 31,  totalSpent: 18900.00, lastOrder: '05/05/2026', paymentTerm: '30 dias' },
  { id: '7',  name: 'OfficeMax Escritório',        cnpj: '77.888.999/0001-00', phone: '(11) 3007-8901', email: 'vendas@officemax.com.br',      city: 'São Paulo',       state: 'SP', category: 'escritorio',  status: 'inactive', contact: 'Fernanda Admin',  totalOrders: 8,   totalSpent: 3200.00,  lastOrder: '15/02/2026', paymentTerm: '30 dias' },
  { id: '8',  name: 'AgroFresh Alimentos',         cnpj: '88.999.000/0001-11', phone: '(19) 3008-9012', email: 'vendas@agrofresh.com.br',      city: 'Campinas',        state: 'SP', category: 'alimentos',   status: 'active',   contact: 'Ricardo Campo',   totalOrders: 56,  totalSpent: 41000.00, lastOrder: '12/05/2026', paymentTerm: '21 dias' },
  { id: '9',  name: 'EcoBox Embalagens Verdes',    cnpj: '99.000.111/0001-22', phone: '(11) 3009-0123', email: 'eco@ecobox.com.br',            city: 'Santo André',     state: 'SP', category: 'embalagens',  status: 'pending',  contact: 'Lúcia Verde',     totalOrders: 0,   totalSpent: 0.00,     lastOrder: '—',         paymentTerm: 'A definir' },
  { id: '10', name: 'DataTech Soluções',           cnpj: '00.111.222/0001-33', phone: '(11) 3010-1234', email: 'comercial@datatech.com.br',    city: 'São Paulo',       state: 'SP', category: 'tecnologia',  status: 'pending',  contact: 'Diego Dev',       totalOrders: 0,   totalSpent: 0.00,     lastOrder: '—',         paymentTerm: 'A definir' },
  { id: '11', name: 'LimpaFácil Produtos',         cnpj: '11.333.555/0001-77', phone: '(21) 3011-2345', email: 'vendas@limpafacil.com.br',     city: 'Rio de Janeiro',  state: 'RJ', category: 'limpeza',     status: 'inactive', contact: 'Sandra Clean',    totalOrders: 15,  totalSpent: 5400.00,  lastOrder: '10/01/2026', paymentTerm: '30 dias' },
  { id: '12', name: 'AutoCar Manutenção',          cnpj: '22.444.666/0001-88', phone: '(11) 3012-3456', email: 'frotas@autocar.com.br',        city: 'Mauá',            state: 'SP', category: 'manutencao',  status: 'active',   contact: 'Carlos Auto',     totalOrders: 19,  totalSpent: 12700.00, lastOrder: '09/05/2026', paymentTerm: '30 dias' },
];

const FILTER_TABS: { key: 'all' | SupplierStatus; label: string }[] = [
  { key: 'all',      label: 'Todos' },
  { key: 'active',   label: 'Ativos' },
  { key: 'pending',  label: 'Em Homologação' },
  { key: 'inactive', label: 'Inativos' },
];

const CATEGORIES = Object.keys(CATEGORY_CONFIG) as SupplierCategory[];

function StatusBadge({ status }: { status: SupplierStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

function CategoryBadge({ category }: { category: SupplierCategory }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap', cfg.bg, cfg.color)}>
      <Tag className="h-2.5 w-2.5 shrink-0" />
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

export function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState(MOCK_SUPPLIERS);
  const [activeFilter, setActiveFilter] = useState<'all' | SupplierStatus>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<SupplierCategory | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formContact, setFormContact] = useState('');
  const [formCategory, setFormCategory] = useState<SupplierCategory>('embalagens');

  const filtered = useMemo(() => suppliers.filter((s) => {
    const matchStatus = activeFilter === 'all' || s.status === activeFilter;
    const matchCat = categoryFilter === 'all' || s.category === categoryFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || s.name.toLowerCase().includes(q) || s.cnpj.includes(q) ||
      s.email.toLowerCase().includes(q) || s.city.toLowerCase().includes(q) ||
      s.contact.toLowerCase().includes(q);
    return matchStatus && matchCat && matchSearch;
  }), [suppliers, activeFilter, categoryFilter, search]);

  const counts = useMemo(() => ({
    all:      suppliers.length,
    active:   suppliers.filter((s) => s.status === 'active').length,
    pending:  suppliers.filter((s) => s.status === 'pending').length,
    inactive: suppliers.filter((s) => s.status === 'inactive').length,
  }), [suppliers]);

  const totalSpent = useMemo(
    () => suppliers.filter((s) => s.status === 'active').reduce((sum, s) => sum + s.totalSpent, 0), [suppliers],
  );
  const totalOrders = useMemo(() => suppliers.reduce((sum, s) => sum + s.totalOrders, 0), [suppliers]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setRefreshing(false);
  }, []);

  const resetForm = () => { setFormName(''); setFormCnpj(''); setFormPhone(''); setFormEmail(''); setFormContact(''); setFormCategory('embalagens'); };

  const [toast, setToast] = useState<string | null>(null);
  const [detailSupplier, setDetailSupplier] = useState<Supplier | null>(null);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editStatus, setEditStatus] = useState<SupplierStatus>('active');
  const [editSaving, setEditSaving] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['Nome', 'CNPJ', 'Telefone', 'Email', 'Contato', 'Cidade', 'Estado', 'Categoria', 'Status', 'Pedidos', 'Gasto Total'],
      ...suppliers.map((s) => [
        s.name, s.cnpj, s.phone, s.email, s.contact, s.city, s.state,
        CATEGORY_CONFIG[s.category].label, STATUS_CONFIG[s.status].label,
        String(s.totalOrders), s.totalSpent.toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fornecedores_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Fornecedores exportados com sucesso!');
  }, [suppliers, showToast]);

  const handleOpenEdit = useCallback((s: Supplier) => {
    setEditSupplier(s);
    setEditName(s.name);
    setEditPhone(s.phone);
    setEditEmail(s.email);
    setEditStatus(s.status);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editSupplier) return;
    setEditSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSuppliers((prev) => prev.map((s) => s.id === editSupplier.id ? { ...s, name: editName, phone: editPhone, email: editEmail, status: editStatus } : s));
    setEditSaving(false);
    setEditSupplier(null);
    showToast('Fornecedor atualizado com sucesso!');
  }, [editSupplier, editName, editPhone, editEmail, editStatus, showToast]);

  const handleWhatsApp = useCallback((phone: string, name: string) => {
    const clean = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá ${name}! Aqui é da AbraSystem.`);
    window.open(`https://wa.me/55${clean}?text=${msg}`, '_blank');
  }, []);

  const handleCall = useCallback((phone: string) => {
    const clean = phone.replace(/\D/g, '');
    window.open(`tel:+55${clean}`, '_self');
  }, []);

  const handleEmailOpen = useCallback((email: string) => {
    window.open(`mailto:${email}`, '_self');
  }, []);

  const handleCreate = async () => {
    if (!formName || !formCnpj) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    const newS: Supplier = {
      id: String(suppliers.length + 1), name: formName, cnpj: formCnpj, phone: formPhone, email: formEmail,
      city: 'São Paulo', state: 'SP', category: formCategory, status: 'pending', contact: formContact || '—',
      totalOrders: 0, totalSpent: 0, lastOrder: '—', paymentTerm: 'A definir',
    };
    setSuppliers((prev) => [newS, ...prev]);
    setSaving(false);
    setModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fornecedores</h1>
          <p className="text-muted-foreground">Gerencie seus parceiros e fornecedores</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Atualizado às {lastUpdate}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
          <button onClick={handleRefresh} disabled={refreshing}
            className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors', refreshing && 'opacity-60 cursor-not-allowed')}>
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-md shadow-gold-500/20">
            <Plus className="h-4 w-4" /> Novo Fornecedor
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><Factory className="h-5 w-5 text-gold-400" /></div>
            <div><p className="text-2xl font-bold">{counts.all}</p><p className="text-xs text-muted-foreground">Total Cadastrados</p></div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-2xl font-bold">{counts.active}</p><p className="text-xs text-muted-foreground">Ativos</p></div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><ShoppingCart className="h-5 w-5 text-gold-400" /></div>
            <div><p className="text-2xl font-bold">{totalOrders}</p><p className="text-xs text-muted-foreground">Pedidos Realizados</p></div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><DollarSign className="h-5 w-5 text-gold-500" /></div>
            <div><p className="text-xl font-bold">{totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p><p className="text-xs text-muted-foreground">Gasto Total (ativos)</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Factory className="h-4 w-4 text-gold-500" />
              Lista de Fornecedores
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              {/* Filtro categoria */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as SupplierCategory | 'all')}
                  className="pl-3 pr-8 py-1.5 text-xs rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none text-muted-foreground"
                >
                  <option value="all">Todas as categorias</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{CATEGORY_CONFIG[c].label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar fornecedor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-48"
                />
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
                <col style={{ width: '26%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Fornecedor</th>
                  <th className="px-4 py-2.5 text-left">Contato</th>
                  <th className="px-4 py-2.5 text-left">Localização</th>
                  <th className="px-4 py-2.5 text-left">Categoria</th>
                  <th className="px-4 py-2.5 text-center">Pedidos</th>
                  <th className="px-4 py-2.5 text-right">Gasto Total</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      <Factory className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhum fornecedor encontrado</p>
                    </td>
                  </tr>
                ) : filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gold-500/5 transition-colors group">
                    {/* Fornecedor */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{s.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{s.cnpj}</p>
                        </div>
                      </div>
                    </td>

                    {/* Contato */}
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium truncate">{s.contact}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="h-2.5 w-2.5 shrink-0" />{s.phone}
                      </p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
                        <Mail className="h-2.5 w-2.5 shrink-0" />{s.email}
                      </p>
                    </td>

                    {/* Localização */}
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                        {s.city}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 pl-4">{s.state} · Prazo: {s.paymentTerm}</p>
                    </td>

                    {/* Categoria */}
                    <td className="px-4 py-3">
                      <CategoryBadge category={s.category} />
                    </td>

                    {/* Pedidos */}
                    <td className="px-4 py-3 text-center">
                      <p className="text-sm font-semibold">{s.totalOrders || '—'}</p>
                      {s.totalOrders > 0 && (
                        <p className="text-[10px] text-muted-foreground">{s.lastOrder}</p>
                      )}
                    </td>

                    {/* Gasto total */}
                    <td className="px-4 py-3 text-right">
                      <p className={cn('text-sm font-semibold', s.totalSpent === 0 ? 'text-muted-foreground' : '')}>
                        {s.totalSpent === 0 ? '—' : s.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
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
                          <button onClick={() => setDetailSupplier(s)} className="p-1 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors" title="Ver detalhes">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground bg-muted/20">
            <span>{filtered.length} fornecedor{filtered.length !== 1 ? 'es' : ''} exibido{filtered.length !== 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              {counts.active} ativos · {counts.pending} em homologação
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Modal Novo Fornecedor */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setModalOpen(false); resetForm(); }} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl shadow-black/40 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold-500/10"><Factory className="h-5 w-5 text-gold-500" /></div>
                <div><h2 className="text-lg font-bold">Novo Fornecedor</h2><p className="text-xs text-muted-foreground">Cadastre um novo parceiro</p></div>
              </div>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Razão Social *</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: PackBrasil Embalagens Ltda"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">CNPJ *</label>
                  <input type="text" value={formCnpj} onChange={(e) => setFormCnpj(e.target.value)} placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Categoria</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as SupplierCategory)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none">
                    {CATEGORIES.map((c) => (<option key={c} value={c}>{CATEGORY_CONFIG[c].label}</option>))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Telefone</label>
                  <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="(11) 3001-2345"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Contato</label>
                  <input type="text" value={formContact} onChange={(e) => setFormContact(e.target.value)} placeholder="Nome do contato"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">E-mail</label>
                <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="vendas@empresa.com.br"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              <button disabled={!formName || !formCnpj || saving} onClick={handleCreate}
                className={cn('inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                  formName && formCnpj && !saving ? 'bg-gold-500 hover:bg-gold-600 text-black shadow-md shadow-gold-500/20' : 'bg-muted text-muted-foreground cursor-not-allowed')}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {saving ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {detailSupplier && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailSupplier(null)} />
          <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl shadow-black/40 animate-fade-in flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={detailSupplier.name} />
                <div><h2 className="text-lg font-bold">{detailSupplier.name}</h2><p className="text-xs text-muted-foreground font-mono">{detailSupplier.cnpj}</p></div>
              </div>
              <button onClick={() => setDetailSupplier(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={detailSupplier.status} />
                <CategoryBadge category={detailSupplier.category} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Pedidos</p>
                  <p className="text-lg font-bold">{detailSupplier.totalOrders || '—'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Gasto Total</p>
                  <p className="text-lg font-bold text-gold-400">{detailSupplier.totalSpent ? detailSupplier.totalSpent.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Contato</p>
                <p className="text-sm font-medium mb-1">{detailSupplier.contact}</p>
                <p className="text-sm flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{detailSupplier.phone}</p>
                <p className="text-sm flex items-center gap-1.5 mt-1"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{detailSupplier.email}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Localização</p>
                <p className="text-sm flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gold-500" />{detailSupplier.city}, {detailSupplier.state}</p>
                <p className="text-xs text-muted-foreground mt-1">Prazo: {detailSupplier.paymentTerm} · Último pedido: {detailSupplier.lastOrder}</p>
              </div>
            </div>
            <div className="shrink-0 border-t border-border p-4 space-y-2">
              <div className="flex gap-2">
                <button onClick={() => handleCall(detailSupplier.phone)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground transition-colors hover:text-foreground"><Phone className="h-3.5 w-3.5" /> Ligar</button>
                <button onClick={() => handleWhatsApp(detailSupplier.phone, detailSupplier.name)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-sm text-green-400 transition-colors"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</button>
                <button onClick={() => handleEmailOpen(detailSupplier.email)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground transition-colors hover:text-foreground"><Mail className="h-3.5 w-3.5" /> Email</button>
              </div>
              <button onClick={() => { handleOpenEdit(detailSupplier); setDetailSupplier(null); }} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-black font-semibold text-sm transition-colors"><Edit className="h-3.5 w-3.5" /> Editar</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Drawer */}
      {editSupplier && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditSupplier(null)} />
          <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl shadow-black/40 animate-fade-in flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold-500/10"><Edit className="h-5 w-5 text-gold-500" /></div>
                <div><h2 className="text-lg font-bold">Editar Fornecedor</h2><p className="text-xs text-muted-foreground font-mono">{editSupplier.cnpj}</p></div>
              </div>
              <button onClick={() => setEditSupplier(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nome *</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Telefone</label>
                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">E-mail</label>
                <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Status</label>
                <div className="flex gap-2">
                  {(['active', 'pending', 'inactive'] as SupplierStatus[]).map((st) => (
                    <button key={st} onClick={() => setEditStatus(st)} className={cn('flex-1 py-2 rounded-lg border text-xs font-medium transition-all', editStatus === st ? `${STATUS_CONFIG[st].bg} ${STATUS_CONFIG[st].color}` : 'border-border text-muted-foreground hover:bg-muted')}>
                      {STATUS_CONFIG[st].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="shrink-0 border-t border-border p-4 flex items-center justify-end gap-2">
              <button onClick={() => setEditSupplier(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              <button disabled={!editName || editSaving} onClick={handleSaveEdit} className={cn('inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all', editName && !editSaving ? 'bg-gold-500 hover:bg-gold-600 text-black shadow-md shadow-gold-500/20' : 'bg-muted text-muted-foreground cursor-not-allowed')}>
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
