import { useState, useMemo, useCallback } from 'react';
import {
  Bike, Search, Filter, Eye, Phone,
  CheckCircle2, XCircle, Clock, ChevronDown,
  DollarSign, CalendarDays, Send, MessageCircle,
  X, Loader2, Landmark, Check, AlertCircle, ArrowUpRight, Download,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type PaymentStatus = 'pending' | 'paid';
type VehicleType = 'moto' | 'bike' | 'carro' | 'van';

interface MotoboyPayment {
  id: string;
  name: string;
  phone: string;
  vehicle: VehicleType;
  pixKey: string;
  pixType: 'CPF' | 'CNPJ' | 'Celular' | 'Chave Aleatória';
  bankName: string;
  tripsCount: number;
  baseRate: number;
  bonusValue: number;
  totalValue: number;
  status: PaymentStatus;
  paymentDate: string | null;
}

interface DeliveryDetail {
  id: string;
  code: string;
  storeName: string;
  value: number;
  dateTime: string;
  destination: string;
}

const VEHICLE_LABELS: Record<VehicleType, string> = {
  moto:  'Moto',
  bike:  'Bicicleta',
  carro: 'Carro',
  van:   'Van',
};

const VEHICLE_COLORS: Record<VehicleType, string> = {
  moto:  'text-orange-400',
  bike:  'text-green-400',
  carro: 'text-blue-400',
  van:   'text-purple-400',
};

const MOCK_PAYMENTS: MotoboyPayment[] = [
  { id: '1', name: 'Carlos Eduardo Moto', phone: '(11) 9 9765-4321', vehicle: 'moto',  pixKey: '123.456.789-00', pixType: 'CPF',     bankName: 'Nubank',       tripsCount: 18, baseRate: 7.50, bonusValue: 25.00, totalValue: 160.00, status: 'pending', paymentDate: null },
  { id: '2', name: 'Roberto Bike Silva',  phone: '(11) 9 9812-3456', vehicle: 'bike',  pixKey: 'roberto.silva@pix.com', pixType: 'Chave Aleatória', bankName: 'Mercado Pago', tripsCount: 12, baseRate: 5.50, bonusValue: 10.00, totalValue: 76.00,  status: 'paid',    paymentDate: '03/06/2026' },
  { id: '3', name: 'Lucas de Souza',      phone: '(11) 9 9934-5678', vehicle: 'moto',  pixKey: '11999345678',    pixType: 'Celular', bankName: 'Banco Itaú',   tripsCount: 22, baseRate: 7.50, bonusValue: 35.00, totalValue: 200.00, status: 'pending', paymentDate: null },
  { id: '4', name: 'Ana Paula Rider',     phone: '(11) 9 8877-6655', vehicle: 'moto',  pixKey: '987.654.321-11', pixType: 'CPF',     bankName: 'Banco Inter',  tripsCount: 15, baseRate: 7.50, bonusValue: 20.00, totalValue: 132.50, status: 'pending', paymentDate: null },
  { id: '5', name: 'Fernando Carvalho',   phone: '(11) 9 7766-5544', vehicle: 'carro', pixKey: '45.678.901/0001-22', pixType: 'CNPJ', bankName: 'Bradesco',     tripsCount: 6,  baseRate: 12.00, bonusValue: 15.00, totalValue: 87.00,  status: 'paid',    paymentDate: '02/06/2026' },
  { id: '6', name: 'Patrícia Gomes',      phone: '(11) 9 6655-4433', vehicle: 'moto',  pixKey: 'patricia.gomes@gmail.com', pixType: 'Chave Aleatória', bankName: 'Nubank',   tripsCount: 25, baseRate: 7.50, bonusValue: 45.00, totalValue: 232.50, status: 'paid',    paymentDate: '04/06/2026' },
  { id: '7', name: 'Diego Santos',        phone: '(11) 9 5544-3322', vehicle: 'bike',  pixKey: '98765432100',    pixType: 'CPF',     bankName: 'C6 Bank',      tripsCount: 0,  baseRate: 5.50, bonusValue: 0.00,   totalValue: 0.00,   status: 'paid',    paymentDate: '01/06/2026' },
  { id: '8', name: 'Marcos Entregador',   phone: '(11) 9 4433-2211', vehicle: 'van',   pixKey: 'marcos.van@pix.com', pixType: 'Chave Aleatória', bankName: 'Banco do Brasil', tripsCount: 8,  baseRate: 15.00, bonusValue: 40.00, totalValue: 160.00, status: 'pending', paymentDate: null },
  { id: '9', name: 'Bruna Correia',       phone: '(11) 9 3322-1100', vehicle: 'moto',  pixKey: '33221100999',    pixType: 'CPF',     bankName: 'Nubank',       tripsCount: 14, baseRate: 7.50, bonusValue: 22.00, totalValue: 127.00, status: 'pending', paymentDate: null },
];

const MOCK_DELIVERIES: Record<string, DeliveryDetail[]> = {
  '1': [
    { id: 'd1', code: '#ENT-101', storeName: 'Padaria Bom Pão Ltda', value: 7.50, dateTime: '03/06/2026 11:20', destination: 'Centro' },
    { id: 'd2', code: '#ENT-104', storeName: 'Restaurante Sabor & Arte', value: 7.50, dateTime: '03/06/2026 12:45', destination: 'Pinheiros' },
    { id: 'd3', code: '#ENT-112', storeName: 'Dog King Centro', value: 7.50, dateTime: '03/06/2026 19:15', destination: 'Centro' },
    { id: 'd4', code: '#ENT-120', storeName: 'Loja Fashion Mix', value: 7.50, dateTime: '04/06/2026 14:02', destination: 'Brooklin' },
  ],
  '3': [
    { id: 'd10', code: '#ENT-105', storeName: 'Restaurante Sabor & Arte', value: 7.50, dateTime: '03/06/2026 13:00', destination: 'Jardins' },
    { id: 'd11', code: '#ENT-109', storeName: 'Farmácia Saúde Total', value: 7.50, dateTime: '03/06/2026 15:40', destination: 'Moema' },
    { id: 'd12', code: '#ENT-122', storeName: 'Pizzaria Bella Itália', value: 7.50, dateTime: '04/06/2026 20:30', destination: 'Moema' },
  ],
  '4': [
    { id: 'd20', code: '#ENT-110', storeName: 'Dog King Centro', value: 7.50, dateTime: '03/06/2026 18:22', destination: 'Bela Vista' },
    { id: 'd21', code: '#ENT-118', storeName: 'Açougue Carne Boa', value: 7.50, dateTime: '04/06/2026 11:05', destination: 'Centro' },
  ],
};

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap',
      status === 'paid' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
    )}>
      {status === 'paid' ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <Clock className="h-3 w-3 shrink-0" />}
      {status === 'paid' ? 'Pago' : 'Pendente'}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <div className="h-8 w-8 rounded-full bg-gold-500/15 border border-gold-500/20 flex items-center justify-center shrink-0">
      <span className="text-[11px] font-bold text-gold-500">{initials}</span>
    </div>
  );
}

