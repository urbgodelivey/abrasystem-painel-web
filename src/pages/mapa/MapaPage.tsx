import { useState } from 'react';
import {
  Truck, Clock, CheckCircle2, Radio, RefreshCw,
  User, MapPin, Phone, Package, AlertCircle, Navigation,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Map, MapControls, MapMarker, MarkerContent, MarkerTooltip, MarkerPopup,
} from '@/components/ui/map';
import { cn } from '@/lib/utils';

type DeliveryStatus = 'in_transit' | 'pending' | 'delivered' | 'returning';

interface ActiveDelivery {
  id: string;
  code: string;
  deliverer: string;
  phone: string;
  customer: string;
  district: string;
  status: DeliveryStatus;
  eta: string;
  progress: number;
  lng: number;
  lat: number;
  lastUpdate: string;
}

const ACTIVE_DELIVERIES: ActiveDelivery[] = [
  { id: '1', code: '#ENT-002', deliverer: 'Roberto Bike',   phone: '(11) 9 9812-3456', customer: 'Maria Oliveira',  district: 'Jardins',     status: 'in_transit', eta: '09:15', progress: 65,  lng: -46.6589, lat: -23.5677, lastUpdate: '09:01' },
  { id: '2', code: '#ENT-004', deliverer: 'Lucas Entrega',  phone: '(11) 9 9934-5678', customer: 'Ana Costa',       district: 'Moema',       status: 'in_transit', eta: '09:55', progress: 40,  lng: -46.6647, lat: -23.6039, lastUpdate: '09:03' },
  { id: '3', code: '#ENT-009', deliverer: 'Roberto Bike',   phone: '(11) 9 9812-3456', customer: 'Camila Torres',   district: 'Santo André', status: 'in_transit', eta: '10:20', progress: 20,  lng: -46.5350, lat: -23.6514, lastUpdate: '08:58' },
  { id: '4', code: '#ENT-001', deliverer: 'Carlos Moto',    phone: '(11) 9 9765-4321', customer: 'João da Silva',   district: 'Centro',      status: 'delivered',  eta: '—',     progress: 100, lng: -46.6388, lat: -23.5489, lastUpdate: '08:14' },
  { id: '5', code: '#ENT-003', deliverer: '—',              phone: '—',                customer: 'Pedro Mendonça',  district: 'Vila Nova',   status: 'pending',    eta: '—',     progress: 0,   lng: -46.6500, lat: -23.5300, lastUpdate: '09:05' },
  { id: '6', code: '#ENT-006', deliverer: 'Carlos Moto',    phone: '(11) 9 9765-4321', customer: 'Ricardo Alves',  district: 'Lapa',        status: 'returning',  eta: '09:30', progress: 80,  lng: -46.7069, lat: -23.5234, lastUpdate: '09:02' },
];

