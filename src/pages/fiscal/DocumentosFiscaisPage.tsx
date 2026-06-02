import { useState, useMemo } from 'react';
import {
  FileText, Plus, Search, Eye, Download, XCircle, CheckCircle2,
  Clock, AlertCircle, Filter, ChevronDown, CalendarDays, Ban,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type DocStatus = 'autorizado' | 'cancelado' | 'processando' | 'rejeitado' | 'contingencia';
type DocType   = 'NF-e' | 'NFS-e' | 'CT-e' | 'MDF-e';

interface FiscalDoc {
  id: string;
  number: string;
  series: string;
  type: DocType;
  recipient: string;
  recipientDoc: string;
  issuedAt: string;
  competence: string;
  value: number;
  status: DocStatus;
  chave: string;
}

const STATUS_CONFIG: Record<DocStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  autorizado:  { label: 'Autorizado',   color: 'text-green-400',        bg: 'bg-green-500/10 border-green-500/20',   icon: CheckCircle2 },
  cancelado:   { label: 'Cancelado',    color: 'text-muted-foreground', bg: 'bg-muted/50 border-border',             icon: Ban },
  processando: { label: 'Processando',  color: 'text-yellow-400',       bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  rejeitado:   { label: 'Rejeitado',    color: 'text-red-400',          bg: 'bg-red-500/10 border-red-500/20',       icon: AlertCircle },
  contingencia:{ label: 'Contingência', color: 'text-orange-400',       bg: 'bg-orange-500/10 border-orange-500/20', icon: AlertCircle },
};

const TYPE_COLOR: Record<DocType, string> = {
  'NF-e':  'text-blue-400 bg-blue-500/10 border-blue-500/20',
  'NFS-e': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  'CT-e':  'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  'MDF-e': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
};

const MOCK_DOCS: FiscalDoc[] = [
  { id: '1',  number: '000142', series: '1', type: 'NFS-e', recipient: 'Mercadinho do Zé',         recipientDoc: '12.345.678/0001-90', issuedAt: '14/05/2026', competence: 'Mai/2026', value: 3840.00,  status: 'autorizado',   chave: '35260514000000000000550010001420001142' },
  { id: '2',  number: '000141', series: '1', type: 'NFS-e', recipient: 'Restaurante Sabor & Arte',  recipientDoc: '23.456.789/0001-01', issuedAt: '13/05/2026', competence: 'Mai/2026', value: 1920.00,  status: 'autorizado',   chave: '35260513000000000000550010001410001141' },
  { id: '3',  number: '000140', series: '1', type: 'NFS-e', recipient: 'Farmácia Saúde Total',      recipientDoc: '34.567.890/0001-12', issuedAt: '10/05/2026', competence: 'Mai/2026', value: 1400.00,  status: 'autorizado',   chave: '35260510000000000000550010001400001140' },
  { id: '4',  number: '000139', series: '1', type: 'NF-e',  recipient: 'Embalagens Flex Ltda',      recipientDoc: '45.678.901/0001-23', issuedAt: '08/05/2026', competence: 'Mai/2026', value: 1850.00,  status: 'autorizado',   chave: '35260508000000000000550010001390001139' },
  { id: '5',  number: '000138', series: '1', type: 'NFS-e', recipient: 'Padaria Bom Pão Ltda',      recipientDoc: '56.789.012/0001-34', issuedAt: '05/05/2026', competence: 'Mai/2026', value: 980.00,   status: 'processando',  chave: '35260505000000000000550010001380001138' },
  { id: '6',  number: '000137', series: '1', type: 'CT-e',  recipient: 'AgroFresh Distribuidora',   recipientDoc: '67.890.123/0001-45', issuedAt: '04/05/2026', competence: 'Mai/2026', value: 640.00,   status: 'autorizado',   chave: '35260504000000000000570010001370001137' },
  { id: '7',  number: '000136', series: '1', type: 'NFS-e', recipient: 'Clínica Bem Estar',         recipientDoc: '78.901.234/0001-56', issuedAt: '30/04/2026', competence: 'Abr/2026', value: 1500.00,  status: 'cancelado',    chave: '35260430000000000000550010001360001136' },
  { id: '8',  number: '000135', series: '1', type: 'NFS-e', recipient: 'Loja Fashion Mix',          recipientDoc: '89.012.345/0001-67', issuedAt: '30/04/2026', competence: 'Abr/2026', value: 760.00,   status: 'autorizado',   chave: '35260430000000000000550010001350001135' },
  { id: '9',  number: '000134', series: '1', type: 'NF-e',  recipient: 'TechServ Sistemas',         recipientDoc: '90.123.456/0001-78', issuedAt: '28/04/2026', competence: 'Abr/2026', value: 350.00,   status: 'rejeitado',    chave: '35260428000000000000550010001340001134' },
  { id: '10', number: '000133', series: '1', type: 'NFS-e', recipient: 'Mercadinho do Zé',          recipientDoc: '12.345.678/0001-90', issuedAt: '25/04/2026', competence: 'Abr/2026', value: 3600.00,  status: 'autorizado',   chave: '35260425000000000000550010001330001133' },
  { id: '11', number: '000132', series: '1', type: 'MDF-e', recipient: 'Transportadora Norte SP',   recipientDoc: '01.234.567/0001-89', issuedAt: '20/04/2026', competence: 'Abr/2026', value: 1200.00,  status: 'autorizado',   chave: '35260420000000000000580010001320001132' },
  { id: '12', number: '000131', series: '1', type: 'NFS-e', recipient: 'Ana Costa ME',              recipientDoc: '123.456.789-00',    issuedAt: '15/04/2026', competence: 'Abr/2026', value: 340.00,   status: 'autorizado',   chave: '35260415000000000000550010001310001131' },
  { id: '13', number: '000130', series: '1', type: 'CT-e',  recipient: 'Restaurante Sabor & Arte',  recipientDoc: '23.456.789/0001-01', issuedAt: '10/04/2026', competence: 'Abr/2026', value: 480.00,   status: 'contingencia', chave: '35260410000000000000570010001300001130' },
  { id: '14', number: '000129', series: '1', type: 'NFS-e', recipient: 'Padaria Bom Pão Ltda',      recipientDoc: '56.789.012/0001-34', issuedAt: '05/04/2026', competence: 'Abr/2026', value: 860.00,   status: 'autorizado',   chave: '35260405000000000000550010001290001129' },
  { id: '15', number: '000128', series: '1', type: 'NF-e',  recipient: 'Embalagens Flex Ltda',      recipientDoc: '45.678.901/0001-23', issuedAt: '02/04/2026', competence: 'Abr/2026', value: 2200.00,  status: 'cancelado',    chave: '35260402000000000000550010001280001128' },
];

const DOC_TYPES: DocType[] = ['NF-e', 'NFS-e', 'CT-e', 'MDF-e'];

const FILTER_TABS: { key: 'all' | DocStatus; label: string }[] = [
  { key: 'all',         label: 'Todos' },
  { key: 'autorizado',  label: 'Autorizado' },
  { key: 'processando', label: 'Processando' },
  { key: 'rejeitado',   label: 'Rejeitado' },
  { key: 'contingencia',label: 'Contingência' },
  { key: 'cancelado',   label: 'Cancelado' },
];

const PERIOD_OPTIONS = [
  { key: 'this_month', label: 'Este Mês' },
  { key: 'last_month', label: 'Mês Anterior' },
  { key: 'last_3',     label: 'Últimos 3 Meses' },
  { key: 'all',        label: 'Todos' },
] as const;
type PeriodKey = typeof PERIOD_OPTIONS[number]['key'];

function StatusBadge({ status }: { status: DocStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function TypeBadge({ type }: { type: DocType }) {
  return (
    <span className={cn('inline-flex px-2 py-0.5 rounded text-[10px] font-bold border', TYPE_COLOR[type])}>
      {type}
    </span>
  );
}

export function DocumentosFiscaisPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | DocStatus>('all');
  const [typeFilter, setTypeFilter] = useState<DocType | 'all'>('all');
  const [period, setPeriod] = useState<PeriodKey>('this_month');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => MOCK_DOCS.filter((d) => {
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchType   = typeFilter === 'all' || d.type === typeFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || d.recipient.toLowerCase().includes(q) || d.number.includes(q) || d.chave.includes(q);
    return matchStatus && matchType && matchSearch;
  }), [statusFilter, typeFilter, search]);

  const counts = useMemo(() => ({
    all:          MOCK_DOCS.length,
    autorizado:   MOCK_DOCS.filter((d) => d.status === 'autorizado').length,
    processando:  MOCK_DOCS.filter((d) => d.status === 'processando').length,
    rejeitado:    MOCK_DOCS.filter((d) => d.status === 'rejeitado').length,
    contingencia: MOCK_DOCS.filter((d) => d.status === 'contingencia').length,
    cancelado:    MOCK_DOCS.filter((d) => d.status === 'cancelado').length,
  }), []);

  const kpis = useMemo(() => {
    const autorizados = MOCK_DOCS.filter((d) => d.status === 'autorizado');
    return {
      total:      MOCK_DOCS.filter((d) => d.status !== 'cancelado').reduce((s, d) => s + d.value, 0),
      authorized: autorizados.length,
      cancelled:  MOCK_DOCS.filter((d) => d.status === 'cancelado').length,
      pending:    MOCK_DOCS.filter((d) => d.status === 'processando' || d.status === 'contingencia').length,
    };
  }, []);

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documentos Fiscais</h1>
          <p className="text-muted-foreground">Emissão e controle de NF-e, NFS-e, CT-e e MDF-e</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-md shadow-gold-500/20">
          <Plus className="h-4 w-4" />
          Emitir Documento
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><FileText className="h-5 w-5 text-gold-400" /></div>
            <div>
              <p className="text-xl font-bold">{fmt(kpis.total)}</p>
              <p className="text-xs text-muted-foreground">Total Emitido</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
            <div>
              <p className="text-xl font-bold text-green-400">{kpis.authorized}</p>
              <p className="text-xs text-muted-foreground">Autorizados</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10"><Clock className="h-5 w-5 text-yellow-400" /></div>
            <div>
              <p className="text-xl font-bold text-yellow-400">{kpis.pending}</p>
              <p className="text-xs text-muted-foreground">Pendentes/Contingência</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-muted">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted"><Ban className="h-5 w-5 text-muted-foreground" /></div>
            <div>
              <p className="text-xl font-bold text-muted-foreground">{kpis.cancelled}</p>
              <p className="text-xs text-muted-foreground">Cancelados</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-gold-500" />
              Documentos Emitidos
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              {/* Tipo */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as DocType | 'all')}
                  className="pl-3 pr-7 py-1.5 text-xs rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none text-muted-foreground"
                >
                  <option value="all">Todos os tipos</option>
                  {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
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
                  placeholder="Número, destinatário..."
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
                <col style={{ width: '8%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '20%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Número</th>
                  <th className="px-4 py-2.5 text-center">Tipo</th>
                  <th className="px-4 py-2.5 text-left">Destinatário</th>
                  <th className="px-4 py-2.5 text-center">Emissão</th>
                  <th className="px-4 py-2.5 text-right">Valor</th>
                  <th className="px-4 py-2.5 text-center">Status</th>
                  <th className="px-4 py-2.5 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhum documento encontrado</p>
                    </td>
                  </tr>
                ) : filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gold-500/5 transition-colors group">
                    {/* Número */}
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-gold-500">
                        {d.series}/{d.number}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Comp.: {d.competence}
                      </p>
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-3 text-center">
                      <TypeBadge type={d.type} />
                    </td>

                    {/* Destinatário */}
                    <td className="px-4 py-3">
                      <p className="font-medium truncate">{d.recipient}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{d.recipientDoc}</p>
                    </td>

                    {/* Emissão */}
                    <td className="px-4 py-3 text-center">
                      <p className="text-xs text-muted-foreground">{d.issuedAt}</p>
                    </td>

                    {/* Valor */}
                    <td className="px-4 py-3 text-right">
                      <span className={cn('text-sm font-bold',
                        d.status === 'cancelado' ? 'text-muted-foreground line-through' :
                        d.status === 'autorizado' ? '' : 'text-yellow-400'
                      )}>
                        {fmt(d.value)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={d.status} />
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors" title="Visualizar">
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 rounded-md hover:bg-green-500/10 text-muted-foreground hover:text-green-400 transition-colors" title="Download XML">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        {d.status === 'processando' || d.status === 'contingencia' ? (
                          <button className="p-1.5 rounded-md hover:bg-yellow-500/10 text-muted-foreground hover:text-yellow-400 transition-colors" title="Reenviar">
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        {d.status === 'autorizado' ? (
                          <button className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="Cancelar">
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
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
              <p className="text-xs text-muted-foreground">Documentos filtrados</p>
              <p className="text-sm font-bold mt-0.5">{filtered.length}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Total filtrado</p>
              <p className="text-sm font-bold mt-0.5">
                {fmt(filtered.reduce((s, d) => s + (d.status !== 'cancelado' ? d.value : 0), 0))}
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Autorizados</p>
              <p className="text-sm font-bold text-green-400 mt-0.5">
                {filtered.filter((d) => d.status === 'autorizado').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