export function MotoboysPagarPage() {
  const [payments, setPayments] = useState<MotoboyPayment[]>(MOCK_PAYMENTS);
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Modal / Drawer state
  const [paymentToRegister, setPaymentToRegister] = useState<MotoboyPayment | null>(null);
  const [detailMotoboy, setDetailMotoboy] = useState<MotoboyPayment | null>(null);
  const [processing, setProcessing] = useState(false);

  const filtered = useMemo(() => payments.filter((p) => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.phone.includes(q) ||
      p.bankName.toLowerCase().includes(q) || p.pixKey.toLowerCase().includes(q) ||
      VEHICLE_LABELS[p.vehicle].toLowerCase().includes(q);
    return matchStatus && matchSearch;
  }), [payments, statusFilter, search]);

  const counts = useMemo(() => ({
    all:     payments.length,
    pending: payments.filter((p) => p.status === 'pending').length,
    paid:    payments.filter((p) => p.status === 'paid').length,
  }), [payments]);

  const kpis = useMemo(() => {
    const pending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.totalValue, 0);
    const paid    = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.totalValue, 0);
    const trips   = payments.reduce((s, p) => s + p.tripsCount, 0);
    const totalVal = payments.reduce((s, p) => s + p.totalValue, 0);
    const avgRate = trips > 0 ? (payments.reduce((s, p) => s + (p.baseRate * p.tripsCount), 0) / trips) : 0;
    return { pending, paid, trips, avgRate, total: totalVal };
  }, [payments]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const handleRegisterPaymentClick = (p: MotoboyPayment) => {
    setPaymentToRegister(p);
  };

  const confirmPayment = async () => {
    if (!paymentToRegister) return;
    setProcessing(true);
    // Simula tempo de processamento bancário (PIX)
    await new Promise((r) => setTimeout(r, 1000));
    setPayments((prev) => prev.map((p) => p.id === paymentToRegister.id ? { ...p, status: 'paid', paymentDate: new Date().toLocaleDateString('pt-BR') } : p));
    setProcessing(false);
    showToast(`Pagamento de R$ ${paymentToRegister.totalValue.toFixed(2)} para ${paymentToRegister.name} realizado com sucesso!`);
    setPaymentToRegister(null);
  };

  const handleWhatsApp = (p: MotoboyPayment) => {
    const clean = p.phone.replace(/\D/g, '');
    const msg = encodeURIComponent(`Olá ${p.name}! Seu acerto financeiro referente a ${p.tripsCount} corridas foi finalizado. Valor total de R$ ${p.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} enviado para sua chave PIX (${p.pixKey} - ${p.bankName}). Obrigado pela parceria! 🏍️💨`);
    window.open(`https://wa.me/55${clean}?text=${msg}`, '_blank');
  };

  const handleExportCSV = useCallback(() => {
    const rows = [
      ['Entregador', 'Telefone', 'Veículo', 'Banco', 'Tipo PIX', 'Chave PIX', 'Corridas', 'Taxa Base', 'Bônus', 'Total a Pagar', 'Status', 'Data de Pagamento'],
      ...payments.map((p) => [
        p.name, p.phone, VEHICLE_LABELS[p.vehicle], p.bankName, p.pixType, p.pixKey,
        String(p.tripsCount), p.baseRate.toFixed(2), p.bonusValue.toFixed(2), p.totalValue.toFixed(2),
        p.status === 'paid' ? 'Pago' : 'Pendente', p.paymentDate || '—',
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motoboys_a_pagar_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exportação concluída!');
  }, [payments, showToast]);

  const detailDeliveries = useMemo(() => {
    if (!detailMotoboy) return [];
    return MOCK_DELIVERIES[detailMotoboy.id] || [
      { id: 'd_gen1', code: '#ENT-055', storeName: 'Dog King Centro', value: detailMotoboy.baseRate, dateTime: '04/06/2026 12:15', destination: 'República' },
      { id: 'd_gen2', code: '#ENT-088', storeName: 'Padaria Bom Pão Ltda', value: detailMotoboy.baseRate, dateTime: '04/06/2026 13:40', destination: 'Centro' },
    ];
  }, [detailMotoboy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Motoboys a Pagar</h1>
          <p className="text-muted-foreground">Relatório e controle de acertos financeiros com entregadores parceiros</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportCSV} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Download className="h-3.5 w-3.5" /> Exportar Relatório
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-yellow-500/15 bg-yellow-500/3">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10"><DollarSign className="h-5 w-5 text-yellow-400" /></div>
            <div>
              <p className="text-xl font-bold text-yellow-400">{kpis.pending.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="text-xs text-muted-foreground">Total Pendente a Pagar</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-green-500/15 bg-green-500/3">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
            <div>
              <p className="text-xl font-bold text-green-400">{kpis.paid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="text-xs text-muted-foreground">Total Pago no Período</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><Bike className="h-5 w-5 text-gold-400" /></div>
            <div>
              <p className="text-xl font-bold text-foreground">{kpis.trips.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-muted-foreground">Corridas Concluídas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><ArrowUpRight className="h-5 w-5 text-gold-500" /></div>
            <div>
              <p className="text-xl font-bold text-gold-500">{kpis.avgRate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              <p className="text-xs text-muted-foreground">Taxa Média por Corrida</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Acertos */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bike className="h-4 w-4 text-gold-500" />
              Fechamento de Entregadores
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar motoboy..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-56"
                />
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-0.5">
                <button onClick={() => setStatusFilter('all')} className={cn('px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all', statusFilter === 'all' ? 'bg-gold-500/15 text-gold-400 border border-gold-500/20' : 'text-muted-foreground hover:text-foreground')}>
                  Todos ({counts.all})
                </button>
                <button onClick={() => setStatusFilter('pending')} className={cn('px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all', statusFilter === 'pending' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' : 'text-muted-foreground hover:text-foreground')}>
                  Pendentes ({counts.pending})
                </button>
                <button onClick={() => setStatusFilter('paid')} className={cn('px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all', statusFilter === 'paid' ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'text-muted-foreground hover:text-foreground')}>
                  Pagos ({counts.paid})
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-t border-border">
              <colgroup>
                <col style={{ width: '22%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Entregador</th>
                  <th className="px-4 py-2.5 text-left">Dados Bancários / PIX</th>
                  <th className="px-4 py-2.5 text-center">Corridas</th>
                  <th className="px-4 py-2.5 text-right">Valor Corridas</th>
                  <th className="px-4 py-2.5 text-right">Adicionais</th>
                  <th className="px-4 py-2.5 text-right">Valor Total</th>
                  <th className="px-4 py-2.5 text-center">Ações / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                      <Bike className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhum entregador para acerto encontrado</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const baseSum = p.tripsCount * p.baseRate;
                    return (
                      <tr key={p.id} className="hover:bg-gold-500/5 transition-colors group">
                        {/* Entregador */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar name={p.name} />
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{p.name}</p>
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <span className={cn('font-semibold text-[10px]', VEHICLE_COLORS[p.vehicle])}>
                                  {VEHICLE_LABELS[p.vehicle]}
                                </span>
                                · {p.phone}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Dados Bancários */}
                        <td className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <Landmark className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                            <div className="text-xs">
                              <p className="font-medium text-foreground">{p.bankName}</p>
                              <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-[200px]" title={p.pixKey}>
                                <span className="font-semibold">{p.pixType}:</span> {p.pixKey}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Corridas */}
                        <td className="px-4 py-3 text-center">
                          <p className="text-sm font-bold">{p.tripsCount}</p>
                          <p className="text-[10px] text-muted-foreground">corridas</p>
                        </td>

                        {/* Valor Corridas */}
                        <td className="px-4 py-3 text-right">
                          <p className="text-xs font-semibold">{baseSum.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          <p className="text-[10px] text-muted-foreground">{p.tripsCount} x {p.baseRate.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                        </td>

                        {/* Adicionais */}
                        <td className="px-4 py-3 text-right">
                          <p className="text-xs text-green-400 font-semibold">+{p.bonusValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                          <p className="text-[10px] text-muted-foreground">taxas extras</p>
                        </td>

                        {/* Valor Total */}
                        <td className="px-4 py-3 text-right">
                          <p className="text-sm font-extrabold text-gold-400">
                            {p.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </td>

                        {/* Ações / Status */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {p.status === 'paid' ? (
                              <div className="flex items-center gap-1">
                                <StatusBadge status="paid" />
                                <span className="text-[9px] text-muted-foreground block">{p.paymentDate}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleRegisterPaymentClick(p)}
                                className="px-2.5 py-1 bg-gold-500 hover:bg-gold-600 text-black font-bold text-[11px] rounded-lg transition-colors shadow-md shadow-gold-500/10 shrink-0"
                              >
                                Pagar PIX
                              </button>
                            )}

                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setDetailMotoboy(p)} className="p-1 rounded-md hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors" title="Detalhamento das Corridas">
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <button onClick={() => handleWhatsApp(p)} className="p-1 rounded-md hover:bg-green-500/10 text-muted-foreground hover:text-green-400 transition-colors" title="Notificar via WhatsApp">
                                <MessageCircle className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Totais do Relatório */}
          <div className="grid grid-cols-3 divide-x divide-border border-t border-border bg-muted/10 text-center shrink-0">
            <div className="py-3.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total a Pagar Pendente</p>
              <p className="text-base font-bold text-yellow-400 mt-0.5">
                {filtered.filter((p) => p.status === 'pending').reduce((s, p) => s + p.totalValue, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="py-3.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total Pago no Período</p>
              <p className="text-base font-bold text-green-400 mt-0.5">
                {filtered.filter((p) => p.status === 'paid').reduce((s, p) => s + p.totalValue, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
            <div className="py-3.5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Faturamento Total Acumulado</p>
              <p className="text-base font-bold text-gold-400 mt-0.5">
                {filtered.reduce((s, p) => s + p.totalValue, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal Registrar Pagamento via PIX */}
      {paymentToRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPaymentToRegister(null)} />
          <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl shadow-black/40 animate-fade-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gold-500/10"><Landmark className="h-5 w-5 text-gold-500" /></div>
                <div>
                  <h2 className="text-lg font-bold">Confirmar Pagamento PIX</h2>
                  <p className="text-xs text-muted-foreground">Registre a transferência financeira efetuada</p>
                </div>
              </div>
              <button onClick={() => setPaymentToRegister(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="bg-muted/50 border border-border p-4 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Entregador:</span>
                  <span className="font-semibold text-foreground">{paymentToRegister.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Veículo:</span>
                  <span className="font-semibold text-foreground">{VEHICLE_LABELS[paymentToRegister.vehicle]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Banco de Destino:</span>
                  <span className="font-semibold text-foreground">{paymentToRegister.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Chave PIX ({paymentToRegister.pixType}):</span>
                  <span className="font-mono font-semibold text-gold-500 select-all">{paymentToRegister.pixKey}</span>
                </div>
                <div className="border-t border-border my-2 pt-2 flex justify-between text-base">
                  <span className="font-semibold text-muted-foreground">Valor a Transferir:</span>
                  <span className="font-black text-gold-400">R$ {paymentToRegister.totalValue.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-lg text-xs text-blue-400 leading-relaxed">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p>Ao clicar em confirmar, você está registrando que efetuou a transferência bancária para o motoboy. O status dele será atualizado para "Pago" e as corridas serão liquidadas.</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border">
              <button onClick={() => setPaymentToRegister(null)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                Cancelar
              </button>
              <button
                disabled={processing}
                onClick={confirmPayment}
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-5 py-2 rounded-lg text-sm transition-all shadow-md shadow-gold-500/20"
              >
                {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {processing ? 'Confirmando...' : 'Confirmar e Liquidar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer Detalhes de Corridas */}
      {detailMotoboy && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailMotoboy(null)} />
          <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl shadow-black/40 animate-fade-in flex flex-col h-full">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                <Avatar name={detailMotoboy.name} />
                <div>
                  <h2 className="text-lg font-bold">{detailMotoboy.name}</h2>
                  <p className="text-xs text-muted-foreground">{VEHICLE_LABELS[detailMotoboy.vehicle]} · {detailMotoboy.phone}</p>
                </div>
              </div>
              <button onClick={() => setDetailMotoboy(null)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="flex items-center justify-between bg-muted/40 p-3 rounded-lg border border-border">
                <div>
                  <p className="text-2xl font-black text-gold-400">{detailMotoboy.tripsCount}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Corridas Realizadas</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-foreground">{(detailMotoboy.tripsCount * detailMotoboy.baseRate).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Valor Bruto Acumulado</p>
                </div>
              </div>

              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Histórico de Corridas no Período</h3>
              
              <div className="space-y-2">
                {detailDeliveries.map((d) => (
                  <div key={d.id} className="p-3 rounded-lg bg-muted/30 border border-border flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-mono font-bold text-gold-500">{d.code}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 text-green-400 font-medium">Entregue</span>
                      </div>
                      <p className="text-xs font-medium">{d.storeName}</p>
                      <p className="text-[10px] text-muted-foreground">Destino: {d.destination}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs font-semibold">{d.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      <p className="text-[9px] text-muted-foreground">{d.dateTime}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-border p-4 space-y-2">
              <button onClick={() => handleWhatsApp(detailMotoboy)} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-sm text-green-400 transition-colors">
                <MessageCircle className="h-4 w-4" /> Entrar em Contato (WhatsApp)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-card border border-gold-500/30 rounded-lg px-4 py-3 shadow-xl shadow-black/30 animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}