const STATUS_CONFIG: Record<DeliveryStatus, {
  label: string; color: string; bg: string; pinBg: string; pinBorder: string; icon: typeof Truck;
}> = {
  in_transit: { label: 'Em Rota',    color: 'text-blue-400',   bg: 'bg-blue-500/15 border-blue-500/25',   pinBg: 'bg-blue-500',   pinBorder: 'ring-blue-400',   icon: Truck },
  pending:    { label: 'Aguardando', color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/25', pinBg: 'bg-yellow-500', pinBorder: 'ring-yellow-400', icon: Clock },
  delivered:  { label: 'Entregue',   color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/25',  pinBg: 'bg-green-500',  pinBorder: 'ring-green-400',  icon: CheckCircle2 },
  returning:  { label: 'Retornando', color: 'text-gold-400',   bg: 'bg-gold-500/15 border-gold-500/25',    pinBg: 'bg-gold-500',   pinBorder: 'ring-gold-400',   icon: Navigation },
};

const MAP_CENTER: [number, number] = [-46.6388, -23.5700];
const MAP_ZOOM = 11;

export function MapaPage() {
  const [selectedId, setSelectedId] = useState<string | null>(ACTIVE_DELIVERIES[0].id);
  const [lastRefresh] = useState('09:04');

  const selected = ACTIVE_DELIVERIES.find((d) => d.id === selectedId) ?? null;

  const counts = {
    in_transit: ACTIVE_DELIVERIES.filter((d) => d.status === 'in_transit').length,
    pending:    ACTIVE_DELIVERIES.filter((d) => d.status === 'pending').length,
    delivered:  ACTIVE_DELIVERIES.filter((d) => d.status === 'delivered').length,
    returning:  ACTIVE_DELIVERIES.filter((d) => d.status === 'returning').length,
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mapa ao Vivo</h1>
          <p className="text-muted-foreground">Rastreamento em tempo real das entregas ativas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Ao vivo · atualizado {lastRefresh}
          </div>
          <button className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="h-3.5 w-3.5" />
            Atualizar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { key: 'in_transit', label: 'Em Rota',    icon: Truck,        color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/10' },
          { key: 'pending',    label: 'Aguardando',  icon: Clock,        color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/10' },
          { key: 'returning',  label: 'Retornando',  icon: Navigation,   color: 'text-gold-400',   bg: 'bg-gold-500/10 border-gold-500/10' },
          { key: 'delivered',  label: 'Concluídas',  icon: CheckCircle2, color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/10' },
        ] as const).map((item) => (
          <Card key={item.key} className={`border ${item.bg}`}>
            <CardContent className="p-3 flex items-center gap-2.5">
              <div className={cn('p-1.5 rounded-lg', item.bg)}>
                <item.icon className={cn('h-4 w-4', item.color)} />
              </div>
              <div>
                <p className="text-xl font-bold">{counts[item.key]}</p>
                <p className="text-[11px] text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-[300px_1fr] gap-4" style={{ height: 'calc(100vh - 320px)', minHeight: '420px' }}>

        {/* Painel lateral */}
        <div className="flex flex-col gap-2 overflow-hidden">
          <div className="flex items-center gap-2 px-1">
            <Radio className="h-3.5 w-3.5 text-gold-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Entregas Ativas</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {ACTIVE_DELIVERIES.map((d) => {
              const cfg = STATUS_CONFIG[d.status];
              const Icon = cfg.icon;
              const isSelected = selectedId === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedId(d.id)}
                  className={cn(
                    'w-full text-left rounded-lg border p-3 transition-all duration-200',
                    isSelected
                      ? 'border-gold-500/30 bg-gold-500/8 shadow-sm'
                      : 'border-border bg-card hover:border-gold-500/20 hover:bg-gold-500/5'
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-semibold text-gold-500">{d.code}</span>
                    <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] border', cfg.bg, cfg.color)}>
                      <Icon className="h-2.5 w-2.5" />
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-xs font-medium truncate">{d.customer}</p>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="h-2.5 w-2.5 shrink-0" />
                    {d.district}
                  </p>
                  {d.deliverer !== '—' && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <User className="h-2.5 w-2.5 shrink-0" />
                      {d.deliverer}
                    </p>
                  )}
                  {d.status === 'in_transit' && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span>Progresso</span>
                        <span className="text-blue-400">{d.progress}%</span>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${d.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Coluna do mapa + detalhes */}
        <div className="flex flex-col gap-2 min-h-0">
          {/* Mapa MapLibre via mapcn */}
          <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-border">
            <Map
              center={MAP_CENTER}
              zoom={MAP_ZOOM}
              theme="dark"
              className="h-full w-full"
            >
              <MapControls showZoom showCompass position="bottom-right" />

              {ACTIVE_DELIVERIES.map((d) => {
                const cfg = STATUS_CONFIG[d.status];
                const Icon = cfg.icon;
                const isSelected = selectedId === d.id;

                return (
                  <MapMarker
                    key={d.id}
                    longitude={d.lng}
                    latitude={d.lat}
                    onClick={() => setSelectedId(d.id)}
                  >
                    <MarkerContent>
                      <div className={cn(
                        'flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer shadow-lg',
                        isSelected ? 'w-10 h-10' : 'w-7 h-7',
                        cfg.pinBg,
                        isSelected && `ring-2 ring-white/40`
                      )}>
                        <Icon className={cn('text-white', isSelected ? 'h-5 w-5' : 'h-3.5 w-3.5')} />
                        {d.status === 'in_transit' && (
                          <span
                            className="absolute inset-0 rounded-full animate-ping opacity-30"
                            style={{ backgroundColor: 'inherit' }}
                          />
                        )}
                      </div>
                    </MarkerContent>

                    <MarkerTooltip>
                      <span className="font-mono font-semibold">{d.code}</span>
                      {' — '}
                      {d.customer}
                    </MarkerTooltip>

                    {isSelected && (
                      <MarkerPopup closeButton={false}>
                        <div className="min-w-[180px]">
                          <p className="font-mono text-xs font-bold text-gold-500 mb-1">{d.code}</p>
                          <p className="text-sm font-semibold">{d.customer}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" /> {d.district}
                          </p>
                          {d.deliverer !== '—' && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <User className="h-3 w-3" /> {d.deliverer}
                            </p>
                          )}
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border mt-2',
                            cfg.bg, cfg.color
                          )}>
                            <cfg.icon className="h-2.5 w-2.5" />
                            {cfg.label}
                            {d.eta !== '—' && ` · ETA ${d.eta}`}
                          </span>
                        </div>
                      </MarkerPopup>
                    )}
                  </MapMarker>
                );
              })}
            </Map>
          </div>

          {/* Detalhes da entrega selecionada */}
          {selected && (
            <Card className="border-gold-500/15 shrink-0">
              <CardContent className="p-3">
                <div className="flex items-start gap-4">
                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Pedido</p>
                      <p className="text-sm font-mono font-semibold text-gold-500">{selected.code}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Cliente</p>
                      <p className="text-sm font-medium truncate">{selected.customer}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Destino</p>
                      <p className="text-sm font-medium">{selected.district}</p>
                    </div>
                  </div>

                  <div className="h-full w-px bg-border shrink-0" />

                  <div className="flex-1 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Entregador</p>
                      <p className="text-sm font-medium">
                        {selected.deliverer !== '—' ? selected.deliverer : (
                          <span className="text-muted-foreground italic text-xs">Não atribuído</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">Telefone</p>
                      <p className="text-sm font-medium">{selected.phone !== '—' ? selected.phone : '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">ETA</p>
                      <p className={cn('text-sm font-semibold', selected.status === 'in_transit' ? 'text-blue-400' : 'text-muted-foreground')}>
                        {selected.eta}
                      </p>
                    </div>
                  </div>

                  <div className="h-full w-px bg-border shrink-0" />

                  <div className="flex items-center gap-2 shrink-0">
                    {selected.phone !== '—' && (
                      <button className="p-2 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors border border-green-500/20" title="Ligar">
                        <Phone className="h-4 w-4" />
                      </button>
                    )}
                    <button className="p-2 rounded-lg bg-gold-500/10 text-gold-400 hover:bg-gold-500/20 transition-colors border border-gold-500/20" title="Ver entrega">
                      <Package className="h-4 w-4" />
                    </button>
                    {selected.status === 'pending' && (
                      <button className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-colors border border-yellow-500/20" title="Alerta">
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="font-semibold">Legenda:</span>
        {(Object.entries(STATUS_CONFIG) as [DeliveryStatus, typeof STATUS_CONFIG[DeliveryStatus]][]).map(([key, cfg]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-full', cfg.pinBg)} />
            {cfg.label}
          </span>
        ))}
      </div>
    </div>
  );
}
