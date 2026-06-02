import { useState, useMemo, useCallback, useRef } from 'react';
import {
  Package, TrendingUp, Truck, XCircle, DollarSign, Users,
  Clock, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  RefreshCw, Download, Plus, Eye, MapPin, CheckCircle2,
  AlertCircle, Bike, Star, Zap, Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

// ── Dados mock por período ────────────────
type Period = 'today' | 'week' | 'month';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Visão geral das operações de hoje',
  week: 'Resumo da semana atual',
  month: 'Desempenho do mês corrente',
};

const HOURLY_DATA_MAP: Record<Period, { hour: string; entregas: number; canceladas: number }[]> = {
  today: [
    { hour: '06h', entregas: 2, canceladas: 0 }, { hour: '07h', entregas: 8, canceladas: 1 },
    { hour: '08h', entregas: 15, canceladas: 2 }, { hour: '09h', entregas: 22, canceladas: 1 },
    { hour: '10h', entregas: 18, canceladas: 3 }, { hour: '11h', entregas: 28, canceladas: 2 },
    { hour: '12h', entregas: 35, canceladas: 4 }, { hour: '13h', entregas: 20, canceladas: 1 },
    { hour: '14h', entregas: 12, canceladas: 0 }, { hour: '15h', entregas: 8, canceladas: 1 },
    { hour: '16h', entregas: 5, canceladas: 0 }, { hour: '17h', entregas: 3, canceladas: 0 },
  ],
  week: [
    { hour: 'Seg', entregas: 142, canceladas: 8 }, { hour: 'Ter', entregas: 158, canceladas: 12 },
    { hour: 'Qua', entregas: 135, canceladas: 6 }, { hour: 'Qui', entregas: 172, canceladas: 10 },
    { hour: 'Sex', entregas: 196, canceladas: 14 }, { hour: 'Sáb', entregas: 180, canceladas: 9 },
    { hour: 'Dom', entregas: 98, canceladas: 5 },
  ],
  month: [
    { hour: 'S1', entregas: 680, canceladas: 42 }, { hour: 'S2', entregas: 750, canceladas: 38 },
    { hour: 'S3', entregas: 820, canceladas: 50 }, { hour: 'S4', entregas: 790, canceladas: 44 },
  ],
};

const REVENUE_DATA_MAP: Record<Period, { dia: string; valor: number }[]> = {
  today: [
    { dia: '06-09h', valor: 450 }, { dia: '09-12h', valor: 1380 },
    { dia: '12-15h', valor: 980 }, { dia: '15-18h', valor: 640 },
  ],
  week: [
    { dia: 'Seg', valor: 1850 }, { dia: 'Ter', valor: 2340 }, { dia: 'Qua', valor: 1980 },
    { dia: 'Qui', valor: 2750 }, { dia: 'Sex', valor: 3120 }, { dia: 'Sáb', valor: 2890 },
    { dia: 'Dom', valor: 1520 },
  ],
  month: [
    { dia: 'S1', valor: 9800 }, { dia: 'S2', valor: 11200 },
    { dia: 'S3', valor: 12450 }, { dia: 'S4', valor: 10900 },
  ],
};

const PIE_DATA_MAP: Record<Period, { name: string; value: number; color: string }[]> = {
  today: [
    { name: 'Entregues', value: 128, color: '#22c55e' },
    { name: 'Em andamento', value: 18, color: '#3b82f6' },
    { name: 'Canceladas', value: 10, color: '#ef4444' },
  ],
  week: [
    { name: 'Entregues', value: 945, color: '#22c55e' },
    { name: 'Em andamento', value: 72, color: '#3b82f6' },
    { name: 'Canceladas', value: 64, color: '#ef4444' },
  ],
  month: [
    { name: 'Entregues', value: 3580, color: '#22c55e' },
    { name: 'Em andamento', value: 210, color: '#3b82f6' },
    { name: 'Canceladas', value: 174, color: '#ef4444' },
  ],
};

