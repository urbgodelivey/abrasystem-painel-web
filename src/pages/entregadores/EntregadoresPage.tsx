import { useState, useMemo, useCallback } from 'react';
import {
  Bike, Plus, Search, Filter, Eye, Phone,
  ChevronDown, Star, CheckCircle2,
  XCircle, Truck, Coffee, Edit, MapPin,
  Package, TrendingUp, Clock, RefreshCw,
  Download, X, Loader2, MessageCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type DelivererStatus = 'available' | 'in_transit' | 'inactive' | 'on_break';
type VehicleType = 'moto' | 'bike' | 'carro' | 'van';

interface Deliverer {
  id: string;
  name: string;
  phone: string;
  vehicle: VehicleType;
  plate: string;
  status: DelivererStatus;
  deliveriesToday: number;
  deliveriesTotal: number;
  rating: number;
  city: string;
  since: string;
  currentRoute: string | null;
}

const STATUS_CONFIG: Record<DelivererStatus, { label: string; color: string; bg: string; icon: typeof Bike }> = {
  available:  { label: 'Disponível', color: 'text-green-400',        bg: 'bg-green-500/10 border-green-500/20',   icon: CheckCircle2 },
  in_transit: { label: 'Em Rota',    color: 'text-blue-400',         bg: 'bg-blue-500/10 border-blue-500/20',     icon: Truck },
  on_break:   { label: 'Em Pausa',   color: 'text-yellow-400',       bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Coffee },
  inactive:   { label: 'Inativo',    color: 'text-muted-foreground', bg: 'bg-muted/50 border-border',             icon: XCircle },
};

const VEHICLE_CONFIG: Record<VehicleType, { label: string; color: string }> = {
  moto:  { label: 'Moto',      color: 'text-orange-400' },
  bike:  { label: 'Bicicleta', color: 'text-green-400' },
  carro: { label: 'Carro',     color: 'text-blue-400' },
  van:   { label: 'Van',       color: 'text-purple-400' },
};

const MOCK_DELIVERERS: Deliverer[] = [
  { id: '1',  name: 'Carlos Eduardo Moto', phone: '(11) 9 9765-4321', vehicle: 'moto',  plate: 'ABC-1D23', status: 'in_transit', deliveriesToday: 8,  deliveriesTotal: 1240, rating: 4.9, city: 'São Paulo',   since: 'Jan/2023', currentRoute: 'Centro → Lapa' },
  { id: '2',  name: 'Roberto Bike Silva',  phone: '(11) 9 9812-3456', vehicle: 'bike',  plate: '—',        status: 'in_transit', deliveriesToday: 5,  deliveriesTotal: 873,  rating: 4.7, city: 'São Paulo',   since: 'Mar/2023', currentRoute: 'Jardins → Sto. André' },
  { id: '3',  name: 'Lucas de Souza',      phone: '(11) 9 9934-5678', vehicle: 'moto',  plate: 'DEF-2E34', status: 'available',  deliveriesToday: 11, deliveriesTotal: 2105, rating: 4.8, city: 'São Paulo',   since: 'Ago/2022', currentRoute: null },
  { id: '4',  name: 'Ana Paula Rider',     phone: '(11) 9 8877-6655', vehicle: 'moto',  plate: 'GHI-3F45', status: 'available',  deliveriesToday: 9,  deliveriesTotal: 1567, rating: 5.0, city: 'São Paulo',   since: 'Nov/2022', currentRoute: null },
  { id: '5',  name: 'Fernando Carvalho',   phone: '(11) 9 7766-5544', vehicle: 'carro', plate: 'JKL-4G56', status: 'on_break',   deliveriesToday: 6,  deliveriesTotal: 489,  rating: 4.5, city: 'Santo André', since: 'Jun/2024', currentRoute: null },
  { id: '6',  name: 'Patrícia Gomes',      phone: '(11) 9 6655-4433', vehicle: 'moto',  plate: 'MNO-5H67', status: 'available',  deliveriesToday: 13, deliveriesTotal: 3210, rating: 4.9, city: 'São Paulo',   since: 'Abr/2022', currentRoute: null },
  { id: '7',  name: 'Diego Santos',        phone: '(11) 9 5544-3322', vehicle: 'bike',  plate: '—',        status: 'inactive',   deliveriesToday: 0,  deliveriesTotal: 234,  rating: 4.2, city: 'São Paulo',   since: 'Fev/2024', currentRoute: null },
  { id: '8',  name: 'Marcos Entregador',   phone: '(11) 9 4433-2211', vehicle: 'van',   plate: 'PQR-6I78', status: 'available',  deliveriesToday: 4,  deliveriesTotal: 678,  rating: 4.6, city: 'São Paulo',   since: 'Set/2023', currentRoute: null },
  { id: '9',  name: 'Bruna Correia',       phone: '(11) 9 3322-1100', vehicle: 'moto',  plate: 'STU-7J89', status: 'in_transit', deliveriesToday: 7,  deliveriesTotal: 1089, rating: 4.8, city: 'São Paulo',   since: 'Jul/2023', currentRoute: 'Moema → Brooklin' },
  { id: '10', name: 'Thiago Veloz',        phone: '(11) 9 2211-0099', vehicle: 'moto',  plate: 'VWX-8K90', status: 'on_break',   deliveriesToday: 10, deliveriesTotal: 1934, rating: 4.7, city: 'São Paulo',   since: 'Out/2022', currentRoute: null },
];

const FILTER_TABS: { key: 'all' | DelivererStatus; label: string }[] = [
  { key: 'all',        label: 'Todos' },
  { key: 'available',  label: 'Disponível' },
  { key: 'in_transit', label: 'Em Rota' },
  { key: 'on_break',   label: 'Em Pausa' },
  { key: 'inactive',   label: 'Inativos' },
];

function StatusBadge({ status }: { status: DelivererStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="inline-flex items-center gap-1">
      <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500 shrink-0" />
      <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
    </div>
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

export function EntregadoresPage() {
  const [deliverers, setDeliverers] = useState(MOCK_DELIVERERS);
  const [activeFilter, setActiveFilter] = useState<'all' | DelivererStatus>('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formVehicle, setFormVehicle] = useState<VehicleType>('moto');
  const [formPlate, setFormPlate] = useState('');
  const [formCity, setFormCity] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [detailDeliverer, setDetailDeliverer] = useState<Deliverer | null>(null);
  const [editDeliverer, setEditDeliverer] = useState<Deliverer | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<DelivererStatus>('available');
  const [editSaving, setEditSaving] = useState(false);

  const filtered = useMemo(() => deliverers.filter((d) => {
    const matchStatus = activeFilter === 'all' || d.status === activeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || d.name.toLowerCase().includes(q) || d.phone.includes(q) ||
      d.plate.toLowerCase().includes(q) || d.city.toLowerCase().includes(q) ||
      VEHICLE_CONFIG[d.vehicle].label.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }), [deliverers, activeFilter, search]);

  const counts = useMemo(() => ({
    all:        deliverers.length,
    available:  deliverers.filter((d) => d.status === 'available').length,
    in_transit: deliverers.filter((d) => d.status === 'in_transit').length,
    on_break:   deliverers.filter((d) => d.status === 'on_break').length,
    inactive:   deliverers.filter((d) => d.status === 'inactive').length,
  }), [deliverers]);

  const todayDeliveries = useMemo(() => deliverers.reduce((s, d) => s + d.deliveriesToday, 0), [deliverers]);
  const avgRating = useMemo(() => {
    const active = deliverers.filter((d) => d.status !== 'inactive');
    return active.length > 0 ? active.reduce((s, d) => s + d.rating, 0) / active.length : 0;
  }, [deliverers]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setRefreshing(false);
  }, []);

  const resetForm = () => { setFormName(''); setFormPhone(''); setFormVehicle('moto'); setFormPlate(''); setFormCity(''); };

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['Nome', 'Telefone', 'Veículo', 'Placa', 'Status', 'Entregas Hoje', 'Total', 'Rating', 'Cidade'],
      ...deliverers.map((d) => [
        d.name, d.phone, VEHICLE_CONFIG[d.vehicle].label, d.plate,
        STATUS_CONFIG[d.status].label, String(d.deliveriesToday), String(d.deliveriesTotal),
        d.rating.toFixed(1), d.city,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entregadores_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Entregadores exportados com sucesso!');
  }, [deliverers, showToast]);

  const handleOpenEdit = useCallback((d: Deliverer) => {
    setEditDeliverer(d);
    setEditName(d.name);
    setEditPhone(d.phone);
    setEditStatus(d.status);
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editDeliverer) return;
    setEditSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setDeliverers((prev) => prev.map((d) => d.id === editDeliverer.id ? { ...d, name: editName, phone: editPhone, status: editStatus } : d));
    setEditSaving(false);
    setEditDeliverer(null);
    showToast('Entregador atualizado com sucesso!');
  }, [editDeliverer, editName, editPhone, editStatus, showToast]);

  const handleWhatsApp = useCallback((phone: string, name: string) => {
    const clean = phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá ${name}! Aqui é da AbraSystem.`);
    window.open(`https://wa.me/55${clean}?text=${msg}`, '_blank');
  }, []);

  const handleCall = useCallback((phone: string) => {
    const clean = phone.replace(/\D/g, '');
    window.open(`tel:+55${clean}`, '_self');
  }, []);

  const handleCreate = async () => {
    if (!formName || !formPhone) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    const now = new Date();
    const newD: Deliverer = {
      id: String(deliverers.length + 1),
      name: formName,
      phone: formPhone,
      vehicle: formVehicle,
      plate: formPlate || '—',
      status: 'available',
      deliveriesToday: 0,
      deliveriesTotal: 0,
      rating: 5.0,
      city: formCity || 'São Paulo',
      since: `${now.toLocaleString('pt-BR', { month: 'short' })}/${now.getFullYear()}`,
      currentRoute: null,
    };
    setDeliverers((prev) => [newD, ...prev]);
    setSaving(false);
    setModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Entregadores</h1>
          <p className="text-muted-foreground">Gerencie e monitore sua equipe de entregadores</p>
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
            Novo Entregador
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><Bike className="h-5 w-5 text-gold-400" /></div>
            <div><p className="text-2xl font-bold">{counts.all}</p><p className="text-xs text-muted-foreground">Total Cadastrados</p></div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-2xl font-bold">{counts.available + counts.in_transit}</p><p className="text-xs text-muted-foreground">Ativos Hoje</p></div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Package className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-2xl font-bold">{todayDeliveries}</p><p className="text-xs text-muted-foreground">Entregas Hoje</p></div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><Star className="h-5 w-5 fill-gold-500 text-gold-500" /></div>
            <div><p className="text-2xl font-bold">{avgRating.toFixed(1)}</p><p className="text-xs text-muted-foreground">Avaliação Média</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Card da tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bike className="h-4 w-4 text-gold-500" />
              Equipe de Entregadores
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar entregador..."
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
                    <button onClick={() => { setActiveFilter('available'); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-400" /> Disponíveis
                    </button>
                    <button onClick={() => { setActiveFilter('in_transit'); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <Truck className="h-3 w-3 text-blue-400" /> Em Rota
                    </button>
                    <button onClick={() => { setActiveFilter('on_break'); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <Coffee className="h-3 w-3 text-yellow-400" /> Em Pausa
                    </button>
                    <button onClick={() => { setActiveFilter('inactive'); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <XCircle className="h-3 w-3 text-muted-foreground" /> Inativos
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
                <col style={{ width: '26%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Entregador</th>
                  <th className="px-4 py-2.5 text-left">Veículo</th>
                  <th className="px-4 py-2.5 text-left">Status</th>
                  <th className="px-4 py-2.5 text-left">Rota Atual</th>
                  <th className="px-4 py-2.5 text-center">Hoje</th>
                  <th className="px-4 py-2.5 text-center">Total</th>
                  <th className="px-4 py-2.5 text-center">Avaliação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      <Bike className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhum entregador encontrado</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((d) => {
                    const vcfg = VEHICLE_CONFIG[d.vehicle];
                    return (
                      <tr key={d.id} className="hover:bg-gold-500/5 transition-colors group">

                        {/* Entregador */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={d.name} />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{d.name}</p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Phone className="h-2.5 w-2.5 shrink-0" />{d.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Veículo */}
                        <td className="px-4 py-3">
                          <p className={cn('text-xs font-semibold', vcfg.color)}>{vcfg.label}</p>
                          <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{d.plate}</p>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5 shrink-0" />{d.since} · <MapPin className="h-2.5 w-2.5 shrink-0" />{d.city}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={d.status} />
                        </td>

                        {/* Rota atual */}
                        <td className="px-4 py-3">
                          {d.currentRoute ? (
                            <p className="text-xs text-blue-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3 shrink-0" />
                              {d.currentRoute}
                            </p>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>

                        {/* Hoje */}
                        <td className="px-4 py-3 text-center">
                          <p className="text-sm font-bold">{d.deliveriesToday}</p>
                          <p className="text-[10px] text-muted-foreground">entregas</p>
                        </td>

                        {/* Total */}
                        <td className="px-4 py-3 text-center">
                          <p className="text-sm font-semibold text-muted-foreground">
                            {d.deliveriesTotal.toLocaleString('pt-BR')}
                          </p>
                        </td>

                        {/* Avaliação + ações */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <RatingStars rating={d.rating} />
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleOpenEdit(d)} className="p-1 rounded-md hover:bg-gold-500/10 text-muted-foreground hover:text-gold-400 transition-colors" title="Editar">
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => setDetailDeliverer(d)} className="p-1 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors" title="Ver detalhes">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground bg-muted/20">
            <span>{filtered.length} entregador{filtered.length !== 1 ? 'es' : ''} exibido{filtered.length !== 1 ? 's' : ''}</span>
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-400" />
              {counts.available + counts.in_transit} em operação agora
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Modal Novo Entregador */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setModalOpen(false); resetForm(); }} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl shadow-black/40 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold-500/10"><Bike className="h-5 w-5 text-gold-500" /></div>
                <div>
                  <h2 className="text-lg font-bold">Novo Entregador</h2>
                  <p className="text-xs text-muted-foreground">Cadastre um novo membro da equipe</p>
                </div>
              </div>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nome Completo *</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Ex: Carlos Eduardo Moto"
                  className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Telefone *</label>
                  <input type="text" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} placeholder="(11) 9 9999-9999"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Veículo</label>
                  <select value={formVehicle} onChange={(e) => setFormVehicle(e.target.value as VehicleType)}
                    className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none">
                    {Object.entries(VEHICLE_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Placa</label>
                  <input type="text" value={formPlate} onChange={(e) => setFormPlate(e.target.value)} placeholder="ABC-1D23"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Cidade</label>
                  <input type="text" value={formCity} onChange={(e) => setFormCity(e.target.value)} placeholder="São Paulo"
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
                onClick={handleCreate}
                className={cn(
                  'inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                  formName && formPhone && !saving
                    ? 'bg-gold-500 hover:bg-gold-600 text-black shadow-md shadow-gold-500/20'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {saving ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {detailDeliverer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailDeliverer(null)} />
          <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl shadow-black/40 animate-fade-in flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={detailDeliverer.name} />
                <div>
                  <h2 className="text-lg font-bold">{detailDeliverer.name}</h2>
                  <p className="text-xs text-muted-foreground">{VEHICLE_CONFIG[detailDeliverer.vehicle].label} · {detailDeliverer.plate}</p>
                </div>
              </div>
              <button onClick={() => setDetailDeliverer(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between">
                <StatusBadge status={detailDeliverer.status} />
                <RatingStars rating={detailDeliverer.rating} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                  <p className="text-lg font-bold">{detailDeliverer.deliveriesToday}</p>
                  <p className="text-[10px] text-muted-foreground">Hoje</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                  <p className="text-lg font-bold">{detailDeliverer.deliveriesTotal}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                  <p className="text-lg font-bold text-gold-400">{detailDeliverer.rating.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground">Rating</p>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Contato</p>
                <p className="text-sm flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{detailDeliverer.phone}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Localização</p>
                <p className="text-sm flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gold-500" />{detailDeliverer.city} · Desde {detailDeliverer.since}</p>
              </div>
              {detailDeliverer.currentRoute && (
                <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Rota Atual</p>
                  <p className="text-sm text-blue-400 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{detailDeliverer.currentRoute}</p>
                </div>
              )}
            </div>
            <div className="shrink-0 border-t border-border p-4 space-y-2">
              <div className="flex gap-2">
                <button onClick={() => handleCall(detailDeliverer.phone)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground transition-colors hover:text-foreground">
                  <Phone className="h-3.5 w-3.5" /> Ligar
                </button>
                <button onClick={() => handleWhatsApp(detailDeliverer.phone, detailDeliverer.name)} className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-sm text-green-400 transition-colors">
                  <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                </button>
              </div>
              <button onClick={() => { handleOpenEdit(detailDeliverer); setDetailDeliverer(null); }} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-black font-semibold text-sm transition-colors">
                <Edit className="h-3.5 w-3.5" /> Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Drawer */}
      {editDeliverer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditDeliverer(null)} />
          <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl shadow-black/40 animate-fade-in flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold-500/10"><Edit className="h-5 w-5 text-gold-500" /></div>
                <div><h2 className="text-lg font-bold">Editar Entregador</h2><p className="text-xs text-muted-foreground">{editDeliverer.name}</p></div>
              </div>
              <button onClick={() => setEditDeliverer(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Nome *</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Telefone *</label>
                <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50" />
              </div>
              <div><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['available', 'in_transit', 'on_break', 'inactive'] as DelivererStatus[]).map((s) => (
                    <button key={s} onClick={() => setEditStatus(s)} className={cn('py-2 rounded-lg border text-xs font-medium transition-all', editStatus === s ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color}` : 'border-border text-muted-foreground hover:bg-muted')}>
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="shrink-0 border-t border-border p-4 flex items-center justify-end gap-2">
              <button onClick={() => setEditDeliverer(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancelar</button>
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
