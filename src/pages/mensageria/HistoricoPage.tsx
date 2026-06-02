import { useState, useMemo } from 'react';
import {
  History, Search, Eye, RefreshCw, CheckCheck, Check,
  Clock, AlertCircle, XCircle, Filter, ChevronDown,
  CalendarDays, MessageSquare, TrendingUp, Percent, Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MsgStatus   = 'entregue' | 'lido' | 'enviado' | 'falhou' | 'pendente';
type MsgType     = 'notificacao' | 'confirmacao' | 'cobranca' | 'marketing' | 'suporte' | 'manual';

interface HistoryMsg {
  id: string;
  sentAt: string;
  recipient: string;
  phone: string;
  type: MsgType;
  template: string | null;
  preview: string;
  status: MsgStatus;
  channel: 'whatsapp';
  readAt: string | null;
}

const STATUS_CONFIG: Record<MsgStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  lido:     { label: 'Lido',      color: 'text-blue-400',         bg: 'bg-blue-500/10 border-blue-500/20',     icon: CheckCheck },
  entregue: { label: 'Entregue',  color: 'text-green-400',        bg: 'bg-green-500/10 border-green-500/20',   icon: CheckCheck },
  enviado:  { label: 'Enviado',   color: 'text-muted-foreground', bg: 'bg-muted/50 border-border',             icon: Check },
  falhou:   { label: 'Falhou',    color: 'text-red-400',          bg: 'bg-red-500/10 border-red-500/20',       icon: XCircle },
  pendente: { label: 'Pendente',  color: 'text-yellow-400',       bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
};

const TYPE_CONFIG: Record<MsgType, { label: string; color: string; bg: string }> = {
  notificacao: { label: 'Notificação', color: 'text-blue-400',          bg: 'bg-blue-500/10 border-blue-500/20' },
  confirmacao: { label: 'Confirmação', color: 'text-green-400',         bg: 'bg-green-500/10 border-green-500/20' },
  cobranca:    { label: 'Cobrança',    color: 'text-red-400',           bg: 'bg-red-500/10 border-red-500/20' },
  marketing:   { label: 'Marketing',   color: 'text-purple-400',        bg: 'bg-purple-500/10 border-purple-500/20' },
  suporte:     { label: 'Suporte',     color: 'text-gold-400',          bg: 'bg-gold-500/10 border-gold-500/20' },
  manual:      { label: 'Manual',      color: 'text-muted-foreground',  bg: 'bg-muted/50 border-border' },
};

const MOCK_HISTORY: HistoryMsg[] = [
  { id: '1',  sentAt: '14/05/2026 09:14', recipient: 'Mercadinho do Zé',         phone: '(11) 3345-6789', type: 'notificacao', template: 'entrega_concluida',  preview: 'Entrega #ENT-001 concluída com sucesso! ✅ Cliente: Mercadinho do Zé...', status: 'lido',     channel: 'whatsapp', readAt: '09:16' },
  { id: '2',  sentAt: '14/05/2026 09:15', recipient: 'Maria Oliveira',           phone: '(11) 9 9812-3456', type: 'notificacao', template: 'entrega_saiu',      preview: 'Olá, Maria! 🚴 Sua entrega #ENT-002 saiu para entrega. Previsão: 09:15...', status: 'entregue', channel: 'whatsapp', readAt: null },
  { id: '3',  sentAt: '14/05/2026 09:20', recipient: 'Restaurante Sabor & Arte', phone: '(11) 4567-8901', type: 'confirmacao', template: 'confirmacao_pedido', preview: 'Pedido #PED-217 confirmado! ✅ Total: R$ 1.920,00 Previsão de coleta: 10h...', status: 'lido',     channel: 'whatsapp', readAt: '09:22' },
  { id: '4',  sentAt: '14/05/2026 09:02', recipient: 'Clínica Bem Estar',        phone: '(11) 4456-7890', type: 'notificacao', template: 'entrega_ausente',   preview: 'Tentamos realizar sua entrega #ENT-011 mas não encontramos ninguém...', status: 'entregue', channel: 'whatsapp', readAt: null },
  { id: '5',  sentAt: '14/05/2026 08:55', recipient: 'Farmácia Saúde Total',     phone: '(11) 3234-5678', type: 'notificacao', template: 'entrega_saiu',      preview: 'Olá! 🚴 Sua entrega #ENT-004 está a caminho. ETA: 09:55...', status: 'lido',     channel: 'whatsapp', readAt: '09:01' },
  { id: '6',  sentAt: '14/05/2026 08:30', recipient: 'Ana Costa',                phone: '(11) 9 8765-4321', type: 'cobranca',    template: 'cobranca_vencida',  preview: 'Sua fatura de R$ 520,00 está em atraso desde 15/03/2026. Regularize agora...', status: 'lido',     channel: 'whatsapp', readAt: '08:45' },
  { id: '7',  sentAt: '14/05/2026 08:18', recipient: 'Padaria Bom Pão Ltda',     phone: '(11) 3456-7890', type: 'confirmacao', template: 'confirmacao_pedido', preview: 'Pedido #PED-142 confirmado! Total: R$ 980,00. Entregas iniciam segunda...', status: 'lido',     channel: 'whatsapp', readAt: '08:20' },
  { id: '8',  sentAt: '14/05/2026 08:05', recipient: 'Padaria Bom Pão Ltda',     phone: '(11) 3456-7890', type: 'cobranca',    template: 'cobranca_vencimento',preview: 'Lembramos que sua fatura de R$ 980,00 vence em 15/05/2026...', status: 'lido',     channel: 'whatsapp', readAt: '08:07' },
  { id: '9',  sentAt: '13/05/2026 17:00', recipient: 'Farmácia Saúde Total',     phone: '(11) 3234-5678', type: 'confirmacao', template: 'confirmacao_pedido', preview: 'Recebimento de R$ 1.400,00 confirmado! Parcela 1/2 do contrato mensal...', status: 'lido',     channel: 'whatsapp', readAt: '17:05' },
  { id: '10', sentAt: '13/05/2026 15:30', recipient: 'Juliana Ferreira',         phone: '(11) 9 7654-3210', type: 'notificacao', template: 'entrega_concluida', preview: 'Entrega #ENT-007 concluída! Avalie nossa entrega: link...', status: 'lido',     channel: 'whatsapp', readAt: '15:48' },
  { id: '11', sentAt: '13/05/2026 14:00', recipient: 'AgroFresh Distribuidora',  phone: '(19) 3008-9012', type: 'cobranca',    template: 'cobranca_vencimento',preview: 'Sua fatura de R$ 900,00 vence em 15/05/2026. Parcela 2/3...', status: 'enviado',  channel: 'whatsapp', readAt: null },
  { id: '12', sentAt: '13/05/2026 09:45', recipient: 'Ricardo Alves',            phone: '(11) 9 6543-2109', type: 'notificacao', template: 'entrega_saiu',      preview: 'Sua entrega #ENT-006 saiu para entrega. ETA 07:50...', status: 'lido',     channel: 'whatsapp', readAt: '09:52' },
  { id: '13', sentAt: '13/05/2026 09:00', recipient: 'Camila Torres',            phone: '(11) 9 5432-1098', type: 'cobranca',    template: 'cobranca_vencida',   preview: 'Sua fatura de R$ 210,00 está em atraso. Regularize para evitar suspensão...', status: 'falhou',   channel: 'whatsapp', readAt: null },
  { id: '14', sentAt: '13/05/2026 08:10', recipient: 'Larissa Campos',           phone: '(11) 9 4567-8901', type: 'notificacao', template: 'entrega_concluida',  preview: 'Entrega #ENT-011 concluída! Obrigado pela preferência...', status: 'entregue', channel: 'whatsapp', readAt: null },
  { id: '15', sentAt: '13/05/2026 07:30', recipient: 'Juliana Ferreira',         phone: '(11) 9 7654-3210', type: 'notificacao', template: 'entrega_saiu',       preview: 'Sua entrega #ENT-007 saiu para entrega. Previsão: 08:00...', status: 'lido',     channel: 'whatsapp', readAt: '07:35' },
  { id: '16', sentAt: '12/05/2026 16:00', recipient: 'Mercadinho do Zé',         phone: '(11) 3345-6789', type: 'marketing',   template: 'boas_vindas_cliente', preview: 'Bem-vindo ao novo ciclo de contratos! Prezado parceiro...', status: 'lido',     channel: 'whatsapp', readAt: '16:20' },
  { id: '17', sentAt: '12/05/2026 10:00', recipient: 'Bruno Nascimento',         phone: '(11) 9 4321-0987', type: 'manual',      template: null,                  preview: 'Olá Bruno! Seu pedido foi cancelado a seu pedido. Qualquer dúvida...', status: 'entregue', channel: 'whatsapp', readAt: null },
  { id: '18', sentAt: '12/05/2026 09:30', recipient: 'Pedro Mendonça',           phone: '(11) 9 9234-5678', type: 'notificacao', template: 'entrega_saiu',        preview: 'Sua entrega #ENT-003 está agendada. Aguardando entregador...', status: 'falhou',   channel: 'whatsapp', readAt: null },
];

const PERIOD_OPTIONS = [
  { key: 'today',      label: 'Hoje' },
  { key: 'yesterday',  label: 'Ontem' },
  { key: 'week',       label: 'Esta Semana' },
  { key: 'month',      label: 'Este Mês' },
] as const;
type PeriodKey = typeof PERIOD_OPTIONS[number]['key'];

const FILTER_TABS: { key: 'all' | MsgStatus; label: string }[] = [
  { key: 'all',      label: 'Todas' },
  { key: 'lido',     label: 'Lido' },
  { key: 'entregue', label: 'Entregue' },
  { key: 'enviado',  label: 'Enviado' },
  { key: 'falhou',   label: 'Falhou' },
  { key: 'pendente', label: 'Pendente' },
];

function StatusBadge({ status }: { status: MsgStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: MsgType }) {
  const cfg = TYPE_CONFIG[type];
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      {cfg.label}
    </span>
  );
}