const KPIS_MAP: Record<Period, { label: string; value: string | number; icon: typeof Package; color: string; bg: string; border: string; change: string; up: boolean }[]> = {
  today: [
    { label: 'Total Entregas', value: 156, icon: Package, color: 'text-gold-400', bg: 'bg-gold-500/10', border: 'border-gold-500/10', change: '+12%', up: true },
    { label: 'Entregues', value: 128, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/10', change: '+8%', up: true },
    { label: 'Em Andamento', value: 18, icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/10', change: '+3', up: true },
    { label: 'Canceladas', value: 10, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/10', change: '-2%', up: false },
    { label: 'Faturamento', value: 'R$ 12.450', icon: DollarSign, color: 'text-gold-500', bg: 'bg-gold-500/10', border: 'border-gold-500/15', change: '+15%', up: true },
    { label: 'Entregadores Ativos', value: 12, icon: Users, color: 'text-gold-300', bg: 'bg-gold-500/10', border: 'border-gold-500/10', change: '+2', up: true },
  ],
  week: [
    { label: 'Total Entregas', value: '1.081', icon: Package, color: 'text-gold-400', bg: 'bg-gold-500/10', border: 'border-gold-500/10', change: '+18%', up: true },
    { label: 'Entregues', value: 945, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/10', change: '+14%', up: true },
    { label: 'Em Andamento', value: 72, icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/10', change: '+5', up: true },
    { label: 'Canceladas', value: 64, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/10', change: '-4%', up: false },
    { label: 'Faturamento', value: 'R$ 16.450', icon: DollarSign, color: 'text-gold-500', bg: 'bg-gold-500/10', border: 'border-gold-500/15', change: '+22%', up: true },
    { label: 'Entregadores Ativos', value: 15, icon: Users, color: 'text-gold-300', bg: 'bg-gold-500/10', border: 'border-gold-500/10', change: '+3', up: true },
  ],
  month: [
    { label: 'Total Entregas', value: '3.964', icon: Package, color: 'text-gold-400', bg: 'bg-gold-500/10', border: 'border-gold-500/10', change: '+25%', up: true },
    { label: 'Entregues', value: '3.580', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/10', change: '+20%', up: true },
    { label: 'Em Andamento', value: 210, icon: Truck, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/10', change: '+12', up: true },
    { label: 'Canceladas', value: 174, icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/10', change: '-1%', up: false },
    { label: 'Faturamento', value: 'R$ 44.350', icon: DollarSign, color: 'text-gold-500', bg: 'bg-gold-500/10', border: 'border-gold-500/15', change: '+30%', up: true },
    { label: 'Entregadores Ativos', value: 18, icon: Users, color: 'text-gold-300', bg: 'bg-gold-500/10', border: 'border-gold-500/10', change: '+5', up: true },
  ],
};

const TOP_DELIVERERS = [
  { name: 'Carlos Moto', entregas: 32, rating: 4.9, tempo: '18min' },
  { name: 'Roberto Bike', entregas: 28, rating: 4.8, tempo: '22min' },
  { name: 'Ana Rider', entregas: 25, rating: 4.7, tempo: '20min' },
  { name: 'Lucas Entrega', entregas: 22, rating: 4.6, tempo: '25min' },
  { name: 'Fernanda Express', entregas: 21, rating: 4.5, tempo: '19min' },
];

const RECENT_ACTIVITY = [
  { id: '1', type: 'delivered' as const, text: 'Entrega #ENT-156 concluída', sub: 'Carlos Moto · Centro', time: '2 min atrás' },
  { id: '2', type: 'new' as const, text: 'Nova entrega #ENT-157 criada', sub: 'Cliente: Padaria Bom Pão', time: '5 min atrás' },
  { id: '3', type: 'cancelled' as const, text: 'Entrega #ENT-152 cancelada', sub: 'Motivo: Cliente ausente', time: '12 min atrás' },
  { id: '4', type: 'assigned' as const, text: '#ENT-155 atribuída a Ana Rider', sub: 'Destino: Moema', time: '18 min atrás' },
  { id: '5', type: 'delivered' as const, text: 'Entrega #ENT-154 concluída', sub: 'Roberto Bike · Pinheiros', time: '25 min atrás' },
  { id: '6', type: 'new' as const, text: 'Nova entrega #ENT-156 criada', sub: 'Cliente: Maria Oliveira', time: '30 min atrás' },
  { id: '7', type: 'delivered' as const, text: 'Entrega #ENT-153 concluída', sub: 'Lucas Entrega · Jardins', time: '35 min atrás' },
  { id: '8', type: 'assigned' as const, text: '#ENT-152 atribuída a Carlos Moto', sub: 'Destino: Lapa', time: '40 min atrás' },
];

const ACTIVITY_CONFIG = {
  delivered: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  new: { icon: Plus, color: 'text-gold-400', bg: 'bg-gold-500/10' },
  cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  assigned: { icon: Bike, color: 'text-blue-400', bg: 'bg-blue-500/10' },
};

// ── Tooltip customizado para Recharts ──────
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs" style={{ color: entry.color }}>
          {entry.name}: <span className="font-semibold">{entry.dataKey === 'valor'
            ? entry.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ── Avatar com iniciais ────────────────────
function Avatar({ name, rank }: { name: string; rank: number }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const rankColors = ['text-yellow-400 border-yellow-500/30 bg-yellow-500/10', 'text-gray-300 border-gray-400/30 bg-gray-400/10', 'text-amber-600 border-amber-600/30 bg-amber-600/10'];
  const rankColor = rank <= 3 ? rankColors[rank - 1] : 'text-gold-500 border-gold-500/20 bg-gold-500/10';

  return (
    <div className={cn('h-9 w-9 rounded-full border flex items-center justify-center shrink-0 relative', rankColor)}>
      <span className="text-[11px] font-bold">{initials}</span>
      {rank <= 3 && (
        <span className={cn('absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold bg-card border', rankColor)}>
          {rank}
        </span>
      )}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<Period>('today');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(() => new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
  const [chartMenu, setChartMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Dados reativos ao período
  const hourlyData = useMemo(() => HOURLY_DATA_MAP[period], [period]);
  const revenueData = useMemo(() => REVENUE_DATA_MAP[period], [period]);
  const pieData = useMemo(() => PIE_DATA_MAP[period], [period]);
  const kpis = useMemo(() => KPIS_MAP[period], [period]);

  const totalRevenue = useMemo(() => revenueData.reduce((s, d) => s + d.valor, 0), [revenueData]);
  const totalDeliveries = useMemo(() => pieData.reduce((s, d) => s + d.value, 0), [pieData]);
  const delivered = useMemo(() => pieData.find(d => d.name === 'Entregues')?.value ?? 0, [pieData]);
  const successRate = totalDeliveries > 0 ? ((delivered / totalDeliveries) * 100).toFixed(1) : '0';
  const avgDeliveryTime = period === 'today' ? '21 min' : period === 'week' ? '23 min' : '24 min';

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setLastUpdate(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    setRefreshing(false);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['Métrica', 'Valor', 'Variação'],
      ...kpis.map((k) => [k.label, String(k.value), k.change]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard_${period}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Relatório exportado com sucesso!');
  }, [kpis, period, showToast]);

  const handleExportPDF = useCallback(() => {
    // Generate a simple printable report
    const printWindow = window.open('', '_blank');
    if (!printWindow) { showToast('Popup bloqueado. Permita popups.'); return; }
    const periodLabel = period === 'today' ? 'Hoje' : period === 'week' ? 'Semana' : 'Mês';
    printWindow.document.write(`
      <html><head><title>Relatório Dashboard - ${periodLabel}</title>
      <style>body{font-family:system-ui,sans-serif;padding:40px;color:#222}table{width:100%;border-collapse:collapse;margin-top:20px}th,td{padding:8px 12px;border:1px solid #ddd;text-align:left}th{background:#f5f5f5;font-weight:600}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #d4a017;padding-bottom:12px;margin-bottom:24px}h1{margin:0;color:#d4a017}p{margin:4px 0;color:#666}</style></head><body>
      <div class="header"><div><h1>AbraSystem</h1><p>Relatório do Dashboard — ${periodLabel}</p><p>Gerado em ${new Date().toLocaleString('pt-BR')}</p></div></div>
      <table><tr><th>Métrica</th><th>Valor</th><th>Variação</th></tr>
      ${kpis.map((k) => `<tr><td>${k.label}</td><td>${k.value}</td><td>${k.change}</td></tr>`).join('')}
      </table>
      <h3 style="margin-top:24px">Distribuição</h3>
      <table><tr><th>Status</th><th>Quantidade</th></tr>
      ${pieData.map((p) => `<tr><td>${p.name}</td><td>${p.value}</td></tr>`).join('')}
      </table>
      <h3 style="margin-top:24px">Top Entregadores</h3>
      <table><tr><th>#</th><th>Nome</th><th>Entregas</th><th>Rating</th><th>Tempo Médio</th></tr>
      ${TOP_DELIVERERS.map((d, i) => `<tr><td>${i + 1}</td><td>${d.name}</td><td>${d.entregas}</td><td>${d.rating}</td><td>${d.tempo}</td></tr>`).join('')}
      </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
    showToast('Relatório PDF gerado!');
  }, [kpis, pieData, period, showToast]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">{PERIOD_LABELS[period]}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Atualizado às {lastUpdate}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period pills */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5">
            {([
              { key: 'today', label: 'Hoje' },
              { key: 'week', label: 'Semana' },
              { key: 'month', label: 'Mês' },
            ] as const).map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={cn(
                  'px-3 py-1 rounded-md text-xs font-medium transition-all',
                  period === p.key
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
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
          <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-3.5 w-3.5" />
            Exportar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={`hover:shadow-lg hover:shadow-gold-500/5 transition-all border ${kpi.border} group cursor-default`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.bg} transition-transform group-hover:scale-110`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <span className={cn(
                      'inline-flex items-center gap-0.5 text-[10px] font-semibold px-1 py-0.5 rounded',
                      kpi.up ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
                    )}>
                      {kpi.up ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                      {kpi.change}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entregas por Hora - Area Chart */}
        <Card className="border-gold-500/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold-500" />
                Entregas por Hora
              </CardTitle>
              <div className="relative">
                <button onClick={() => setChartMenu(chartMenu === 'hourly' ? null : 'hourly')} className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {chartMenu === 'hourly' && (
                  <div className="absolute right-0 top-8 z-20 w-40 bg-card border border-border rounded-lg shadow-xl shadow-black/30 py-1 animate-fade-in">
                    <button onClick={() => { handleExportCSV(); setChartMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <Download className="h-3 w-3" /> Exportar CSV
                    </button>
                    <button onClick={() => { showToast('Gráfico expandido!'); setChartMenu(null); }} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors flex items-center gap-2">
                      <Eye className="h-3 w-3" /> Expandir
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Distribuição de entregas e cancelamentos ao longo do dia</p>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradEntregas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4a017" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d4a017" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradCanceladas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 6% 16%)" />
                  <XAxis dataKey="hour" tick={{ fill: 'hsl(40 8% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(40 8% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Area type="monotone" dataKey="entregas" name="Entregas" stroke="#d4a017" fill="url(#gradEntregas)" strokeWidth={2} />
                  <Area type="monotone" dataKey="canceladas" name="Canceladas" stroke="#ef4444" fill="url(#gradCanceladas)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Faturamento - Bar Chart */}
        <Card className="border-gold-500/10">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gold-500" />
                Faturamento — Últimos 7 dias
              </CardTitle>
              <div className="text-right">
                <p className="text-lg font-bold text-gold-400">
                  {totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-[10px] text-green-400 flex items-center gap-0.5 justify-end">
                  <ArrowUpRight className="h-2.5 w-2.5" /> +15% vs semana anterior
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 6% 16%)" />
                  <XAxis dataKey="dia" tick={{ fill: 'hsl(40 8% 55%)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'hsl(40 8% 55%)', fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="valor" name="Faturamento" fill="#d4a017" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row: Pie + Top Deliverers + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart - Taxa de Sucesso */}
        <Card className="border-gold-500/10 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-gold-500" />
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75}
                    paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gold-400">{successRate}%</p>
                  <p className="text-[10px] text-muted-foreground">sucesso</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value.toLocaleString('pt-BR')}</span>
                </div>
              ))}
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-sm font-bold">{avgDeliveryTime}</p>
                <p className="text-[10px] text-muted-foreground">Tempo Médio</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold">12</p>
                <p className="text-[10px] text-muted-foreground">Ativos Agora</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Entregadores */}
        <Card className="border-gold-500/10 lg:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-gold-500" />
                Top Entregadores
              </CardTitle>
              <button onClick={() => navigate('/entregadores')} className="text-xs text-gold-500 hover:text-gold-400 transition-colors flex items-center gap-1">
                Ver todos <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Ranking por entregas concluídas hoje</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {TOP_DELIVERERS.map((d, i) => (
                <div key={d.name} className="flex items-center gap-3 group hover:bg-gold-500/5 rounded-lg p-2 -mx-2 transition-colors">
                  <Avatar name={d.name} rank={i + 1} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{d.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-0.5">
                        <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                        {d.rating}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {d.tempo} avg
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-gold-400">{d.entregas}</p>
                    <p className="text-[10px] text-muted-foreground">entregas</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Atividade Recente */}
        <Card className="border-gold-500/10 lg:col-span-5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold-500" />
                Atividade Recente
              </CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                Ao vivo
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
              {RECENT_ACTIVITY.map((activity) => {
                const cfg = ACTIVITY_CONFIG[activity.type];
                const Icon = cfg.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gold-500/5 transition-colors group">
                    <div className={cn('p-1.5 rounded-lg shrink-0 mt-0.5', cfg.bg)}>
                      <Icon className={cn('h-3.5 w-3.5', cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-[11px] text-muted-foreground">{activity.sub}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 mt-1">{activity.time}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-gold-500/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ações Rápidas</span>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/entregas')} className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-md shadow-gold-500/20">
                <Plus className="h-3.5 w-3.5" />
                Nova Entrega
              </button>
              <button onClick={() => navigate('/mapa')} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border bg-muted hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                <Eye className="h-3.5 w-3.5" />
                Ver Mapa
              </button>
              <button onClick={() => navigate('/entregas')} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border bg-muted hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                <MapPin className="h-3.5 w-3.5" />
                Pendentes
              </button>
              <button onClick={() => showToast('Nenhum alerta no momento')} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border bg-muted hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                <AlertCircle className="h-3.5 w-3.5" />
                Alertas
              </button>
              <button onClick={handleExportPDF} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border bg-muted hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                <Download className="h-3.5 w-3.5" />
                Relatório PDF
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

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
