import { useState, useMemo } from 'react';
import {
  TrendingUp, Plus, Search, Eye, Edit, CheckCircle2,
  XCircle, Clock, AlertCircle, ChevronDown, Filter,
  DollarSign, CalendarDays, ArrowUpRight, Ban,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ReceivableStatus = 'pending' | 'overdue' | 'paid' | 'partial' | 'cancelled';
type PaymentMethod = 'pix' | 'boleto' | 'cartao' | 'dinheiro' | 'transferencia';

interface Receivable {
  id: string;
  code: string;
  client: string;
  description: string;
  category: string;
  value: number;
  paidValue: number;
  dueDate: string;
  paymentDate: string | null;
  status: ReceivableStatus;
  method: PaymentMethod | null;
  installment: string | null;
}

const STATUS_CONFIG: Record<ReceivableStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:   { label: 'Pendente',   color: 'text-yellow-400',       bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  overdue:   { label: 'Vencido',    color: 'text-red-400',          bg: 'bg-red-500/10 border-red-500/20',       icon: AlertCircle },
  paid:      { label: 'Recebido',   color: 'text-green-400',        bg: 'bg-green-500/10 border-green-500/20',   icon: CheckCircle2 },
  partial:   { label: 'Parcial',    color: 'text-blue-400',         bg: 'bg-blue-500/10 border-blue-500/20',     icon: ArrowUpRight },
  cancelled: { label: 'Cancelado',  color: 'text-muted-foreground', bg: 'bg-muted/50 border-border',             icon: Ban },
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  pix:          'PIX',
  boleto:       'Boleto',
  cartao:       'Cartão',
  dinheiro:     'Dinheiro',
  transferencia:'Transferência',
};

const MOCK_RECEIVABLES: Receivable[] = [
  { id: '1',  code: '#REC-001', client: 'Mercadinho do Zé',        description: 'Serviços de entrega — Abril/2026',   category: 'Serviços',   value: 3840.00, paidValue: 3840.00, dueDate: '05/05/2026', paymentDate: '04/05/2026', status: 'paid',      method: 'pix',          installment: null },
  { id: '2',  code: '#REC-002', client: 'Restaurante Sabor & Arte', description: 'Entregas quinzena 1 — Maio/2026',   category: 'Serviços',   value: 1920.00, paidValue: 1920.00, dueDate: '10/05/2026', paymentDate: '09/05/2026', status: 'paid',      method: 'transferencia', installment: null },
  { id: '3',  code: '#REC-003', client: 'Farmácia Saúde Total',     description: 'Contrato mensal — Maio/2026',       category: 'Contrato',   value: 2800.00, paidValue: 1400.00, dueDate: '15/05/2026', paymentDate: null,        status: 'partial',   method: 'pix',          installment: null },
  { id: '4',  code: '#REC-004', client: 'Padaria Bom Pão Ltda',     description: 'Entregas quinzena 1 — Maio/2026',   category: 'Serviços',   value: 980.00,  paidValue: 0,       dueDate: '15/05/2026', paymentDate: null,        status: 'pending',   method: null,           installment: null },
  { id: '5',  code: '#REC-005', client: 'Açougue Carne Boa',        description: 'Serviços de entrega — Abril/2026',  category: 'Serviços',   value: 2100.00, paidValue: 0,       dueDate: '30/04/2026', paymentDate: null,        status: 'overdue',   method: null,           installment: null },
  { id: '6',  code: '#REC-006', client: 'Clínica Bem Estar',        description: 'Contrato mensal — Abril/2026',      category: 'Contrato',   value: 1500.00, paidValue: 0,       dueDate: '25/04/2026', paymentDate: null,        status: 'overdue',   method: null,           installment: null },
  { id: '7',  code: '#REC-007', client: 'Loja Fashion Mix',         description: 'Entregas quinzena 2 — Abril/2026',  category: 'Serviços',   value: 760.00,  paidValue: 760.00,  dueDate: '30/04/2026', paymentDate: '02/05/2026', status: 'paid',      method: 'boleto',       installment: null },
  { id: '8',  code: '#REC-008', client: 'Juliana Ferreira',         description: 'Fatura avulsa — Abril/2026',        category: 'Avulso',     value: 340.00,  paidValue: 340.00,  dueDate: '20/04/2026', paymentDate: '20/04/2026', status: 'paid',      method: 'pix',          installment: null },
  { id: '9',  code: '#REC-009', client: 'Maria Oliveira',           description: 'Fatura avulsa — Maio/2026',         category: 'Avulso',     value: 180.00,  paidValue: 0,       dueDate: '20/05/2026', paymentDate: null,        status: 'pending',   method: null,           installment: null },
  { id: '10', code: '#REC-010', client: 'Mercadinho do Zé',         description: 'Serviços de entrega — Maio/2026',   category: 'Serviços',   value: 4200.00, paidValue: 0,       dueDate: '20/05/2026', paymentDate: null,        status: 'pending',   method: null,           installment: null },
  { id: '11', code: '#REC-011', client: 'Restaurante Sabor & Arte', description: 'Entregas quinzena 2 — Maio/2026',   category: 'Serviços',   value: 2050.00, paidValue: 0,       dueDate: '25/05/2026', paymentDate: null,        status: 'pending',   method: null,           installment: null },
  { id: '12', code: '#REC-012', client: 'Ana Costa',                description: 'Débito em atraso — Mar/2026',       category: 'Avulso',     value: 520.00,  paidValue: 0,       dueDate: '15/03/2026', paymentDate: null,        status: 'overdue',   method: null,           installment: null },
  { id: '13', code: '#REC-013', client: 'AgroFresh (Acordo)',        description: 'Parcelamento — Parcela 2/3',        category: 'Acordo',     value: 900.00,  paidValue: 900.00,  dueDate: '10/05/2026', paymentDate: '10/05/2026', status: 'paid',      method: 'boleto',       installment: '2/3' },
  { id: '14', code: '#REC-014', client: 'Camila Torres',            description: 'Fatura avulsa — Maio/2026',         category: 'Avulso',     value: 210.00,  paidValue: 0,       dueDate: '30/05/2026', paymentDate: null,        status: 'pending',   method: null,           installment: null },
  { id: '15', code: '#REC-015', client: 'Padaria Bom Pão Ltda',     description: 'Contrato anual — cancelado',        category: 'Contrato',   value: 1200.00, paidValue: 0,       dueDate: '01/04/2026', paymentDate: null,        status: 'cancelled', method: null,           installment: null },
];

const PERIOD_OPTIONS = [
  { key: 'all',        label: 'Todos' },
  { key: 'this_month', label: 'Este Mês' },
  { key: 'overdue',    label: 'Vencidos' },
  { key: 'next_7',     label: 'Próx. 7 dias' },
] as const;

type PeriodKey = typeof PERIOD_OPTIONS[number]['key'];

const FILTER_TABS: { key: 'all' | ReceivableStatus; label: string }[] = [
  { key: 'all',       label: 'Todos' },
  { key: 'pending',   label: 'Pendente' },
  { key: 'overdue',   label: 'Vencido' },
  { key: 'partial',   label: 'Parcial' },
  { key: 'paid',      label: 'Recebido' },
  { key: 'cancelled', label: 'Cancelado' },
];

function StatusBadge({ status }: { status: ReceivableStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3 shrink-0" />
      {cfg.label}
    </span>
  );
}

function ProgressBar({ value, total }: { value: number; total: number }) {
  const pct = total > 0 ? Math.min((value / total) * 100, 100) : 0;
  return (
    <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
      <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ContasReceberPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | ReceivableStatus>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodKey>('this_month');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => MOCK_RECEIVABLES.filter((r) => {
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || r.client.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }), [statusFilter, search]);

  const counts = useMemo(() => ({
    all:       MOCK_RECEIVABLES.length,
    pending:   MOCK_RECEIVABLES.filter((r) => r.status === 'pending').length,
    overdue:   MOCK_RECEIVABLES.filter((r) => r.status === 'overdue').length,
    partial:   MOCK_RECEIVABLES.filter((r) => r.status === 'partial').length,
    paid:      MOCK_RECEIVABLES.filter((r) => r.status === 'paid').length,
    cancelled: MOCK_RECEIVABLES.filter((r) => r.status === 'cancelled').length,
  }), []);

  const kpis = useMemo(() => {
    const pending = MOCK_RECEIVABLES
      .filter((r) => r.status === 'pending' || r.status === 'partial')
      .reduce((s, r) => s + (r.value - r.paidValue), 0);
    const overdue = MOCK_RECEIVABLES
      .filter((r) => r.status === 'overdue')
      .reduce((s, r) => s + r.value, 0);
    const paid = MOCK_RECEIVABLES
      .filter((r) => r.status === 'paid' || r.status === 'partial')
      .reduce((s, r) => s + r.paidValue, 0);
    const total = MOCK_RECEIVABLES
      .filter((r) => r.status !== 'cancelled')
      .reduce((s, r) => s + r.value, 0);
    return { pending, overdue, paid, total };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contas a Receber</h1>
          <p className="text-muted-foreground">Controle de recebimentos e faturas em aberto</p>
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
              <p className="text-xs text-muted-foreground">A Receber</p>
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
              <p className="text-xs text-muted-foreground">Recebido no Mês</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gold-500" />
              Lançamentos
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              {/* Período */}
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
                  placeholder="Buscar cliente ou código..."
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
                <col style={{ width: '12%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Código</th>
                  <th className="px-4 py-2.5 text-left">Cliente</th>
                  <th className="px-4 py-2.5 text-left">Descrição</th>
                  <th className="px-4 py-2.5 text-right">Valor</th>
                  <th className="px-4 py-2.5 text-center">Vencimento</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      <TrendingUp className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhum lançamento encontrado</p>
                    </td>
                  </tr>
                ) : filtered.map((r) => (
                  <tr key={r.id} className={cn(
                    'hover:bg-gold-500/5 transition-colors group',
                    r.status === 'overdue' && 'bg-red-500/3'
                  )}>
                    {/* Código */}
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-gold-500">{r.code}</p>
                      {r.installment && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">Parcela {r.installment}</p>
                      )}
                    </td>

                    {/* Cliente */}
                    <td className="px-4 py-3">
                      <p className="font-medium truncate">{r.client}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{r.category}</p>
                    </td>

                    {/* Descrição */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground truncate">{r.description}</p>
                      {r.method && (
                        <p className="text-[10px] text-green-400 mt-0.5 flex items-center gap-1">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          {METHOD_LABELS[r.method]} · {r.paymentDate}
                        </p>
                      )}
                    </td>

                    {/* Valor */}
                    <td className="px-4 py-3 text-right">
                      <p className={cn('text-sm font-bold',
                        r.status === 'overdue' ? 'text-red-400' :
                        r.status === 'paid' ? 'text-green-400' : ''
                      )}>
                        {r.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      {r.status === 'partial' && (
                        <div>
                          <p className="text-[10px] text-green-400 mt-0.5">
                            +{r.paidValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} recebido
                          </p>
                          <ProgressBar value={r.paidValue} total={r.value} />
                        </div>
                      )}
                    </td>

                    {/* Vencimento */}
                    <td className="px-4 py-3 text-center">
                      <p className={cn('text-xs font-medium',
                        r.status === 'overdue' ? 'text-red-400' : 'text-muted-foreground'
                      )}>
                        {r.dueDate}
                      </p>
                      {r.status === 'overdue' && (
                        <p className="text-[10px] text-red-400/70 mt-0.5">Em atraso</p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={r.status} />
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-md hover:bg-green-500/10 text-muted-foreground hover:text-green-400 transition-colors" title="Registrar recebimento">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
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

          {/* Rodapé com totais */}
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Total filtrado</p>
              <p className="text-sm font-bold mt-0.5">
                {filtered.reduce((s, r) => s + r.value, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Recebido</p>
              <p className="text-sm font-bold text-green-400 mt-0.5">
                {filtered.reduce((s, r) => s + r.paidValue, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">A receber</p>
              <p className="text-sm font-bold text-yellow-400 mt-0.5">
                {filtered.reduce((s, r) => s + (r.value - r.paidValue), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
