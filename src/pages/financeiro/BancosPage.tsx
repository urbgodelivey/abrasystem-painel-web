import { useState, useMemo } from 'react';
import {
  Landmark, Plus, Eye, Edit, RefreshCw, ArrowUpCircle, ArrowDownCircle,
  CheckCircle2, XCircle, Clock, CreditCard, Banknote, Search, ChevronDown, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type AccountType = 'corrente' | 'poupanca' | 'investimento' | 'pagamento';
type AccountStatus = 'ativa' | 'inativa' | 'bloqueada';
type TxnType = 'credito' | 'debito';

interface BankAccount {
  id: string;
  bank: string;
  bankColor: string;
  name: string;
  agency: string;
  account: string;
  type: AccountType;
  balance: number;
  status: AccountStatus;
  lastSync: string;
}

interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  type: TxnType;
  value: number;
}

const TYPE_LABEL: Record<AccountType, string> = {
  corrente:     'Conta Corrente',
  poupanca:     'Poupança',
  investimento: 'Investimento',
  pagamento:    'Conta Pagamento',
};

const STATUS_CONFIG: Record<AccountStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  ativa:    { label: 'Ativa',     color: 'text-green-400',        bg: 'bg-green-500/10 border-green-500/20',   icon: CheckCircle2 },
  inativa:  { label: 'Inativa',   color: 'text-muted-foreground', bg: 'bg-muted/50 border-border',             icon: XCircle },
  bloqueada:{ label: 'Bloqueada', color: 'text-red-400',          bg: 'bg-red-500/10 border-red-500/20',       icon: XCircle },
};

