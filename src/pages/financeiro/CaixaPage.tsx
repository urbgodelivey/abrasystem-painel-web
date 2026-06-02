import { useState, useMemo } from 'react';
import {
  Wallet, Plus, Search, Eye, Edit, TrendingUp, TrendingDown,
  ArrowUpCircle, ArrowDownCircle, CalendarDays, ChevronDown,
  Filter, Clock, Repeat2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MovType = 'entrada' | 'saida';

interface Movement {
  id: string;
  date: string;
  time: string;
  description: string;
  category: string;
  type: MovType;
  value: number;
  balance: number;
  origin: string;
}

const CATEGORY_COLOR: Record<string, string> = {
  'Vendas/Serviços':    'text-green-400 bg-green-500/10 border-green-500/20',
  'Recebimento PIX':    'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'Transferência':      'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'Fornecedores':       'text-orange-400 bg-orange-500/10 border-orange-500/20',
  'Salários':           'text-red-400 bg-red-500/10 border-red-500/20',
  'Combustível':        'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  'Impostos':           'text-rose-400 bg-rose-500/10 border-rose-500/20',
  'Operacional':        'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'Outros':             'text-muted-foreground bg-muted border-border',
};

const MOCK_MOVEMENTS: Movement[] = [
  { id: '1',  date: '14/05/2026', time: '08:12', description: 'Recebimento Mercadinho do Zé',       category: 'Recebimento PIX',  type: 'entrada', value: 3840.00, balance: 28640.00, origin: 'Contas a Receber' },
  { id: '2',  date: '14/05/2026', time: '09:45', description: 'Combustível frota — Ipiranga',       category: 'Combustível',      type: 'saida',   value: 420.00,  balance: 28220.00, origin: 'Despesa Direta' },
  { id: '3',  date: '14/05/2026', time: '11:00', description: 'Recebimento Restaurante S&A',        category: 'Recebimento PIX',  type: 'entrada', value: 1920.00, balance: 30140.00, origin: 'Contas a Receber' },
  { id: '4',  date: '13/05/2026', time: '14:20', description: 'Pagamento Embalagens Flex',          category: 'Fornecedores',     type: 'saida',   value: 1850.00, balance: 28220.00, origin: 'Contas a Pagar' },
  { id: '5',  date: '13/05/2026', time: '15:30', description: 'Tarifa bancária Bradesco',           category: 'Operacional',      type: 'saida',   value: 35.00,   balance: 28185.00, origin: 'Débito Automático' },
  { id: '6',  date: '13/05/2026', time: '16:00', description: 'Serviço de entrega — avulso',        category: 'Vendas/Serviços',  type: 'entrada', value: 340.00,  balance: 28525.00, origin: 'PDV' },
  { id: '7',  date: '12/05/2026', time: '08:00', description: 'Pagamento salário entregadores',     category: 'Salários',         type: 'saida',   value: 8400.00, balance: 28185.00, origin: 'Folha de Pagamento' },
  { id: '8',  date: '12/05/2026', time: '10:15', description: 'Transferência Nubank → Caixa',       category: 'Transferência',    type: 'entrada', value: 5000.00, balance: 36585.00, origin: 'Transferência Interna' },
  { id: '9',  date: '12/05/2026', time: '10:15', description: 'Transferência Caixa → Nubank',       category: 'Transferência',    type: 'saida',   value: 5000.00, balance: 31585.00, origin: 'Transferência Interna' },
  { id: '10', date: '10/05/2026', time: '09:00', description: 'SIMPLES Nacional — Maio/2026',       category: 'Impostos',         type: 'saida',   value: 1240.00, balance: 31585.00, origin: 'Guia Federal' },
  { id: '11', date: '10/05/2026', time: '11:30', description: 'Recebimento AgroFresh (parcela 2)',  category: 'Recebimento PIX',  type: 'entrada', value: 900.00,  balance: 32825.00, origin: 'Contas a Receber' },
  { id: '12', date: '09/05/2026', time: '13:00', description: 'Manutenção veículo VAN-001',         category: 'Operacional',      type: 'saida',   value: 680.00,  balance: 31925.00, origin: 'Despesa Direta' },
  { id: '13', date: '09/05/2026', time: '14:45', description: 'Receita serviços quinzena 1',        category: 'Vendas/Serviços',  type: 'entrada', value: 6200.00, balance: 38125.00, origin: 'Faturamento' },
  { id: '14', date: '08/05/2026', time: '08:30', description: 'Pagamento TechServ Sistemas',        category: 'Operacional',      type: 'saida',   value: 350.00,  balance: 31925.00, origin: 'Contas a Pagar' },
  { id: '15', date: '08/05/2026', time: '17:00', description: 'Recebimento Farmácia Saúde Total',   category: 'Recebimento PIX',  type: 'entrada', value: 1400.00, balance: 34475.00, origin: 'Contas a Receber' },
  { id: '16', date: '07/05/2026', time: '09:10', description: 'Aluguel sede operacional',           category: 'Operacional',      type: 'saida',   value: 3200.00, balance: 33075.00, origin: 'Contrato' },
  { id: '17', date: '07/05/2026', time: '11:00', description: 'Vendas serviços — Maio quinzena 1',  category: 'Vendas/Serviços',  type: 'entrada', value: 2850.00, balance: 36275.00, origin: 'Faturamento' },
  { id: '18', date: '06/05/2026', time: '14:00', description: 'Fornecedor Clean Max',               category: 'Fornecedores',     type: 'saida',   value: 290.00,  balance: 33425.00, origin: 'Contas a Pagar' },
  { id: '19', date: '05/05/2026', time: '08:00', description: 'Vale transporte entregadores',       category: 'Salários',         type: 'saida',   value: 840.00,  balance: 33715.00, origin: 'Folha de Pagamento' },
  { id: '20', date: '05/05/2026', time: '16:30', description: 'Saldo inicial — Maio/2026',          category: 'Outros',           type: 'entrada', value: 24800.00,balance: 24800.00, origin: 'Abertura de Caixa' },
];

const PERIOD_OPTIONS = [
  { key: 'today',      label: 'Hoje' },
  { key: 'week',       label: 'Esta Semana' },
  { key: 'month',      label: 'Este Mês' },
  { key: 'last_month', label: 'Mês Anterior' },
] as const;
type PeriodKey = typeof PERIOD_OPTIONS[number]['key'];

const FILTER_TABS: { key: 'all' | MovType; label: string }[] = [
  { key: 'all',     label: 'Todos' },
  { key: 'entrada', label: 'Entradas' },
  { key: 'saida',   label: 'Saídas' },
];

function CategoryBadge({ category }: { category: string }) {
  const cls = CATEGORY_COLOR[category] ?? CATEGORY_COLOR['Outros'];
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap', cls)}>
      {category}
    </span>
  );
}

