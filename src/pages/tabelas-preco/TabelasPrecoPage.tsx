import { useState, useMemo, useCallback } from 'react';
import {
  Calculator, Plus, Search, Eye, Edit,
  CheckCircle2, XCircle, ChevronDown, ChevronRight,
  Users, MapPin, Zap, Package, TrendingUp, Tag,
  DollarSign, Layers, X, Loader2, RefreshCw, Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TableStatus = 'active' | 'inactive';
type PricingType = 'por_km' | 'fixo_zona' | 'fixo_bairro' | 'dinamico';

interface PricingTier {
  label: string;
  price: number;
  detail?: string;
}

interface PriceTable {
  id: string;
  name: string;
  description: string;
  type: PricingType;
  status: TableStatus;
  clientsCount: number;
  basePrice: number;
  tiers: PricingTier[];
  lastUpdated: string;
  createdAt: string;
  tags: string[];
}

const TYPE_CONFIG: Record<PricingType, { label: string; color: string; bg: string; icon: typeof MapPin }> = {
  por_km:      { label: 'Por Km',       color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',   icon: MapPin },
  fixo_zona:   { label: 'Fixo por Zona',color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: Layers },
  fixo_bairro: { label: 'Fixo por Bairro', color: 'text-gold-400', bg: 'bg-gold-500/10 border-gold-500/20',  icon: Tag },
  dinamico:    { label: 'Dinâmico',     color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', icon: Zap },
};

const MOCK_TABLES: PriceTable[] = [
  {
    id: '1',
    name: 'Tabela Padrão',
    description: 'Tabela base para clientes pessoa física e pequenos negócios.',
    type: 'por_km',
    status: 'active',
    clientsCount: 87,
    basePrice: 5.00,
    tiers: [
      { label: 'Até 5 km',     price: 5.00,  detail: 'taxa base' },
      { label: '5 a 10 km',   price: 0.90,  detail: 'por km adicional' },
      { label: '10 a 20 km',  price: 0.75,  detail: 'por km adicional' },
      { label: 'Acima de 20', price: 0.60,  detail: 'por km adicional' },
    ],
    lastUpdated: '01/04/2026',
    createdAt: '10/01/2024',
    tags: ['padrão', 'pessoa física'],
  },
  {
    id: '2',
    name: 'Tabela Empresarial',
    description: 'Preços diferenciados para empresas com volume mínimo de 50 entregas/mês.',
    type: 'por_km',
    status: 'active',
    clientsCount: 34,
    basePrice: 4.00,
    tiers: [
      { label: 'Até 5 km',     price: 4.00,  detail: 'taxa base' },
      { label: '5 a 10 km',   price: 0.70,  detail: 'por km adicional' },
      { label: '10 a 20 km',  price: 0.55,  detail: 'por km adicional' },
      { label: 'Acima de 20', price: 0.45,  detail: 'por km adicional' },
    ],
    lastUpdated: '15/03/2026',
    createdAt: '10/01/2024',
    tags: ['empresarial', 'volume'],
  },
  {
    id: '3',
    name: 'Tabela Express',
    description: 'Entrega prioritária com prazo máximo de 2h. Acréscimo sobre tabela padrão.',
    type: 'dinamico',
    status: 'active',
    clientsCount: 22,
    basePrice: 12.00,
    tiers: [
      { label: 'Taxa fixa',      price: 12.00, detail: 'urgência' },
      { label: 'Por km',        price: 1.20,  detail: 'por km rodado' },
      { label: 'Horário noturno', price: 3.00, detail: 'adicional (22h–6h)' },
      { label: 'Feriados',      price: 5.00,  detail: 'adicional' },
    ],
    lastUpdated: '20/04/2026',
    createdAt: '05/06/2024',
    tags: ['express', 'urgência', '2h'],
  },
  {
    id: '4',
    name: 'Zona Norte SP',
    description: 'Cobertura fixa para bairros da Zona Norte: Santana, Tucuruvi, Jaçanã e adjacentes.',
    type: 'fixo_zona',
    status: 'active',
    clientsCount: 41,
    basePrice: 8.50,
    tiers: [
      { label: 'Zona 1 (0–5 km)',   price: 8.50  },
      { label: 'Zona 2 (5–10 km)',  price: 11.00 },
      { label: 'Zona 3 (10–15 km)', price: 14.50 },
      { label: 'Zona 4 (15+ km)',   price: 18.00 },
    ],
    lastUpdated: '10/02/2026',
    createdAt: '01/03/2025',
    tags: ['zona norte', 'fixo'],
  },
  {
    id: '5',
    name: 'Zona Sul SP',
    description: 'Cobertura fixa para Moema, Itaim Bibi, Brooklin e adjacentes.',
    type: 'fixo_zona',
    status: 'active',
    clientsCount: 29,
    basePrice: 9.00,
    tiers: [
      { label: 'Zona 1 (0–5 km)',   price: 9.00  },
      { label: 'Zona 2 (5–10 km)', price: 12.00 },
      { label: 'Zona 3 (10–15 km)', price: 15.50 },
      { label: 'Zona 4 (15+ km)',   price: 19.00 },
    ],
    lastUpdated: '10/02/2026',
    createdAt: '01/03/2025',
    tags: ['zona sul', 'fixo'],
  },
  {
    id: '6',
    name: 'Grande ABC',
    description: 'Atendimento para Santo André, São Bernardo, São Caetano e Diadema.',
    type: 'fixo_bairro',
    status: 'active',
    clientsCount: 18,
    basePrice: 15.00,
    tiers: [
      { label: 'Santo André',      price: 15.00 },
      { label: 'São Bernardo',     price: 16.00 },
      { label: 'São Caetano',      price: 15.50 },
      { label: 'Diadema',          price: 17.00 },
    ],
    lastUpdated: '05/01/2026',
    createdAt: '15/07/2024',
    tags: ['ABC', 'interior SP'],
  },
  {
    id: '7',
    name: 'Tabela Farmácias',
    description: 'Tabela exclusiva para rede de farmácias parceiras. Contrato anual.',
    type: 'por_km',
    status: 'active',
    clientsCount: 12,
    basePrice: 3.50,
    tiers: [
      { label: 'Até 3 km',    price: 3.50, detail: 'taxa base' },
      { label: '3 a 8 km',   price: 0.60, detail: 'por km adicional' },
      { label: '8 a 15 km',  price: 0.50, detail: 'por km adicional' },
      { label: 'Acima de 15', price: 0.40, detail: 'por km adicional' },
    ],
    lastUpdated: '01/01/2026',
    createdAt: '01/01/2025',
    tags: ['farmácias', 'contrato', 'exclusivo'],
  },
  {
    id: '8',
    name: 'Tabela Antiga 2023',
    description: 'Tabela desativada. Mantida para referência histórica.',
    type: 'por_km',
    status: 'inactive',
    clientsCount: 0,
    basePrice: 4.50,
    tiers: [
      { label: 'Até 5 km',   price: 4.50 },
      { label: 'Por km extra', price: 0.80 },
    ],
    lastUpdated: '31/12/2023',
    createdAt: '01/01/2023',
    tags: ['histórico'],
  },
];

const FILTER_TABS: { key: 'all' | TableStatus; label: string }[] = [
  { key: 'all',      label: 'Todas' },
  { key: 'active',   label: 'Ativas' },
  { key: 'inactive', label: 'Inativas' },
];

function StatusBadge({ status }: { status: TableStatus }) {
  const cfg = status === 'active'
    ? { label: 'Ativa',   color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', Icon: CheckCircle2 }
    : { label: 'Inativa', color: 'text-muted-foreground', bg: 'bg-muted/50 border-border',   Icon: XCircle };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <cfg.Icon className="h-3 w-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: PricingType }) {
  const cfg = TYPE_CONFIG[type];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-2.5 w-2.5 shrink-0" />
      {cfg.label}
    </span>
  );
}

function ExpandedTiers({ tiers, basePrice }: { tiers: PricingTier[]; basePrice: number }) {
  return (
    <tr className="bg-muted/30">
      <td colSpan={7} className="px-4 py-0">
        <div className="py-3 pl-12">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Faixas de Preço</p>
          <div className="flex flex-wrap gap-2">
            {tiers.map((tier, i) => (
              <div key={i} className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">{tier.label}</p>
                  {tier.detail && <p className="text-[10px] text-muted-foreground/60">{tier.detail}</p>}
                </div>
                <div className="h-6 w-px bg-border" />
                <p className="text-sm font-bold text-gold-400">
                  {tier.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
}

export function TabelasPrecoPage() {
  const [activeFilter, setActiveFilter] = useState<'all' | TableStatus>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => MOCK_TABLES.filter((t) => {
    const matchStatus = activeFilter === 'all' || t.status === activeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  }), [activeFilter, search]);

  const counts = useMemo(() => ({
    all:      MOCK_TABLES.length,
    active:   MOCK_TABLES.filter((t) => t.status === 'active').length,
    inactive: MOCK_TABLES.filter((t) => t.status === 'inactive').length,
  }), []);

  const totalClients = useMemo(
    () => MOCK_TABLES.filter((t) => t.status === 'active').reduce((s, t) => s + t.clientsCount, 0), [],
  );

  const types = useMemo(() => {
    const map: Record<string, number> = {};
    MOCK_TABLES.filter((t) => t.status === 'active').forEach((t) => {
      map[t.type] = (map[t.type] ?? 0) + 1;
    });
    return map;
  }, []);

  const toggleExpand = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const [tables, setTables] = useState(MOCK_TABLES);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formType, setFormType] = useState<PricingType>('por_km');
  const [formBasePrice, setFormBasePrice] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [detailTable, setDetailTable] = useState<PriceTable | null>(null);
  const [editTable, setEditTable] = useState<PriceTable | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<TableStatus>('active');
  const [editSaving, setEditSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setRefreshing(false);
  }, []);

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['Nome', 'Tipo', 'Status', 'Preço Base', 'Clientes', 'Atualizado'],
      ...MOCK_TABLES.map((t) => [
        t.name, TYPE_CONFIG[t.type].label, t.status === 'active' ? 'Ativa' : 'Inativa',
        t.basePrice.toFixed(2), String(t.clientsCount), t.lastUpdated,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tabelas_preco_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Tabelas exportadas com sucesso!');
  }, [showToast]);

  const handleCreate = useCallback(async () => {
    if (!formName || !formBasePrice) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    const newTable: PriceTable = {
      id: String(Date.now()),
      name: formName,
      description: formDescription || 'Nova tabela de preços',
      type: formType,
      status: 'active',
      clientsCount: 0,
      basePrice: parseFloat(formBasePrice) || 0,
      tiers: [{ label: 'Taxa base', price: parseFloat(formBasePrice) || 0, detail: 'valor inicial' }],
      lastUpdated: new Date().toLocaleDateString('pt-BR'),
      createdAt: new Date().toLocaleDateString('pt-BR'),
      tags: ['nova'],
    };
    setTables((prev) => [newTable, ...prev]);
    setSaving(false);
    setModalOpen(false);
    setFormName(''); setFormDescription(''); setFormType('por_km'); setFormBasePrice('');
    showToast('Tabela criada com sucesso!');
  }, [formName, formDescription, formType, formBasePrice, showToast]);

  const handleOpenEdit = useCallback((t: PriceTable) => {
    setEditTable(t);
    setEditName(t.name);
    setEditDescription(t.description);
    setEditStatus(t.status);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editTable) return;
    setEditSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setTables((prev) => prev.map((t) => t.id === editTable.id ? { ...t, name: editName, description: editDescription, status: editStatus, lastUpdated: new Date().toLocaleDateString('pt-BR') } : t));
    setEditSaving(false);
    setEditTable(null);
    showToast('Tabela atualizada com sucesso!');
  }, [editTable, editName, editDescription, editStatus, showToast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tabelas de Preço</h1>
          <p className="text-muted-foreground">Configure as faixas de cobrança por tipo de entrega</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Atualizado às {lastUpdate}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-3.5 w-3.5" /> Exportar
          </button>
          <button onClick={handleRefresh} disabled={refreshing} className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors', refreshing && 'opacity-60 cursor-not-allowed')}>
            <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
          <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-md shadow-gold-500/20">
            <Plus className="h-4 w-4" />
            Nova Tabela
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><Calculator className="h-5 w-5 text-gold-400" /></div>
            <div><p className="text-2xl font-bold">{counts.all}</p><p className="text-xs text-muted-foreground">Total de Tabelas</p></div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-2xl font-bold">{counts.active}</p><p className="text-xs text-muted-foreground">Tabelas Ativas</p></div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><Users className="h-5 w-5 text-gold-400" /></div>
            <div><p className="text-2xl font-bold">{totalClients}</p><p className="text-xs text-muted-foreground">Clientes Vinculados</p></div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><DollarSign className="h-5 w-5 text-gold-500" /></div>
            <div>
              <p className="text-2xl font-bold">{Object.keys(types).length}</p>
              <p className="text-xs text-muted-foreground">Tipos de Cobrança</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calculator className="h-4 w-4 text-gold-500" />
              Tabelas Cadastradas
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar tabela ou tag..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-52"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2">
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
                <col style={{ width: '4%' }} />
                <col style={{ width: '28%' }} />
                <col style={{ width: '15%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '17%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5" />
                  <th className="px-4 py-2.5 text-left">Tabela</th>
                  <th className="px-4 py-2.5 text-left">Tipo</th>
                  <th className="px-4 py-2.5 text-right">Preço Base</th>
                  <th className="px-4 py-2.5 text-center">Clientes</th>
                  <th className="px-4 py-2.5 text-left">Atualizado</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      <Calculator className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhuma tabela encontrada</p>
                    </td>
                  </tr>
                ) : filtered.map((t) => {
                  const isExpanded = expandedId === t.id;
                  return (
                    <>
                      <tr
                        key={t.id}
                        className={cn(
                          'hover:bg-gold-500/5 transition-colors group border-t border-border',
                          isExpanded && 'bg-gold-500/5'
                        )}
                      >
                        {/* Expandir */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleExpand(t.id)}
                            className="p-1 rounded-md hover:bg-gold-500/10 text-muted-foreground hover:text-gold-400 transition-colors"
                          >
                            {isExpanded
                              ? <ChevronDown className="h-3.5 w-3.5" />
                              : <ChevronRight className="h-3.5 w-3.5" />}
                          </button>
                        </td>

                        {/* Nome */}
                        <td className="px-4 py-3">
                          <p className="font-medium">{t.name}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{t.description}</p>
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {t.tags.map((tag) => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Tipo */}
                        <td className="px-4 py-3">
                          <TypeBadge type={t.type} />
                        </td>

                        {/* Preço base */}
                        <td className="px-4 py-3 text-right">
                          <p className="text-sm font-bold text-gold-400">
                            {t.basePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {t.tiers.length} faixa{t.tiers.length !== 1 ? 's' : ''}
                          </p>
                        </td>

                        {/* Clientes */}
                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-semibold">{t.clientsCount || '—'}</span>
                          </div>
                        </td>

                        {/* Atualizado */}
                        <td className="px-4 py-3">
                          <p className="text-xs text-muted-foreground">{t.lastUpdated}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Criado: {t.createdAt}</p>
                        </td>

                        {/* Status + ações */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <StatusBadge status={t.status} />
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => handleOpenEdit(t)} className="p-1 rounded-md hover:bg-gold-500/10 text-muted-foreground hover:text-gold-400 transition-colors" title="Editar">
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => setDetailTable(t)} className="p-1 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors" title="Ver detalhes">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {/* Linha expandida com faixas */}
                      {isExpanded && (
                        <ExpandedTiers key={`${t.id}-expanded`} tiers={t.tiers} basePrice={t.basePrice} />
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground bg-muted/20">
            <span>{filtered.length} tabela{filtered.length !== 1 ? 's' : ''} exibida{filtered.length !== 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              {totalClients} clientes vinculados a tabelas ativas
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl shadow-black/40 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold-500/10"><Calculator className="h-5 w-5 text-gold-500" /></div>
                <h2 className="text-lg font-bold">Nova Tabela de Preço</h2>
              </div>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nome *</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Tabela Premium" className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Descrição</label>
                <input type="text" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Breve descrição da tabela" className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Tipo</label>
                  <div className="relative">
                    <select value={formType} onChange={(e) => setFormType(e.target.value as PricingType)} className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none">
                      {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (<option key={key} value={key}>{cfg.label}</option>))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Preço Base (R$) *</label>
                  <input type="number" step="0.01" value={formBasePrice} onChange={(e) => setFormBasePrice(e.target.value)} placeholder="5.00" className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
              <button disabled={!formName || !formBasePrice || saving} onClick={handleCreate} className={cn('inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all', formName && formBasePrice && !saving ? 'bg-gold-500 hover:bg-gold-600 text-black shadow-md shadow-gold-500/20' : 'bg-muted text-muted-foreground cursor-not-allowed')}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {saving ? 'Salvando...' : 'Criar Tabela'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {detailTable && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailTable(null)} />
          <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl shadow-black/40 animate-fade-in flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold-500/10"><Calculator className="h-5 w-5 text-gold-500" /></div>
                <div><h2 className="text-lg font-bold">{detailTable.name}</h2><p className="text-xs text-muted-foreground">{detailTable.description}</p></div>
              </div>
              <button onClick={() => setDetailTable(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between">
                {detailTable.status === 'active'
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-green-500/10 border-green-500/20 text-green-400"><CheckCircle2 className="h-3 w-3" />Ativa</span>
                  : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border bg-muted/50 border-border text-muted-foreground"><XCircle className="h-3 w-3" />Inativa</span>}
                <TypeBadge type={detailTable.type} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Preço Base</p>
                  <p className="text-lg font-bold text-gold-400">{detailTable.basePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Clientes</p>
                  <p className="text-lg font-bold">{detailTable.clientsCount}</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">Faixas de Preço</p>
                <div className="space-y-2">
                  {detailTable.tiers.map((tier, i) => (
                    <div key={i} className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2">
                      <div><p className="text-xs">{tier.label}</p>{tier.detail && <p className="text-[10px] text-muted-foreground">{tier.detail}</p>}</div>
                      <p className="text-sm font-bold text-gold-400">{tier.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Tags</p>
                <div className="flex flex-wrap gap-1">{detailTable.tags.map((tag) => (<span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">#{tag}</span>))}</div>
              </div>
              <div className="text-xs text-muted-foreground">Atualizado: {detailTable.lastUpdated} · Criado: {detailTable.createdAt}</div>
            </div>
            <div className="shrink-0 border-t border-border p-4">
              <button onClick={() => { handleOpenEdit(detailTable); setDetailTable(null); }} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-black font-semibold text-sm transition-colors"><Edit className="h-3.5 w-3.5" /> Editar Tabela</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Drawer */}
      {editTable && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditTable(null)} />
          <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl shadow-black/40 animate-fade-in flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold-500/10"><Edit className="h-5 w-5 text-gold-500" /></div>
                <div><h2 className="text-lg font-bold">Editar Tabela</h2><p className="text-xs text-muted-foreground">{editTable.name}</p></div>
              </div>
              <button onClick={() => setEditTable(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nome *</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Descrição</label>
                <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Status</label>
                <div className="flex gap-2">
                  <button onClick={() => setEditStatus('active')} className={cn('flex-1 py-2 rounded-lg border text-xs font-medium transition-all', editStatus === 'active' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'border-border text-muted-foreground hover:bg-muted')}>Ativa</button>
                  <button onClick={() => setEditStatus('inactive')} className={cn('flex-1 py-2 rounded-lg border text-xs font-medium transition-all', editStatus === 'inactive' ? 'bg-muted/50 border-border text-muted-foreground' : 'border-border text-muted-foreground hover:bg-muted')}>Inativa</button>
                </div>
              </div>
            </div>
            <div className="shrink-0 border-t border-border p-4 flex items-center justify-end gap-2">
              <button onClick={() => setEditTable(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
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
