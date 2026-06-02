import { useState, useMemo } from 'react';
import {
  BarChart3, Plus, TrendingUp, TrendingDown, Users, Package,
  Star, CheckCircle2, XCircle, Clock, ChevronDown, Eye,
  Target, Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type BillingStatus = 'fechado' | 'aberto' | 'projecao';

interface MonthlyBilling {
  id: string;
  month: string;
  shortMonth: string;
  year: number;
  activeClients: number;
  deliveries: number;
  avgTicket: number;
  billed: number;
  goal: number;
  status: BillingStatus;
}

interface TopClient {
  rank: number;
  name: string;
  deliveries: number;
  revenue: number;
  growth: number;
}

const STATUS_CONFIG: Record<BillingStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  fechado:  { label: 'Fechado',  color: 'text-green-400',        bg: 'bg-green-500/10 border-green-500/20',  icon: CheckCircle2 },
  aberto:   { label: 'Em aberto', color: 'text-yellow-400',      bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  projecao: { label: 'Projeção', color: 'text-blue-400',         bg: 'bg-blue-500/10 border-blue-500/20',    icon: TrendingUp as typeof Clock },
};

const MOCK_BILLING: MonthlyBilling[] = [
  { id: '1', month: 'Novembro', shortMonth: 'Nov',  year: 2025, activeClients: 28, deliveries: 1840, avgTicket: 48.20, billed: 88688.00, goal: 85000.00, status: 'fechado' },
  { id: '2', month: 'Dezembro', shortMonth: 'Dez',  year: 2025, activeClients: 31, deliveries: 2140, avgTicket: 49.50, billed: 105930.00,goal: 95000.00, status: 'fechado' },
  { id: '3', month: 'Janeiro',  shortMonth: 'Jan',  year: 2026, activeClients: 29, deliveries: 1720, avgTicket: 47.80, billed: 82216.00, goal: 90000.00, status: 'fechado' },
  { id: '4', month: 'Fevereiro',shortMonth: 'Fev',  year: 2026, activeClients: 30, deliveries: 1560, avgTicket: 48.90, billed: 76284.00, goal: 90000.00, status: 'fechado' },
  { id: '5', month: 'Março',    shortMonth: 'Mar',  year: 2026, activeClients: 33, deliveries: 2020, avgTicket: 50.10, billed: 101202.00,goal: 95000.00, status: 'fechado' },
  { id: '6', month: 'Abril',    shortMonth: 'Abr',  year: 2026, activeClients: 34, deliveries: 2180, avgTicket: 51.20, billed: 111616.00,goal: 100000.00,status: 'fechado' },
  { id: '7', month: 'Maio',     shortMonth: 'Mai',  year: 2026, activeClients: 36, deliveries: 840,  avgTicket: 52.30, billed: 43932.00, goal: 105000.00,status: 'aberto' },
  { id: '8', month: 'Junho',    shortMonth: 'Jun',  year: 2026, activeClients: 38, deliveries: 0,    avgTicket: 0,     billed: 0,        goal: 110000.00,status: 'projecao' },
];

const TOP_CLIENTS: TopClient[] = [
  { rank: 1, name: 'Mercadinho do Zé',        deliveries: 312, revenue: 18200.00, growth: +14.3 },
  { rank: 2, name: 'Restaurante Sabor & Arte', deliveries: 280, revenue: 15680.00, growth: +8.7  },
  { rank: 3, name: 'Farmácia Saúde Total',     deliveries: 240, revenue: 13440.00, growth: +22.1 },
  { rank: 4, name: 'Padaria Bom Pão Ltda',     deliveries: 198, revenue: 9900.00,  growth: -3.2  },
  { rank: 5, name: 'Clínica Bem Estar',        deliveries: 156, revenue: 8736.00,  growth: +11.8 },
];

const YEAR_OPTIONS = ['2026', '2025'];

function StatusBadge({ status }: { status: BillingStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function GoalBar({ billed, goal, status }: { billed: number; goal: number; status: BillingStatus }) {
  const pct = goal > 0 ? Math.min((billed / goal) * 100, 100) : 0;
  const color =
    status === 'projecao' ? 'bg-blue-500' :
    pct >= 100            ? 'bg-green-500' :
    pct >= 80             ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', color, status === 'projecao' && 'opacity-40')}
          style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] text-muted-foreground shrink-0 w-8 text-right">{Math.round(pct)}%</span>
    </div>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-end gap-0.5 h-8">
      {[20, 40, 60, 80, 100].map((threshold) => (
        <div
          key={threshold}
          className={cn('w-2 rounded-sm transition-all', pct >= threshold ? 'bg-gold-500' : 'bg-muted')}
          style={{ height: `${threshold}%` }}
        />
      ))}
    </div>
  );
}

export function FaturamentoPage() {
  const [year, setYear] = useState('2026');

  const filtered = useMemo(() =>
    MOCK_BILLING.filter((b) => b.year === parseInt(year)),
    [year]
  );

  const currentMonth = MOCK_BILLING.find((b) => b.status === 'aberto');
  const lastClosed   = MOCK_BILLING.filter((b) => b.status === 'fechado').at(-1);
  const prevClosed   = MOCK_BILLING.filter((b) => b.status === 'fechado').at(-2);

  const growth = lastClosed && prevClosed
    ? ((lastClosed.billed - prevClosed.billed) / prevClosed.billed) * 100
    : 0;

  const annualProjection = useMemo(() => {
    const monthlyAvg = MOCK_BILLING.filter((b) => b.status === 'fechado').reduce((s, b) => s + b.billed, 0)
      / MOCK_BILLING.filter((b) => b.status === 'fechado').length;
    return monthlyAvg * 12;
  }, []);

  const maxBilled = Math.max(...filtered.map((b) => b.billed));
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Faturamento</h1>
          <p className="text-muted-foreground">Receita mensal, metas e evolução por cliente</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="pl-8 pr-7 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none text-muted-foreground"
            >
              {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
          </div>
          <button className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-md shadow-gold-500/20">
            <Plus className="h-4 w-4" />
            Lançar Meta
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><BarChart3 className="h-5 w-5 text-gold-400" /></div>
            <div>
              <p className="text-xl font-bold">{fmt(currentMonth?.billed ?? 0)}</p>
              <p className="text-xs text-muted-foreground">Faturado em {currentMonth?.month ?? '—'}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Target className="h-5 w-5 text-blue-400" /></div>
            <div>
              <p className="text-xl font-bold text-blue-400">{fmt(currentMonth?.goal ?? 0)}</p>
              <p className="text-xs text-muted-foreground">Meta do Mês</p>
            </div>
          </CardContent>
        </Card>
        <Card className={cn('border', growth >= 0 ? 'border-green-500/10' : 'border-red-500/10')}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', growth >= 0 ? 'bg-green-500/10' : 'bg-red-500/10')}>
              {growth >= 0
                ? <TrendingUp className="h-5 w-5 text-green-400" />
                : <TrendingDown className="h-5 w-5 text-red-400" />
              }
            </div>
            <div>
              <p className={cn('text-xl font-bold', growth >= 0 ? 'text-green-400' : 'text-red-400')}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Crescimento MoM</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10"><TrendingUp className="h-5 w-5 text-purple-400" /></div>
            <div>
              <p className="text-xl font-bold text-purple-400">{fmt(annualProjection)}</p>
              <p className="text-xs text-muted-foreground">Projeção Anual</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabela mensal */}
        <div className="lg:col-span-2">
          <Card className="border-gold-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gold-500" />
                Faturamento Mensal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-t border-border">
                  <colgroup>
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '16%' }} />
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '14%' }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <th className="px-4 py-2.5 text-left">Mês</th>
                      <th className="px-4 py-2.5 text-center">Clientes</th>
                      <th className="px-4 py-2.5 text-center">Entregas</th>
                      <th className="px-4 py-2.5 text-right">Ticket Méd.</th>
                      <th className="px-4 py-2.5 text-right">Faturado</th>
                      <th className="px-4 py-2.5 text-left px-6">vs. Meta</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((b) => (
                      <tr key={b.id} className={cn(
                        'hover:bg-gold-500/5 transition-colors',
                        b.status === 'aberto' && 'bg-yellow-500/3',
                        b.status === 'projecao' && 'opacity-60'
                      )}>
                        {/* Mês */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <MiniBar value={b.billed} max={maxBilled} />
                            <span className="font-medium text-xs">{b.shortMonth}/{b.year.toString().slice(2)}</span>
                          </div>
                        </td>

                        {/* Clientes */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {b.activeClients}
                          </span>
                        </td>

                        {/* Entregas */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Package className="h-3 w-3" />
                            {b.deliveries > 0 ? b.deliveries.toLocaleString('pt-BR') : '—'}
                          </span>
                        </td>

                        {/* Ticket */}
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-medium">
                            {b.avgTicket > 0 ? b.avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                          </span>
                        </td>

                        {/* Faturado */}
                        <td className="px-4 py-3 text-right">
                          <span className={cn('text-sm font-bold',
                            b.status === 'projecao' ? 'text-blue-400' :
                            b.billed >= b.goal ? 'text-green-400' : ''
                          )}>
                            {b.billed > 0 ? fmt(b.billed) : '—'}
                          </span>
                        </td>

                        {/* vs Meta */}
                        <td className="px-4 py-3 px-6">
                          {b.billed > 0 || b.status === 'aberto'
                            ? <GoalBar billed={b.billed} goal={b.goal} status={b.status} />
                            : <span className="text-xs text-muted-foreground">Meta: {fmt(b.goal)}</span>
                          }
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rodapé */}
              <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground">Total {year}</p>
                  <p className="text-sm font-bold mt-0.5">
                    {fmt(filtered.filter((b) => b.status === 'fechado').reduce((s, b) => s + b.billed, 0))}
                  </p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Entregas</p>
                  <p className="text-sm font-bold mt-0.5">
                    {filtered.reduce((s, b) => s + b.deliveries, 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground">Meta Total</p>
                  <p className="text-sm font-bold text-blue-400 mt-0.5">
                    {fmt(filtered.reduce((s, b) => s + b.goal, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top clientes */}
        <div>
          <Card className="border-gold-500/10 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-gold-500" />
                Top Clientes — {currentMonth?.month ?? 'Mês Atual'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {TOP_CLIENTS.map((client) => (
                  <div key={client.rank} className="px-4 py-4 hover:bg-gold-500/5 transition-colors group">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                        client.rank === 1 ? 'bg-gold-500/20 text-gold-400 border border-gold-500/30' :
                        client.rank === 2 ? 'bg-zinc-400/15 text-zinc-400 border border-zinc-400/20' :
                        client.rank === 3 ? 'bg-amber-700/15 text-amber-600 border border-amber-700/20' :
                        'bg-muted text-muted-foreground border border-border'
                      )}>
                        {client.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{client.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Package className="h-2.5 w-2.5" />
                            {client.deliveries} entregas
                          </span>
                          <span className={cn('text-[10px] font-medium flex items-center gap-0.5',
                            client.growth >= 0 ? 'text-green-400' : 'text-red-400'
                          )}>
                            {client.growth >= 0
                              ? <TrendingUp className="h-2.5 w-2.5" />
                              : <TrendingDown className="h-2.5 w-2.5" />
                            }
                            {client.growth >= 0 ? '+' : ''}{client.growth}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">{fmt(client.revenue)}</p>
                        <button className="mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400">
                          <Eye className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Barra relativa */}
                    <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold-500/60 transition-all"
                        style={{ width: `${(client.revenue / TOP_CLIENTS[0].revenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="px-4 py-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Total top 5</p>
                  <p className="text-sm font-bold text-gold-400">
                    {fmt(TOP_CLIENTS.reduce((s, c) => s + c.revenue, 0))}
                  </p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {((TOP_CLIENTS.reduce((s, c) => s + c.revenue, 0) / (currentMonth?.billed ?? 1)) * 100).toFixed(0)}% do faturamento do mês
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
