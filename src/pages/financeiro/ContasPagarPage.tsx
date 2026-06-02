import { useState, useMemo } from 'react';
import {
  TrendingDown, Plus, Search, Eye, Edit, CheckCircle2,
  XCircle, Clock, AlertCircle, ChevronDown, Filter,
  DollarSign, CalendarDays, Ban, ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type PayableStatus = 'pending' | 'overdue' | 'paid' | 'scheduled' | 'cancelled';
type PaymentMethod = 'pix' | 'boleto' | 'cartao' | 'dinheiro' | 'transferencia';

interface Payable {
  id: string;
  code: string;
  supplier: string;
  description: string;
  category: string;
  value: number;
  dueDate: string;
  paymentDate: string | null;
  status: PayableStatus;
  method: PaymentMethod | null;
  installment: string | null;
}

const STATUS_CONFIG: Record<PayableStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:   { label: 'Pendente',    color: 'text-yellow-400',       bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  overdue:   { label: 'Vencido',     color: 'text-red-400',          bg: 'bg-red-500/10 border-red-500/20',       icon: AlertCircle },
  paid:      { label: 'Pago',        color: 'text-green-400',        bg: 'bg-green-500/10 border-green-500/20',   icon: CheckCircle2 },
  scheduled: { label: 'Agendado',    color: 'text-blue-400',         bg: 'bg-blue-500/10 border-blue-500/20',     icon: ArrowDownRight },
  cancelled: { label: 'Cancelado',   color: 'text-muted-foreground', bg: 'bg-muted/50 border-border',             icon: Ban },
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  pix:          'PIX',
  boleto:       'Boleto',
  cartao:       'Cartão',
  dinheiro:     'Dinheiro',
  transferencia:'Transferência',
};

const CATEGORY_COLORS: Record<string, string> = {
  'Combustível':   'text-orange-400',
  'Fornecedor':    'text-blue-400',
  'Manutenção':    'text-red-400',
  'Tecnologia':    'text-purple-400',
  'Salários':      'text-gold-400',
  'Embalagens':    'text-cyan-400',
  'Aluguel':       'text-pink-400',
  'Serviços':      'text-green-400',
  'Impostos':      'text-yellow-400',
};

const MOCK_PAYABLES: Payable[] = [
  { id: '1',  code: '#PAG-001', supplier: 'Posto Veloz Combustíveis', description: 'Abastecimento frota — Abril/2026',     category: 'Combustível', value: 5400.00, dueDate: '05/05/2026', paymentDate: '04/05/2026', status: 'paid',      method: 'pix',          installment: null },
  { id: '2',  code: '#PAG-002', supplier: 'Distribuidora FoodMax',    description: 'Nota fiscal NF-001234',               category: 'Fornecedor',  value: 2800.00, dueDate: '10/05/2026', paymentDate: '10/05/2026', status: 'paid',      method: 'boleto',       installment: null },
  { id: '3',  code: '#PAG-003', supplier: 'MotoBike Peças & Serviços', description: 'Revisão frota — Abril/2026',         category: 'Manutenção',  value: 1240.00, dueDate: '15/05/2026', paymentDate: null,        status: 'pending',   method: null,           installment: null },
  { id: '4',  code: '#PAG-004', supplier: 'TechSupply Sistemas',       description: 'Licença software — Maio/2026',       category: 'Tecnologia',  value: 890.00,  dueDate: '15/05/2026', paymentDate: '14/05/2026', status: 'paid',      method: 'pix',          installment: null },
  { id: '5',  code: '#PAG-005', supplier: 'Folha de Pagamento',        description: 'Salários equipe — Maio/2026',        category: 'Salários',    value: 18600.00, dueDate: '05/05/2026', paymentDate: '05/05/2026', status: 'paid',     method: 'transferencia', installment: null },
  { id: '6',  code: '#PAG-006', supplier: 'PackBrasil Embalagens',     description: 'Pedido #PED-4421',                   category: 'Embalagens',  value: 3200.00, dueDate: '20/05/2026', paymentDate: null,        status: 'scheduled', method: 'boleto',       installment: null },
  { id: '7',  code: '#PAG-007', supplier: 'Imóvel Comercial SP',       description: 'Aluguel galpão — Maio/2026',         category: 'Aluguel',     value: 4500.00, dueDate: '10/05/2026', paymentDate: '10/05/2026', status: 'paid',      method: 'transferencia', installment: null },
  { id: '8',  code: '#PAG-008', supplier: 'Contabilidade Expertise',   description: 'Honorários — Abril/2026',            category: 'Serviços',    value: 1200.00, dueDate: '30/04/2026', paymentDate: null,        status: 'overdue',   method: null,           installment: null },
  { id: '9',  code: '#PAG-009', supplier: 'Receita Federal',           description: 'DAS Simples Nacional — Abr/2026',   category: 'Impostos',    value: 2340.00, dueDate: '20/04/2026', paymentDate: null,        status: 'overdue',   method: null,           installment: null },
  { id: '10', code: '#PAG-010', supplier: 'Posto Veloz Combustíveis',  description: 'Abastecimento frota — Maio/2026',    category: 'Combustível', value: 5800.00, dueDate: '05/06/2026', paymentDate: null,        status: 'scheduled', method: null,           installment: null },
  { id: '11', code: '#PAG-011', supplier: 'AgroFresh Alimentos',       description: 'Nota fiscal NF-005678',              category: 'Fornecedor',  value: 4100.00, dueDate: '21/05/2026', paymentDate: null,        status: 'pending',   method: null,           installment: null },
  { id: '12', code: '#PAG-012', supplier: 'CleanPro Produtos',         description: 'Produtos limpeza — Maio/2026',       category: 'Fornecedor',  value: 680.00,  dueDate: '25/05/2026', paymentDate: null,        status: 'pending',   method: null,           installment: null },
  { id: '13', code: '#PAG-013', supplier: 'AutoCar Manutenção',        description: 'Revisão veículo PLG-4521 — 1/2',    category: 'Manutenção',  value: 760.00,  dueDate: '15/05/2026', paymentDate: null,        status: 'pending',   method: null,           installment: '1/2' },
  { id: '14', code: '#PAG-014', supplier: 'AutoCar Manutenção',        description: 'Revisão veículo PLG-4521 — 2/2',    category: 'Manutenção',  value: 760.00,  dueDate: '15/06/2026', paymentDate: null,        status: 'scheduled', method: null,           installment: '2/2' },
  { id: '15', code: '#PAG-015', supplier: 'Contabilidade Expertise',   description: 'Honorários — Maio/2026',             category: 'Serviços',    value: 1200.00, dueDate: '31/05/2026', paymentDate: null,        status: 'pending',   method: null,           installment: null },
  { id: '16', code: '#PAG-016', supplier: 'Receita Federal',           description: 'DAS Simples Nacional — Mai/2026',   category: 'Impostos',    value: 2490.00, dueDate: '20/05/2026', paymentDate: null,        status: 'pending',   method: null,           installment: null },
  { id: '17', code: '#PAG-017', supplier: 'Folha de Pagamento',        description: 'Adiantamento salarial — Maio',      category: 'Salários',    value: 9300.00, dueDate: '20/05/2026', paymentDate: null,        status: 'scheduled', method: 'transferencia', installment: null },
  { id: '18', code: '#PAG-018', supplier: 'Internet Fiber Corp',       description: 'Serviço de internet — Mai/2026',    category: 'Serviços',    value: 380.00,  dueDate: '10/05/2026', paymentDate: '10/05/2026', status: 'paid',      method: 'debito_auto',  installment: null } as unknown as Payable,
];

const PERIOD_OPTIONS = [
  { key: 'all',        label: 'Todos' },
  { key: 'this_month', label: 'Este Mês' },
  { key: 'overdue',    label: 'Vencidos' },
  { key: 'next_7',     label: 'Próx. 7 dias' },
] as const;

type PeriodKey = typeof PERIOD_OPTIONS[number]['key'];

const FILTER_TABS: { key: 'all' | PayableStatus; label: string }[] = [
  { key: 'all',       label: 'Todos' },
  { key: 'pending',   label: 'Pendente' },
  { key: 'overdue',   label: 'Vencido' },
  { key: 'scheduled', label: 'Agendado' },
  { key: 'paid',      label: 'Pago' },
  { key: 'cancelled', label: 'Cancelado' },
];

function StatusBadge({ status }: { status: PayableStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

export function ContasPagarPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | PayableStatus>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodKey>('this_month');
  const [search, setSearch] = useState('');

  const data = MOCK_PAYABLES.filter((p) => p.status !== undefined) as Payable[];

  const filtered = useMemo(() => data.filter((p) => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.supplier.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }), [statusFilter, search]);

  const counts = useMemo(() => ({
    all:       data.length,
    pending:   data.filter((p) => p.status === 'pending').length,
    overdue:   data.filter((p) => p.status === 'overdue').length,
    scheduled: data.filter((p) => p.status === 'scheduled').length,
    paid:      data.filter((p) => p.status === 'paid').length,
    cancelled: data.filter((p) => p.status === 'cancelled').length,
  }), []);

  const kpis = useMemo(() => {
    const pending = data.filter((p) => p.status === 'pending').reduce((s, p) => s + p.value, 0);
    const overdue = data.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.value, 0);
    const paid    = data.filter((p) => p.status === 'paid').reduce((s, p) => s + p.value, 0);
    const total   = data.filter((p) => p.status !== 'cancelled').reduce((s, p) => s + p.value, 0);
    return { pending, overdue, paid, total };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contas a Pagar</h1>
          <p className="text-muted-foreground">Controle de pagamentos, despesas e obrigações</p>
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
            <div className="p-2 rounded-lg bg-gold-500/10"><DollarSign className="h-5 w-5 text-gold-400" /></div>
            <div>
              <p className="text-xl font-bold">{kpis.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="text-xs text-muted-foreground">Total Lançado</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10"><Clock className="h-5 w-5 text-yellow-400" /></div>
            <div>
              <p className="text-xl font-bold">{kpis.pending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="text-xs text-muted-foreground">A Pagar</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10"><AlertCircle className="h-5 w-5 text-red-400" /></div>
            <div>
              <p className="text-xl font-bold text-red-400">{kpis.overdue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="text-xs text-muted-foreground">Vencidos</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
            <div>
              <p className="text-xl font-bold text-green-400">{kpis.paid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="text-xs text-muted-foreground">Pago no Mês</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-gold-500" />
              Lançamentos
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={periodFilter}
                  onChange={(e) => setPeriodFilter(e.target.value as PeriodKey)}
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
                  placeholder="Buscar fornecedor ou código..."
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

          <div className="flex items-center gap-1 mt-2 flex-wrap">
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
                <span className={cn(
                  'ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full',
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
                <col style={{ width: '10%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Código</th>
                  <th className="px-4 py-2.5 text-left">Fornecedor / Beneficiário</th>
                  <th className="px-4 py-2.5 text-left">Descrição</th>
                  <th className="px-4 py-2.5 text-left">Categoria</th>
                  <th className="px-4 py-2.5 text-right">Valor</th>
                  <th className="px-4 py-2.5 text-center">Vencimento</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      <TrendingDown className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhum lançamento encontrado</p>
                    </td>
                  </tr>
                ) : filtered.map((p) => (
                  <tr key={p.id} className={cn(
                    'hover:bg-gold-500/5 transition-colors group',
                    p.status === 'overdue' && 'bg-red-500/3'
                  )}>
                    {/* Código */}
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-gold-500">{p.code}</p>
                      {p.installment && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">Parcela {p.installment}</p>
                      )}
                    </td>

                    {/* Fornecedor */}
                    <td className="px-4 py-3">
                      <p className="font-medium truncate">{p.supplier}</p>
                      {p.method && (
                        <p className="text-[10px] text-green-400 mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {METHOD_LABELS[p.method as PaymentMethod] ?? p.method} · {p.paymentDate}
                        </p>
                      )}
                    </td>

                    {/* Descrição */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground truncate">{p.description}</p>
                    </td>

                    {/* Categoria */}
                    <td className="px-4 py-3">
                      <span className={cn('text-xs font-medium', CATEGORY_COLORS[p.category] ?? 'text-muted-foreground')}>
                        {p.category}
                      </span>
                    </td>

                    {/* Valor */}
                    <td className="px-4 py-3 text-right">
                      <p className={cn('text-sm font-bold',
                        p.status === 'overdue' ? 'text-red-400' :
                        p.status === 'paid'    ? 'text-muted-foreground line-through' : ''
                      )}>
                        {p.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </td>

                    {/* Vencimento */}
                    <td className="px-4 py-3 text-center">
                      <p className={cn('text-xs font-medium',
                        p.status === 'overdue' ? 'text-red-400' :
                        p.status === 'scheduled' ? 'text-blue-400' : 'text-muted-foreground'
                      )}>
                        {p.dueDate}
                      </p>
                      {p.status === 'overdue' && (
                        <p className="text-[10px] text-red-400/70 mt-0.5">Em atraso</p>
                      )}
                      {p.status === 'scheduled' && (
                        <p className="text-[10px] text-blue-400/70 mt-0.5">Agendado</p>
                      )}
                    </td>

                    {/* Status + ações */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <StatusBadge status={p.status} />
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button className="p-1 rounded-md hover:bg-green-500/10 text-muted-foreground hover:text-green-400 transition-colors" title="Registrar pagamento">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1 rounded-md hover:bg-gold-500/10 text-muted-foreground hover:text-gold-400 transition-colors" title="Editar">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors" title="Ver detalhes">
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

          {/* Rodapé com totais */}
          <div className="grid grid-cols-4 divide-x divide-border border-t border-border">
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Total filtrado</p>
              <p className="text-sm font-bold mt-0.5">
                {filtered.reduce((s, p) => s + p.value, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Pendente</p>
              <p className="text-sm font-bold text-yellow-400 mt-0.5">
                {filtered.filter((p) => p.status === 'pending').reduce((s, p) => s + p.value, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Vencido</p>
              <p className="text-sm font-bold text-red-400 mt-0.5">
                {filtered.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.value, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Pago</p>
              <p className="text-sm font-bold text-green-400 mt-0.5">
                {filtered.filter((p) => p.status === 'paid').reduce((s, p) => s + p.value, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