export function HistoricoPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | MsgStatus>('all');
  const [typeFilter, setTypeFilter] = useState<MsgType | 'all'>('all');
  const [period, setPeriod] = useState<PeriodKey>('today');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => MOCK_HISTORY.filter((m) => {
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchType   = typeFilter === 'all' || m.type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || m.recipient.toLowerCase().includes(q) || m.phone.includes(q) || (m.template ?? '').toLowerCase().includes(q);
    return matchStatus && matchType && matchSearch;
  }), [statusFilter, typeFilter, search]);

  const counts = useMemo(() => ({
    all:      MOCK_HISTORY.length,
    lido:     MOCK_HISTORY.filter((m) => m.status === 'lido').length,
    entregue: MOCK_HISTORY.filter((m) => m.status === 'entregue').length,
    enviado:  MOCK_HISTORY.filter((m) => m.status === 'enviado').length,
    falhou:   MOCK_HISTORY.filter((m) => m.status === 'falhou').length,
    pendente: MOCK_HISTORY.filter((m) => m.status === 'pendente').length,
  }), []);

  const deliveryRate = Math.round(((counts.lido + counts.entregue) / (MOCK_HISTORY.length - counts.pendente)) * 100);
  const readRate     = Math.round((counts.lido / (counts.lido + counts.entregue)) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Histórico de Mensagens</h1>
          <p className="text-muted-foreground">Registro completo de todas as mensagens enviadas</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground transition-colors">
          <Filter className="h-4 w-4" />
          Exportar CSV
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><Send className="h-5 w-5 text-gold-400" /></div>
            <div><p className="text-xl font-bold">{MOCK_HISTORY.length}</p><p className="text-xs text-muted-foreground">Total Enviadas</p></div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><Percent className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-xl font-bold text-green-400">{deliveryRate}%</p><p className="text-xs text-muted-foreground">Taxa de entrega</p></div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><TrendingUp className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-xl font-bold text-blue-400">{readRate}%</p><p className="text-xs text-muted-foreground">Taxa de leitura</p></div>
          </CardContent>
        </Card>
        <Card className="border-red-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10"><AlertCircle className="h-5 w-5 text-red-400" /></div>
            <div><p className="text-xl font-bold text-red-400">{counts.falhou}</p><p className="text-xs text-muted-foreground">Com falha</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4 text-gold-500" />
              Log de Mensagens
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              {/* Tipo */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as MsgType | 'all')}
                  className="pl-3 pr-7 py-1.5 text-xs rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none text-muted-foreground"
                >
                  <option value="all">Todos os tipos</option>
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>

              {/* Período */}
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as PeriodKey)}
                  className="pl-8 pr-7 py-1.5 text-xs rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none text-muted-foreground"
                >
                  {PERIOD_OPTIONS.map((p) => <option key={p.key} value={p.key}>{p.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Destinatário ou template..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-52"
                />
              </div>
              <button className="p-1.5 rounded-lg border border-border bg-muted hover:bg-accent transition-colors text-muted-foreground">
                <RefreshCw className="h-3.5 w-3.5" />
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
                <col style={{ width: '14%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '16%' }} />
                <col style={{ width: '26%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Data / Hora</th>
                  <th className="px-4 py-2.5 text-left">Destinatário</th>
                  <th className="px-4 py-2.5 text-center">Tipo</th>
                  <th className="px-4 py-2.5 text-left">Template</th>
                  <th className="px-4 py-2.5 text-left">Preview</th>
                  <th className="px-4 py-2.5 text-center">Status / Ver</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                      <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhuma mensagem encontrada</p>
                    </td>
                  </tr>
                ) : filtered.map((m) => (
                  <tr key={m.id} className={cn('hover:bg-gold-500/5 transition-colors group', m.status === 'falhou' && 'bg-red-500/3')}>
                    {/* Data */}
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium">{m.sentAt.split(' ')[0]}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{m.sentAt.split(' ')[1]}</p>
                      {m.readAt && (
                        <p className="text-[10px] text-blue-400 mt-0.5">Lido: {m.readAt}</p>
                      )}
                    </td>

                    {/* Destinatário */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm truncate">{m.recipient}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{m.phone}</p>
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-3 text-center">
                      <TypeBadge type={m.type} />
                    </td>

                    {/* Template */}
                    <td className="px-4 py-3">
                      {m.template
                        ? <p className="font-mono text-[10px] text-gold-500">{m.template}</p>
                        : <p className="text-[10px] text-muted-foreground italic">Mensagem manual</p>
                      }
                    </td>

                    {/* Preview */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground truncate">{m.preview}</p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center gap-1.5">
                        <StatusBadge status={m.status} />
                        <button className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-all">
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
          <div className="grid grid-cols-4 divide-x divide-border border-t border-border">
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Total filtrado</p>
              <p className="text-sm font-bold mt-0.5">{filtered.length}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Lidas</p>
              <p className="text-sm font-bold text-blue-400 mt-0.5">{filtered.filter((m) => m.status === 'lido').length}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Entregues</p>
              <p className="text-sm font-bold text-green-400 mt-0.5">{filtered.filter((m) => m.status === 'entregue').length}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Falhas</p>
              <p className="text-sm font-bold text-red-400 mt-0.5">{filtered.filter((m) => m.status === 'falhou').length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
