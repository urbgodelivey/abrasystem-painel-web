import { useState, useCallback } from 'react';
import {
  X, Package, MapPin, User, Clock, Phone,
  CheckCircle2, Truck, XCircle, AlertCircle,
  Navigation, MessageCircle, Printer, Copy,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type DeliveryStatus = 'pending' | 'in_transit' | 'delivered' | 'cancelled';

interface Delivery {
  id: string;
  code: string;
  customer: string;
  district: string;
  address: string;
  deliverer: string | null;
  status: DeliveryStatus;
  value: number;
  time: string;
  eta: string | null;
}

interface DetalhesEntregaDrawerProps {
  delivery: Delivery | null;
  onClose: () => void;
  onStatusChange: (id: string, status: DeliveryStatus) => void;
}

const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  pending:    { label: 'Pendente',     color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  in_transit: { label: 'Em Andamento', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',    icon: Truck },
  delivered:  { label: 'Entregue',     color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',  icon: CheckCircle2 },
  cancelled:  { label: 'Cancelada',    color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',      icon: XCircle },
};

const TIMELINE = [
  { time: '09:05', label: 'Pedido criado', icon: Package, color: 'text-gold-400' },
  { time: '09:12', label: 'Entregador atribuído', icon: User, color: 'text-blue-400' },
  { time: '09:18', label: 'Saiu para entrega', icon: Navigation, color: 'text-blue-400' },
];

// Mock phone numbers for deliverers
const DELIVERER_PHONES: Record<string, string> = {
  'Carlos Moto': '5511999887766',
  'Roberto Bike': '5511988776655',
  'Ana Rider': '5511977665544',
  'Lucas Entrega': '5511966554433',
  'Fernanda Express': '5511955443322',
};

export function DetalhesEntregaDrawer({ delivery, onClose, onStatusChange }: DetalhesEntregaDrawerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = useCallback(() => {
    if (!delivery) return;
    navigator.clipboard.writeText(delivery.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [delivery]);

  const handlePrint = useCallback(() => {
    if (!delivery) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const statusLabel = STATUS_CONFIG[delivery.status].label;
    printWindow.document.write(`
      <html><head><title>Entrega ${delivery.code}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 40px; color: #222; max-width: 400px; margin: 0 auto; }
        .header { border-bottom: 2px solid #d4a017; padding-bottom: 12px; margin-bottom: 20px; }
        h1 { margin: 0; color: #d4a017; font-size: 24px; }
        .code { font-family: monospace; font-size: 18px; color: #d4a017; }
        .field { margin: 8px 0; }
        .label { font-size: 10px; text-transform: uppercase; color: #888; letter-spacing: 1px; }
        .value { font-size: 14px; font-weight: 600; }
        .divider { border-top: 1px solid #eee; margin: 16px 0; }
        .amount { font-size: 20px; font-weight: 700; color: #d4a017; }
        .footer { margin-top: 24px; font-size: 10px; color: #aaa; text-align: center; }
      </style></head><body>
      <div class="header">
        <h1>AbraSystem</h1>
        <p style="margin: 4px 0; font-size: 12px; color: #666;">Comprovante de Entrega</p>
      </div>
      <div class="field"><div class="label">Código</div><div class="code">${delivery.code}</div></div>
      <div class="field"><div class="label">Status</div><div class="value">${statusLabel}</div></div>
      <div class="divider"></div>
      <div class="field"><div class="label">Cliente</div><div class="value">${delivery.customer}</div></div>
      <div class="field"><div class="label">Endereço</div><div class="value">${delivery.address}</div></div>
      <div class="field"><div class="label">Bairro</div><div class="value">${delivery.district}</div></div>
      <div class="divider"></div>
      <div class="field"><div class="label">Entregador</div><div class="value">${delivery.deliverer || 'Não atribuído'}</div></div>
      <div class="field"><div class="label">Hora</div><div class="value">${delivery.time}</div></div>
      ${delivery.eta ? `<div class="field"><div class="label">ETA</div><div class="value">${delivery.eta}</div></div>` : ''}
      <div class="divider"></div>
      <div class="field"><div class="label">Valor</div><div class="amount">${delivery.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div></div>
      <div class="footer">Gerado em ${new Date().toLocaleString('pt-BR')} · AbraSystem</div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [delivery]);

  const handleCall = useCallback(() => {
    if (!delivery?.deliverer) return;
    const phone = DELIVERER_PHONES[delivery.deliverer] || '5511999999999';
    window.open(`tel:+${phone}`, '_self');
  }, [delivery]);

  const handleWhatsApp = useCallback(() => {
    if (!delivery?.deliverer) return;
    const phone = DELIVERER_PHONES[delivery.deliverer] || '5511999999999';
    const msg = encodeURIComponent(`Olá ${delivery.deliverer}! Referente à entrega ${delivery.code} para ${delivery.customer} em ${delivery.district}. Como está o andamento?`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }, [delivery]);

  const handleOpenMap = useCallback(() => {
    if (!delivery) return;
    const query = encodeURIComponent(`${delivery.address}, ${delivery.district}, São Paulo`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }, [delivery]);

  if (!delivery) return null;

  const cfg = STATUS_CONFIG[delivery.status];
  const StatusIcon = cfg.icon;

  const nextActions: { status: DeliveryStatus; label: string; color: string; bg: string }[] = [];
  if (delivery.status === 'pending') {
    nextActions.push({ status: 'in_transit', label: 'Iniciar Entrega', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20' });
    nextActions.push({ status: 'cancelled', label: 'Cancelar', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20' });
  }
  if (delivery.status === 'in_transit') {
    nextActions.push({ status: 'delivered', label: 'Marcar Entregue', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20 hover:bg-green-500/20' });
    nextActions.push({ status: 'cancelled', label: 'Cancelar', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20' });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border-l border-border shadow-2xl shadow-black/40 animate-fade-in flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10">
              <Package className="h-5 w-5 text-gold-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-mono text-gold-500">{delivery.code}</h2>
              <p className="text-xs text-muted-foreground">Detalhes da entrega</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors relative"
              title="Copiar código"
            >
              <Copy className="h-4 w-4" />
              {copied && (
                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded whitespace-nowrap animate-fade-in">
                  Copiado!
                </span>
              )}
            </button>
            <button onClick={handlePrint} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors" title="Imprimir comprovante">
              <Printer className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border', cfg.bg, cfg.color)}>
              <StatusIcon className="h-3.5 w-3.5" />
              {cfg.label}
            </span>
            <span className="text-xs text-muted-foreground">Criado às {delivery.time}</span>
          </div>

          {/* Info Cards */}
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Cliente</p>
              <p className="text-sm font-medium">{delivery.customer}</p>
            </div>
            <div
              onClick={handleOpenMap}
              className="p-3 rounded-lg bg-muted/50 border border-border cursor-pointer hover:border-gold-500/30 transition-colors group/map"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1 flex items-center gap-1">
                Endereço
                <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/map:opacity-100 transition-opacity text-gold-400" />
              </p>
              <p className="text-sm font-medium flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                {delivery.address}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 ml-5">{delivery.district}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Entregador</p>
                {delivery.deliverer ? (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-blue-400" />
                    <span className="text-sm font-medium">{delivery.deliverer}</span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Não atribuído</span>
                )}
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Valor</p>
                <p className={cn('text-sm font-bold', delivery.status === 'cancelled' ? 'line-through text-muted-foreground' : 'text-gold-400')}>
                  {delivery.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
            {delivery.eta && (
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-muted-foreground">Previsão de chegada</p>
                    <p className="text-sm font-bold text-blue-400">{delivery.eta}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Histórico</p>
            <div className="space-y-0">
              {TIMELINE.map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-start gap-3 relative">
                    {i < TIMELINE.length - 1 && (
                      <div className="absolute left-[13px] top-7 w-px h-[calc(100%-4px)] bg-border" />
                    )}
                    <div className="p-1.5 rounded-full bg-muted border border-border shrink-0 z-10">
                      <Icon className={cn('h-3 w-3', item.color)} />
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-[11px] text-muted-foreground">{item.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 border-t border-border p-4 space-y-2">
          {delivery.deliverer && (
            <div className="flex gap-2 mb-2">
              <button
                onClick={handleCall}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="h-3.5 w-3.5" /> Ligar
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-green-500/20 bg-green-500/5 hover:bg-green-500/10 text-sm text-green-400 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </button>
            </div>
          )}
          {nextActions.length > 0 && (
            <div className="flex gap-2">
              {nextActions.map((action) => (
                <button
                  key={action.status}
                  onClick={() => onStatusChange(delivery.id, action.status)}
                  className={cn('flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-all', action.bg, action.color)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
