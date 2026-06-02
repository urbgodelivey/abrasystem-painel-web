import { useState, useMemo } from 'react';
import {
  Receipt, Plus, Search, Eye, Download, XCircle, CheckCircle2,
  Clock, AlertCircle, Filter, ChevronDown, CalendarDays, Ban,
  RefreshCw, Percent, Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type NfseStatus = 'autorizada' | 'cancelada' | 'processando' | 'erro';

interface Nfse {
  id: string;
  rps: string;
  nfseNumber: string | null;
  client: string;
  clientDoc: string;
  service: string;
  issuedAt: string;
  competence: string;
  value: number;
  issRate: number;
  issValue: number;
  issRetained: boolean;
  status: NfseStatus;
  municipio: string;
}

const STATUS_CONFIG: Record<NfseStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  autorizada:  { label: 'Autorizada',  color: 'text-green-400',        bg: 'bg-green-500/10 border-green-500/20',   icon: CheckCircle2 },
  cancelada:   { label: 'Cancelada',   color: 'text-muted-foreground', bg: 'bg-muted/50 border-border',             icon: Ban },
  processando: { label: 'Processando', color: 'text-yellow-400',       bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  erro:        { label: 'Erro',        color: 'text-red-400',          bg: 'bg-red-500/10 border-red-500/20',       icon: AlertCircle },
};

const MOCK_NFSE: Nfse[] = [
  { id: '1',  rps: 'RPS-142', nfseNumber: '1842', client: 'Mercadinho do Zé',         clientDoc: '12.345.678/0001-90', service: 'Serviços de logística e entrega',  issuedAt: '14/05/2026', competence: 'Mai/2026', value: 3840.00, issRate: 2.0, issValue: 76.80,  issRetained: false, status: 'autorizada',  municipio: 'São Paulo/SP' },
  { id: '2',  rps: 'RPS-141', nfseNumber: '1841', client: 'Restaurante Sabor & Arte',  clientDoc: '23.456.789/0001-01', service: 'Serviços de logística e entrega',  issuedAt: '13/05/2026', competence: 'Mai/2026', value: 1920.00, issRate: 2.0, issValue: 38.40,  issRetained: false, status: 'autorizada',  municipio: 'São Paulo/SP' },
  { id: '3',  rps: 'RPS-140', nfseNumber: '1840', client: 'Farmácia Saúde Total',      clientDoc: '34.567.890/0001-12', service: 'Contrato de entrega — mensal',     issuedAt: '10/05/2026', competence: 'Mai/2026', value: 1400.00, issRate: 2.0, issValue: 28.00,  issRetained: true,  status: 'autorizada',  municipio: 'Guarulhos/SP' },
  { id: '4',  rps: 'RPS-139', nfseNumber: null,   client: 'Padaria Bom Pão Ltda',      clientDoc: '56.789.012/0001-34', service: 'Serviços de logística e entrega',  issuedAt: '05/05/2026', competence: 'Mai/2026', value: 980.00,  issRate: 2.0, issValue: 19.60,  issRetained: false, status: 'processando', municipio: 'São Paulo/SP' },
  { id: '5',  rps: 'RPS-138', nfseNumber: '1838', client: 'Clínica Bem Estar',         clientDoc: '78.901.234/0001-56', service: 'Contrato de entrega — mensal',     issuedAt: '30/04/2026', competence: 'Abr/2026', value: 1500.00, issRate: 2.0, issValue: 30.00,  issRetained: false, status: 'cancelada',   municipio: 'São Paulo/SP' },
  { id: '6',  rps: 'RPS-137', nfseNumber: '1837', client: 'Loja Fashion Mix',          clientDoc: '89.012.345/0001-67', service: 'Serviços de logística e entrega',  issuedAt: '30/04/2026', competence: 'Abr/2026', value: 760.00,  issRate: 2.0, issValue: 15.20,  issRetained: false, status: 'autorizada',  municipio: 'São Paulo/SP' },
  { id: '7',  rps: 'RPS-136', nfseNumber: null,   client: 'Ana Costa ME',              clientDoc: '123.456.789-00',    service: 'Serviço avulso de entrega',        issuedAt: '28/04/2026', competence: 'Abr/2026', value: 340.00,  issRate: 2.0, issValue: 6.80,   issRetained: false, status: 'erro',        municipio: 'São Paulo/SP' },
  { id: '8',  rps: 'RPS-135', nfseNumber: '1835', client: 'Mercadinho do Zé',          clientDoc: '12.345.678/0001-90', service: 'Serviços de logística e entrega',  issuedAt: '25/04/2026', competence: 'Abr/2026', value: 3600.00, issRate: 2.0, issValue: 72.00,  issRetained: true,  status: 'autorizada',  municipio: 'São Paulo/SP' },
  { id: '9',  rps: 'RPS-134', nfseNumber: '1834', client: 'Padaria Bom Pão Ltda',      clientDoc: '56.789.012/0001-34', service: 'Contrato de entrega — mensal',     issuedAt: '05/04/2026', competence: 'Abr/2026', value: 860.00,  issRate: 2.0, issValue: 17.20,  issRetained: false, status: 'autorizada',  municipio: 'São Paulo/SP' },
  { id: '10', rps: 'RPS-133', nfseNumber: '1833', client: 'Restaurante Sabor & Arte',  clientDoc: '23.456.789/0001-01', service: 'Serviços de logística e entrega',  issuedAt: '01/04/2026', competence: 'Abr/2026', value: 1840.00, issRate: 2.0, issValue: 36.80,  issRetained: false, status: 'autorizada',  municipio: 'São Paulo/SP' },
  { id: '11', rps: 'RPS-132', nfseNumber: '1832', client: 'AgroFresh Distribuidora',   clientDoc: '67.890.123/0001-45', service: 'Contrato de entrega — mensal',     issuedAt: '25/03/2026', competence: 'Mar/2026', value: 2100.00, issRate: 2.0, issValue: 42.00,  issRetained: true,  status: 'autorizada',  municipio: 'Campinas/SP' },
  { id: '12', rps: 'RPS-131', nfseNumber: '1831', client: 'Mercadinho do Zé',          clientDoc: '12.345.678/0001-90', service: 'Serviços de logística e entrega',  issuedAt: '15/03/2026', competence: 'Mar/2026', value: 3600.00, issRate: 2.0, issValue: 72.00,  issRetained: false, status: 'autorizada',  municipio: 'São Paulo/SP' },
];

const FILTER_TABS: { key: 'all' | NfseStatus; label: string }[] = [
  { key: 'all',        label: 'Todas' },
  { key: 'autorizada', label: 'Autorizada' },
  { key: 'processando',label: 'Processando' },
  { key: 'erro',       label: 'Erro' },
  { key: 'cancelada',  label: 'Cancelada' },
];

const COMPETENCE_OPTIONS = ['Mai/2026', 'Abr/2026', 'Mar/2026', 'Todos'];

function StatusBadge({ status }: { status: NfseStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export function NfsePage() {
  const [statusFilter, setStatusFilter] = useState<'all' | NfseStatus>('all');
  const [competence, setCompetence] = useState('Mai/2026');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => MOCK_NFSE.filter((n) => {
    const matchStatus = statusFilter === 'all' || n.status === statusFilter;
    const matchComp   = competence === 'Todos' || n.competence === competence;
    const q = search.toLowerCase();
    const matchSearch = !q || n.client.toLowerCase().includes(q) || n.rps.toLowerCase().includes(q) || (n.nfseNumber ?? '').includes(q);
    return matchStatus && matchComp && matchSearch;
  }), [statusFilter, competence, search]);

  const counts = useMemo(() => ({
    all:         MOCK_NFSE.length,
    autorizada:  MOCK_NFSE.filter((n) => n.status === 'autorizada').length,
    processando: MOCK_NFSE.filter((n) => n.status === 'processando').length,
    erro:        MOCK_NFSE.filter((n) => n.status === 'erro').length,
    cancelada:   MOCK_NFSE.filter((n) => n.status === 'cancelada').length,
  }), []);

  const kpis = useMemo(() => {
    const auth = MOCK_NFSE.filter((n) => n.status === 'autorizada');
    return {
      emitted:  auth.length,
      total:    auth.reduce((s, n) => s + n.value, 0),
      iss:      auth.reduce((s, n) => s + n.issValue, 0),
      retained: auth.filter((n) => n.issRetained).reduce((s, n) => s + n.issValue, 0),
    };
  }, []);

  const fmt  = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">NFS-e</h1>
          <p className="text-muted-foreground">Notas Fiscais de Serviço Eletrônicas emitidas</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-md shadow-gold-500/20">
          <Plus className="h-4 w-4" />
          Emitir NFS-e
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><Receipt className="h-5 w-5 text-gold-400" /></div>
            <div>
              <p className="text-xl font-bold">{kpis.emitted}</p>
              <p className="text-xs text-muted-foreground">Emitidas no Mês</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
            <div>
              <p className="text-xl font-bold text-green-400">{fmt(kpis.total)}</p>
              <p className="text-xs text-muted-foreground">Valor Total</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Percent className="h-5 w-5 text-blue-400" /></div>
            <div>
              <p className="text-xl font-bold text-blue-400">{fmt(kpis.iss)}</p>
              <p className="text-xs text-muted-foreground">ISS a Recolher</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-purple-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10"><Building2 className="h-5 w-5 text-purple-400" /></div>
            <div>
              <p className="text-xl font-bold text-purple-400">{fmt(kpis.retained)}</p>
              <p className="text-xs text-muted-foreground">ISS Retido na Fonte</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-gold-500" />
              Notas Emitidas
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              {/* Competência */}
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={competence}
                  onChange={(e) => setCompetence(e.target.value)}
                  className="pl-8 pr-7 py-1.5 text-xs rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none text-muted-foreground"
                >
                  {COMPETENCE_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cliente, RPS ou número..."
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
                <col style={{ width: '11%' }} />
                <col style={{ width: '22%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '11%' }} />
                <col style={{ width: '14%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">RPS / NFS-e</th>
                  <th className="px-4 py-2.5 text-left">Tomador</th>
                  <th className="px-4 py-2.5 text-left">Serviço</th>
                  <th className="px-4 py-2.5 text-center">Emissão</th>
                  <th className="px-4 py-2.5 text-right">Valor</th>
                  <th className="px-4 py-2.5 text-right">ISS</th>
                  <th className="px-4 py-2.5 text-center">Status / Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      <Receipt className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhuma NFS-e encontrada</p>
                    </td>
                  </tr>
                ) : filtered.map((n) => (
                  <tr key={n.id} className="hover:bg-gold-500/5 transition-colors group">
                    {/* RPS / NFS-e */}
                    <td className="px-4 py-3">
                      <p className="font-mono text-xs font-semibold text-gold-500">{n.rps}</p>
                      {n.nfseNumber
                        ? <p className="text-[10px] text-green-400 mt-0.5">NFS-e #{n.nfseNumber}</p>
                        : <p className="text-[10px] text-muted-foreground mt-0.5">Aguardando...</p>
                      }
                    </td>

                    {/* Tomador */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm truncate">{n.client}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{n.clientDoc}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Building2 className="h-2.5 w-2.5" />
                        {n.municipio}
                      </p>
                    </td>

                    {/* Serviço */}
                    <td className="px-4 py-3">
                      <p className="text-xs text-muted-foreground truncate">{n.service}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Comp.: {n.competence}</p>
                    </td>

                    {/* Emissão */}
                    <td className="px-4 py-3 text-center">
                      <p className="text-xs text-muted-foreground">{n.issuedAt}</p>
                    </td>

                    {/* Valor */}
                    <td className="px-4 py-3 text-right">
                      <span className={cn('text-sm font-bold',
                        n.status === 'cancelada' ? 'text-muted-foreground line-through' : ''
                      )}>
                        {fmt(n.value)}
                      </span>
                    </td>

                    {/* ISS */}
                    <td className="px-4 py-3 text-right">
                      <p className="text-xs font-semibold text-blue-400">{fmt(n.issValue)}</p>
                      <p className={cn('text-[10px] mt-0.5',
                        n.issRetained ? 'text-purple-400' : 'text-muted-foreground'
                      )}>
                        {n.issRetained ? 'Retido' : `${n.issRate}%`}
                      </p>
                    </td>

                    {/* Status / Ações */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-center gap-1.5">
                        <StatusBadge status={n.status} />
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 rounded hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors" title="Visualizar">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          {n.nfseNumber && (
                            <button className="p-1 rounded hover:bg-green-500/10 text-muted-foreground hover:text-green-400 transition-colors" title="Download PDF">
                              <Download className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {n.status === 'erro' && (
                            <button className="p-1 rounded hover:bg-yellow-500/10 text-muted-foreground hover:text-yellow-400 transition-colors" title="Reenviar">
                              <RefreshCw className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {n.status === 'autorizada' && (
                            <button className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="Cancelar">
                              <XCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
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
              <p className="text-xs text-muted-foreground">Notas filtradas</p>
              <p className="text-sm font-bold mt-0.5">{filtered.length}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-bold mt-0.5">
                {fmt(filtered.filter((n) => n.status !== 'cancelada').reduce((s, n) => s + n.value, 0))}
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">ISS Total</p>
              <p className="text-sm font-bold text-blue-400 mt-0.5">
                {fmt(filtered.filter((n) => n.status !== 'cancelada').reduce((s, n) => s + n.issValue, 0))}
              </p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">ISS Retido</p>
              <p className="text-sm font-bold text-purple-400 mt-0.5">
                {fmt(filtered.filter((n) => n.issRetained && n.status !== 'cancelada').reduce((s, n) => s + n.issValue, 0))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