const MOCK_ACCOUNTS: BankAccount[] = [
  { id: '1', bank: 'Bradesco',          bankColor: 'bg-red-600',    name: 'Conta Principal',  agency: '3421-5', account: '00012345-6', type: 'corrente',     balance: 28640.00, status: 'ativa',   lastSync: '14/05/2026 08:30' },
  { id: '2', bank: 'Nubank',            bankColor: 'bg-purple-600', name: 'Conta Operacional',agency: '0001',   account: '87654321-0', type: 'pagamento',    balance: 8420.50,  status: 'ativa',   lastSync: '14/05/2026 09:15' },
  { id: '3', bank: 'Itaú',             bankColor: 'bg-blue-600',   name: 'Reserva',          agency: '0284-1', account: '00098765-3', type: 'poupanca',     balance: 15200.00, status: 'ativa',   lastSync: '14/05/2026 07:00' },
  { id: '4', bank: 'Caixa Econômica',  bankColor: 'bg-sky-600',    name: 'Fundo de Investimento', agency: '1046-0', account: '00045678-9', type: 'investimento', balance: 42800.00, status: 'ativa', lastSync: '13/05/2026 18:00' },
  { id: '5', bank: 'Sicoob',           bankColor: 'bg-green-700',  name: 'Conta Cooperativa',agency: '0072-3', account: '00011223-4', type: 'corrente',     balance: 0.00,     status: 'inativa', lastSync: '01/04/2026 00:00' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1',  accountId: '1', date: '14/05/2026', description: 'PIX Recebido — Mercadinho do Zé',      type: 'credito', value: 3840.00 },
  { id: 't2',  accountId: '1', date: '14/05/2026', description: 'Combustível Ipiranga',                  type: 'debito',  value: 420.00 },
  { id: 't3',  accountId: '1', date: '13/05/2026', description: 'DOC Embalagens Flex',                   type: 'debito',  value: 1850.00 },
  { id: 't4',  accountId: '1', date: '13/05/2026', description: 'TED Recebida — Restaurante S&A',        type: 'credito', value: 1920.00 },
  { id: 't5',  accountId: '1', date: '12/05/2026', description: 'Folha de pagamento — entregadores',     type: 'debito',  value: 8400.00 },
  { id: 't6',  accountId: '2', date: '14/05/2026', description: 'PIX Enviado — Fornecedor TechServ',     type: 'debito',  value: 350.00 },
  { id: 't7',  accountId: '2', date: '13/05/2026', description: 'PIX Recebido — Farmácia Saúde Total',   type: 'credito', value: 1400.00 },
  { id: 't8',  accountId: '2', date: '12/05/2026', description: 'Tarifa mensal Nubank',                  type: 'debito',  value: 0.00 },
  { id: 't9',  accountId: '2', date: '10/05/2026', description: 'PIX Recebido — AgroFresh parcela 2',    type: 'credito', value: 900.00 },
  { id: 't10', accountId: '3', date: '13/05/2026', description: 'Rendimento poupança Itaú',              type: 'credito', value: 36.40 },
  { id: 't11', accountId: '3', date: '05/05/2026', description: 'Depósito mensal reserva',               type: 'credito', value: 2000.00 },
  { id: 't12', accountId: '4', date: '13/05/2026', description: 'Rendimento CDB 103% CDI',               type: 'credito', value: 184.20 },
  { id: 't13', accountId: '4', date: '01/05/2026', description: 'Aplicação fundo — Maio',                type: 'credito', value: 5000.00 },
];

function StatusBadge({ status }: { status: AccountStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function BankInitials({ bank, color }: { bank: string; color: string }) {
  const initials = bank.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0', color)}>
      {initials}
    </div>
  );
}

export function BancosPage() {
  const [selectedAccount, setSelectedAccount] = useState<string>('1');
  const [search, setSearch] = useState('');

  const account = MOCK_ACCOUNTS.find((a) => a.id === selectedAccount);
  const transactions = useMemo(() => {
    const txns = MOCK_TRANSACTIONS.filter((t) => t.accountId === selectedAccount);
    const q = search.toLowerCase();
    return q ? txns.filter((t) => t.description.toLowerCase().includes(q)) : txns;
  }, [selectedAccount, search]);

  const totalBalance = MOCK_ACCOUNTS.filter((a) => a.status === 'ativa').reduce((s, a) => s + a.balance, 0);
  const totalCredits  = transactions.filter((t) => t.type === 'credito').reduce((s, t) => s + t.value, 0);
  const totalDebits   = transactions.filter((t) => t.type === 'debito').reduce((s, t) => s + t.value, 0);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bancos</h1>
          <p className="text-muted-foreground">Gerenciamento de contas bancárias e extrato</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-md shadow-gold-500/20">
          <Plus className="h-4 w-4" />
          Nova Conta
        </button>
      </div>

      {/* KPI total */}
      <Card className="border-gold-500/10 bg-gradient-to-r from-gold-500/5 to-transparent">
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gold-500/15 border border-gold-500/20">
              <Landmark className="h-6 w-6 text-gold-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Saldo Consolidado</p>
              <p className="text-3xl font-bold">{fmt(totalBalance)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{MOCK_ACCOUNTS.filter((a) => a.status === 'ativa').length} contas ativas</p>
            </div>
          </div>
          <div className="sm:ml-auto flex gap-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Maior Conta</p>
              <p className="text-sm font-bold text-gold-400 mt-0.5">
                {fmt(Math.max(...MOCK_ACCOUNTS.filter((a) => a.status === 'ativa').map((a) => a.balance)))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Contas Ativas</p>
              <p className="text-sm font-bold mt-0.5">{MOCK_ACCOUNTS.filter((a) => a.status === 'ativa').length}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Última Sincronização</p>
              <p className="text-sm font-bold mt-0.5 text-green-400">Hoje</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de contas */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Contas Cadastradas</h2>
          {MOCK_ACCOUNTS.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedAccount(acc.id)}
              className={cn(
                'w-full text-left rounded-xl border p-4 transition-all',
                selectedAccount === acc.id
                  ? 'border-gold-500/40 bg-gold-500/5 shadow-sm shadow-gold-500/10'
                  : 'border-border bg-card hover:border-gold-500/20 hover:bg-gold-500/3'
              )}
            >
              <div className="flex items-center gap-3">
                <BankInitials bank={acc.bank} color={acc.bankColor} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{acc.name}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{acc.bank} · {TYPE_LABEL[acc.type]}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Ag {acc.agency} / Cc {acc.account}</p>
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className={cn('text-lg font-bold', acc.status === 'inativa' ? 'text-muted-foreground' : '')}>
                    {fmt(acc.balance)}
                  </p>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {acc.lastSync}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <StatusBadge status={acc.status} />
                  <div className="flex gap-0.5">
                    <button className="p-1 rounded hover:bg-gold-500/10 text-muted-foreground hover:text-gold-400 transition-colors" title="Editar">
                      <Edit className="h-3 w-3" />
                    </button>
                    <button className="p-1 rounded hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors" title="Sincronizar">
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Extrato da conta selecionada */}
        <div className="lg:col-span-2">
          <Card className="border-gold-500/10 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  {account && <BankInitials bank={account.bank} color={account.bankColor} />}
                  <div>
                    <CardTitle className="text-base">{account?.name ?? '—'}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {account ? `${account.bank} · Ag ${account.agency} / Cc ${account.account}` : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar lançamento..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-48"
                    />
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border bg-muted hover:bg-accent transition-colors text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                    Extrato
                  </button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-t border-border">
                  <colgroup>
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '52%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '6%' }} />
                  </colgroup>
                  <thead>
                    <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <th className="px-4 py-2.5 text-left">Data</th>
                      <th className="px-4 py-2.5 text-left">Descrição</th>
                      <th className="px-4 py-2.5 text-center">Tipo</th>
                      <th className="px-4 py-2.5 text-right">Valor</th>
                      <th className="px-4 py-2.5 text-center">Ver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          <Banknote className="h-10 w-10 mx-auto mb-3 opacity-20" />
                          <p>Nenhum lançamento encontrado</p>
                        </td>
                      </tr>
                    ) : transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-gold-500/5 transition-colors group">
                        <td className="px-4 py-3 text-xs text-muted-foreground">{t.date}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium truncate">{t.description}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {t.type === 'credito'
                            ? <ArrowUpCircle className="h-4 w-4 text-green-400 mx-auto" />
                            : <ArrowDownCircle className="h-4 w-4 text-red-400 mx-auto" />
                          }
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn('text-sm font-bold',
                            t.type === 'credito' ? 'text-green-400' : 'text-red-400'
                          )}>
                            {t.type === 'credito' ? '+' : '-'}{fmt(t.value)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-all">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Rodapé */}
              <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                    <CreditCard className="h-3 w-3" />Saldo Atual
                  </p>
                  <p className="text-sm font-bold mt-0.5">{fmt(account?.balance ?? 0)}</p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground">Créditos</p>
                  <p className="text-sm font-bold text-green-400 mt-0.5">+{fmt(totalCredits)}</p>
                </div>
                <div className="px-4 py-3 text-center">
                  <p className="text-xs text-muted-foreground">Débitos</p>
                  <p className="text-sm font-bold text-red-400 mt-0.5">-{fmt(totalDebits)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