export function CaixaPage() {
  const [typeFilter, setTypeFilter] = useState<'all' | MovType>('all');
  const [period, setPeriod] = useState<PeriodKey>('month');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => MOCK_MOVEMENTS.filter((m) => {
    const matchType = typeFilter === 'all' || m.type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || m.description.toLowerCase().includes(q) || m.category.toLowerCase().includes(q);
    return matchType && matchSearch;
  }), [typeFilter, search]);

  const counts = useMemo(() => ({
    all:     MOCK_MOVEMENTS.length,
    entrada: MOCK_MOVEMENTS.filter((m) => m.type === 'entrada').length,
    saida:   MOCK_MOVEMENTS.filter((m) => m.type === 'saida').length,
  }), []);

  const kpis = useMemo(() => {
    const entradas = MOCK_MOVEMENTS.filter((m) => m.type === 'entrada').reduce((s, m) => s + m.value, 0);
    const saidas   = MOCK_MOVEMENTS.filter((m) => m.type === 'saida').reduce((s, m) => s + m.value, 0);
    const saldo    = MOCK_MOVEMENTS[0].balance;
    const previsto = saldo + 7400.00;
    return { entradas, saidas, saldo, previsto };
  }, []);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Caixa</h1>
          <p className="text-muted-foreground">Controle de entradas e saídas do fluxo de caixa</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-md shadow-gold-500/20">
          <Plus className="h-4 w-4" />
          Novo Lançamento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><Wallet className="h-5 w-5 text-gold-400" /></div>
            <div>
              <p className="text-xl font-bold">{fmt(kpis.saldo)}</p>
              <p className="text-xs text-muted-foreground">Saldo Atual</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><ArrowUpCircle className="h-5 w-5 text-green-400" /></div>
            <div>
              <p className="text-xl font-bold text-green-400">{fmt(kpis.entradas)}</p>
              <p className="text-xs text-muted-foreground">Total Entradas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10"><ArrowDownCircle className="h-5 w-5 text-red-400" /></div>
            <div>
              <p className="text-xl font-bold text-red-400">{fmt(kpis.saidas)}</p>
              <p className="text-xs text-muted-foreground">Total Saídas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><TrendingUp className="h-5 w-5 text-blue-400" /></div>
            <div>
              <p className="text-xl font-bold text-blue-400">{fmt(kpis.previsto)}</p>
              <p className="text-xs text-muted-foreground">Saldo Previsto</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Repeat2 className="h-4 w-4 text-gold-500" />
              Movimentações
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PeriodKey)}
                  className="pl-8 pr-7 py-1.5 text-xs rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none text-muted-foreground"
                >
                  {PERIOD_OPTIONS.map((p) => (
                    <option key={p.key} value={p.key}>{p.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar descrição..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-52"
                />
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border bg-muted hover:bg-accent transition-colors text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                Exportar
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setTypeFilter(tab.key)}
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-medium transition-all',
                  typeFilter === tab.key
                    ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {tab.label}
                <span className={cn(
                  'ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full',
                  typeFilter === tab.key ? 'bg-gold-500/20 text-gold-400' : 'bg-muted text-muted-foreground'
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
                <col style={{ width: '10%' }} />
                <col style={{ width: '26%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '8%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Data</th>
                  <th className="px-4 py-2.5 text-left">Descrição</th>
                  <th className="px-4 py-2.5 text-left">Categoria</th>
                  <th className="px-4 py-2.5 text-center">Tipo</th>
                  <th className="px-4 py-2.5 text-right">Valor</th>
                  <th className="px-4 py-2.5 text-right">Saldo</th>
                  <th className="px-4 py-2.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      <Wallet className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhuma movimentação encontrada</p>
                    </td>
                  </tr>
                ) : filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-gold-500/5 transition-colors group">
                    {/* Data */}
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium">{m.date}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        {m.time}
                      </p>
                    </td>

                    {/* Descrição */}
                    <td className="px-4 py-3">
                      <p className="font-medium truncate">{m.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{m.origin}</p>
                    </td>

                    {/* Categoria */}
                    <td className="px-4 py-3">
                      <CategoryBadge category={m.category} />
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-3 text-center">
                      {m.type === 'entrada'
                        ? <ArrowUpCircle className="h-4 w-4 text-green-400 mx-auto" />
                        : <ArrowDownCircle className="h-4 w-4 text-red-400 mx-auto" />
                      }
                    </td>

                    {/* Valor */}
                    <td className="px-4 py-3 text-right">
                      <span className={cn('text-sm font-bold',
                        m.type === 'entrada' ? 'text-green-400' : 'text-red-400'
                      )}>
                        {m.type === 'entrada' ? '+' : '-'}{fmt(m.value)}
                      </span>
                    </td>

                    {/* Saldo */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-semibold">{fmt(m.balance)}</span>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-md hover:bg-gold-500/10 text-muted-foreground hover:text-gold-400 transition-colors" title="Editar">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors" title="Ver detalhes">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rodapé */}
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Entradas</p>
              <p className="text-sm font-bold text-green-400 mt-0.5">
                +{fmt(filtered.filter((m) => m.type === 'entrada').reduce((s, m) => s + m.value, 0))}
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Saídas</p>
              <p className="text-sm font-bold text-red-400 mt-0.5">
                -{fmt(filtered.filter((m) => m.type === 'saida').reduce((s, m) => s + m.value, 0))}
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Saldo do período</p>
              <p className={cn('text-sm font-bold mt-0.5', kpis.entradas - kpis.saidas >= 0 ? 'text-green-400' : 'text-red-400')}>
                {fmt(
                  filtered.filter((m) => m.type === 'entrada').reduce((s, m) => s + m.value, 0) -
                  filtered.filter((m) => m.type === 'saida').reduce((s, m) => s + m.value, 0)
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
