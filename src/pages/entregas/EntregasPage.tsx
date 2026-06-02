import { useState, useMemo, useCallback } from 'react';
import {
  Package, Plus, Search, Filter, Eye, MapPin,
  Clock, CheckCircle2, XCircle, Truck, TrendingUp,
  ChevronDown, ArrowUpDown, Download, RefreshCw,
  Printer, MoreHorizontal, ExternalLink,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { NovaEntregaModal } from './components/NovaEntregaModal';
import { DetalhesEntregaDrawer } from './components/DetalhesEntregaDrawer';
import type { EntregaFormData } from './components/NovaEntregaModal';

type DeliveryStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled';

interface Delivery {
  id: string;
  code: string;
  customer: string;
  district: string;
  address: string;
  deliverer: string | null;
  status: DeliveryStatus;
  value: number;
  time: string;
  eta: string | null;
}

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:    { label: 'Pendente',     color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  in_transit: { label: 'Em Andamento', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',    icon: Truck },
  delivered:  { label: 'Entregue',     color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',  icon: CheckCircle2 },
  cancelled:  { label: 'Cancelada',    color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',      icon: XCircle },
};

const INITIAL_DELIVERIES: Delivery[] = [
  { id: '1', code: '#ENT-001', customer: 'João da Silva',      district: 'Centro',      address: 'Rua das Flores, 123',         deliverer: 'Carlos Moto',  status: 'delivered',  value: 18.50, time: '08:14', eta: null },
  { id: '2', code: '#ENT-002', customer: 'Maria Oliveira',     district: 'Jardins',     address: 'Av. Paulista, 456',           deliverer: 'Roberto Bike', status: 'in_transit', value: 24.00, time: '08:42', eta: '09:15' },
  { id: '3', code: '#ENT-003', customer: 'Pedro Mendonça',     district: 'Vila Nova',   address: 'Rua Ipiranga, 789',           deliverer: null,           status: 'pending',    value: 15.00, time: '09:05', eta: null },
  { id: '4', code: '#ENT-004', customer: 'Ana Costa',          district: 'Moema',       address: 'Rua Iguatemi, 321',           deliverer: 'Lucas Entrega', status: 'in_transit', value: 32.00, time: '09:20', eta: '09:55' },
  { id: '5', code: '#ENT-005', customer: 'Fernanda Rocha',     district: 'Pinheiros',   address: 'Al. dos Arapanés, 654',       deliverer: null,           status: 'pending',    value: 12.50, time: '09:33', eta: null },
  { id: '6', code: '#ENT-006', customer: 'Ricardo Alves',      district: 'Lapa',        address: 'Rua Guaicurus, 987',          deliverer: 'Carlos Moto',  status: 'delivered',  value: 21.00, time: '07:50', eta: null },
  { id: '7', code: '#ENT-007', customer: 'Juliana Ferreira',   district: 'Itaim Bibi',  address: 'Av. Brigadeiro Faria Lima',   deliverer: 'Ana Rider',    status: 'delivered',  value: 45.00, time: '07:30', eta: null },
  { id: '8', code: '#ENT-008', customer: 'Marcos Ribeiro',     district: 'Brooklin',    address: 'Rua Dr. Luís Migliano',       deliverer: null,           status: 'cancelled',  value: 28.00, time: '08:00', eta: null },
  { id: '9', code: '#ENT-009', customer: 'Camila Torres',      district: 'Santo André', address: 'Av. Portugal, 1500',          deliverer: 'Roberto Bike', status: 'in_transit', value: 19.00, time: '09:45', eta: '10:20' },
  { id: '10', code: '#ENT-010', customer: 'Bruno Nascimento',  district: 'Tatuapé',     address: 'Rua Itaquera, 255',           deliverer: null,           status: 'pending',    value: 16.50, time: '09:58', eta: null },
  { id: '11', code: '#ENT-011', customer: 'Larissa Campos',    district: 'Santana',     address: 'Av. Braz Leme, 400',          deliverer: 'Lucas Entrega', status: 'delivered',  value: 38.00, time: '08:10', eta: null },
  { id: '12', code: '#ENT-012', customer: 'Gabriel Souza',     district: 'Penha',       address: 'Rua Cel. Albino Brito',       deliverer: null,           status: 'cancelled',  value: 22.00, time: '08:35', eta: null },
];

const FILTER_TABS: { key: 'all' | DeliveryStatus; label: string }[] = [
  { key: 'all',        label: 'Todas' },
  { key: 'pending',    label: 'Pendentes' },
  { key: 'in_transit', label: 'Em Andamento' },
  { key: 'delivered',  label: 'Entregues' },
  { key: 'cancelled',  label: 'Canceladas' },
];

function StatusBadge({ status }: { status: DeliveryStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export function EntregasPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>(INITIAL_DELIVERIES);
  const [activeFilter, setActiveFilter] = useState<'all' | DeliveryStatus>('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [sortAsc, setSortAsc] = useState(true);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const base = deliveries.filter((d) => {
      const matchStatus = activeFilter === 'all' || d.status === activeFilter;
      const q = search.toLowerCase();
      const matchSearch = !q || d.code.toLowerCase().includes(q) || d.customer.toLowerCase().includes(q) || d.district.toLowerCase().includes(q) || (d.deliverer?.toLowerCase().includes(q) ?? false);
      return matchStatus && matchSearch;
    });
    return [...base].sort((a, b) => sortAsc ? a.customer.localeCompare(b.customer) : b.customer.localeCompare(a.customer));
  }, [deliveries, activeFilter, search, sortAsc]);

  const counts = useMemo(() => ({
    all:        deliveries.length,
    pending:    deliveries.filter((d) => d.status === 'pending').length,
    in_transit: deliveries.filter((d) => d.status === 'in_transit').length,
    delivered:  deliveries.filter((d) => d.status === 'delivered').length,
    cancelled:  deliveries.filter((d) => d.status === 'cancelled').length,
  }), [deliveries]);

  const totalValue = useMemo(
    () => filtered.reduce((sum, d) => sum + (d.status !== 'cancelled' ? d.value : 0), 0),
    [filtered]
  );

  const handleNewDelivery = useCallback((data: EntregaFormData) => {
    const newId = String(deliveries.length + 1);
    const now = new Date();
    const newDelivery: Delivery = {
      id: newId,
      code: `#ENT-${String(deliveries.length + 1).padStart(3, '0')}`,
      customer: data.customerName,
      district: data.district,
      address: data.address,
      deliverer: data.delivererName,
      status: data.delivererId ? 'in_transit' : 'pending',
      value: data.value,
      time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
      eta: null,
    };
    setDeliveries((prev) => [newDelivery, ...prev]);
  }, [deliveries.length]);

  const handleStatusChange = useCallback((id: string, newStatus: DeliveryStatus) => {
    setDeliveries((prev) => prev.map((d) => d.id === id ? { ...d, status: newStatus, eta: newStatus === 'delivered' || newStatus === 'cancelled' ? null : d.eta } : d));
    setSelectedDelivery(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setRefreshing(false);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveFilter('all');
    setSearch('');
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['Código', 'Cliente', 'Bairro', 'Endereço', 'Entregador', 'Status', 'Valor', 'Hora'],
      ...deliveries.map((d) => [
        d.code, d.customer, d.district, d.address, d.deliverer || 'N/A',
        STATUS_CONFIG[d.status].label, d.value.toFixed(2), d.time,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entregas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Entregas exportadas com sucesso!');
  }, [deliveries, showToast]);

  const handleOpenMap = useCallback((address: string, district: string) => {
    const query = encodeURIComponent(`${address}, ${district}, São Paulo`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }, []);

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Entregas</h1>
          <p className="text-muted-foreground">Gerencie e acompanhe todas as entregas do dia</p>
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
            Nova Entrega
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-yellow-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10"><Clock className="h-5 w-5 text-yellow-400" /></div>
            <div><p className="text-2xl font-bold">{counts.pending}</p><p className="text-xs text-muted-foreground">Pendentes</p></div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Truck className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-2xl font-bold">{counts.in_transit}</p><p className="text-xs text-muted-foreground">Em Andamento</p></div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-2xl font-bold">{counts.delivered}</p><p className="text-xs text-muted-foreground">Entregues</p></div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><TrendingUp className="h-5 w-5 text-gold-400" /></div>
            <div>
              <p className="text-2xl font-bold">{totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="text-xs text-muted-foreground">Faturado (filtro)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4 text-gold-500" />
              Lista de Entregas
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-48"
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
                    <button onClick={() => { setActiveFilter('pending'); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <Clock className="h-3 w-3 text-yellow-400" /> Apenas Pendentes
                    </button>
                    <button onClick={() => { setActiveFilter('in_transit'); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <Truck className="h-3 w-3 text-blue-400" /> Em Andamento
                    </button>
                    <button onClick={() => { setActiveFilter('delivered'); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-400" /> Entregues
                    </button>
                    <button onClick={() => { setActiveFilter('cancelled'); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <XCircle className="h-3 w-3 text-red-400" /> Canceladas
                    </button>
                    <div className="border-t border-border my-1" />
                    <button onClick={() => { clearFilters(); setFilterDropdownOpen(false); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors text-gold-400 font-medium">
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
                <span className={cn('ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full', activeFilter === tab.key ? 'bg-gold-500/20 text-gold-400' : 'bg-muted text-muted-foreground')}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto_auto] gap-0 border-t border-border text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 py-2.5 bg-muted/40">
            <div className="w-24">Código</div>
            <div onClick={() => setSortAsc(!sortAsc)} className="flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors">
              Cliente <ArrowUpDown className={cn('h-3 w-3', !sortAsc && 'text-gold-400')} />
            </div>
            <div>Bairro / Endereço</div>
            <div>Entregador</div>
            <div className="w-32 text-center">Status</div>
            <div className="w-24 text-right">Valor</div>
            <div className="w-20 text-right">Ações</div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              <Package className="h-10 w-10 mx-auto mb-3 opacity-20" />
              Nenhuma entrega encontrada
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((delivery) => (
                <div
                  key={delivery.id}
                  className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto_auto] gap-0 px-4 py-3 text-sm hover:bg-gold-500/5 transition-colors group items-center cursor-pointer"
                  onClick={() => setSelectedDelivery(delivery)}
                >
                  <div className="w-24">
                    <span className="font-mono text-xs text-gold-500 font-semibold">{delivery.code}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{delivery.time}</p>
                  </div>
                  <div className="min-w-0 pr-4">
                    <p className="font-medium truncate">{delivery.customer}</p>
                  </div>
                  <div className="min-w-0 pr-4">
                    <p className="font-medium text-xs">{delivery.district}</p>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="h-2.5 w-2.5 shrink-0" />{delivery.address}
                    </p>
                  </div>
                  <div className="pr-4">
                    {delivery.deliverer ? (
                      <div>
                        <p className="text-xs font-medium">{delivery.deliverer}</p>
                        {delivery.eta && (
                          <p className="text-[10px] text-blue-400 flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5" />ETA {delivery.eta}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">— não atribuído</span>
                    )}
                  </div>
                  <div className="w-32 flex justify-center">
                    <StatusBadge status={delivery.status} />
                  </div>
                  <div className="w-24 text-right">
                    <span className={cn('text-sm font-semibold', delivery.status === 'cancelled' ? 'line-through text-muted-foreground' : 'text-foreground')}>
                      {delivery.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                  <div className="w-20 flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setSelectedDelivery(delivery)}
                      className="p-1.5 rounded-md hover:bg-gold-500/10 text-muted-foreground hover:text-gold-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleOpenMap(delivery.address, delivery.district)}
                      className="p-1.5 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                      title="Abrir no mapa"
                    >
                      <MapPin className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-xs text-muted-foreground bg-muted/20">
            <span>{filtered.length} entrega{filtered.length !== 1 ? 's' : ''} exibida{filtered.length !== 1 ? 's' : ''}</span>
            <span>Total sem cancelamentos: <span className="text-foreground font-semibold">
              {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span></span>
          </div>
        </CardContent>
      </Card>

      {/* Modal Nova Entrega */}
      <NovaEntregaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleNewDelivery}
      />

      {/* Drawer de Detalhes */}
      <DetalhesEntregaDrawer
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        onStatusChange={handleStatusChange}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-gold-500/30 rounded-lg px-4 py-3 shadow-xl shadow-black/30 animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
