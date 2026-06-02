import { useState } from 'react';
import { X, Package, MapPin, User, DollarSign, FileText, Search, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NovaEntregaModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EntregaFormData) => void;
}

export interface EntregaFormData {
  customerId: string;
  customerName: string;
  address: string;
  district: string;
  delivererId: string | null;
  delivererName: string | null;
  value: number;
  notes: string;
  priority: 'normal' | 'urgent';
}

const MOCK_CUSTOMERS = [
  { id: '1', name: 'Padaria Bom Pão Ltda', address: 'Rua das Flores, 123', district: 'Centro' },
  { id: '2', name: 'Maria Oliveira', address: 'Av. Paulista, 456', district: 'Jardins' },
  { id: '3', name: 'Restaurante Sabor & Arte', address: 'Rua Ipiranga, 789', district: 'Pinheiros' },
  { id: '4', name: 'Farmácia Saúde Total', address: 'Rua Iguatemi, 321', district: 'Moema' },
  { id: '5', name: 'Mercadinho do Zé', address: 'Rua Guaicurus, 987', district: 'Tatuapé' },
];

const MOCK_DELIVERERS = [
  { id: '1', name: 'Carlos Moto', available: true },
  { id: '2', name: 'Roberto Bike', available: false },
  { id: '3', name: 'Ana Rider', available: true },
  { id: '4', name: 'Lucas Entrega', available: true },
  { id: '5', name: 'Fernanda Express', available: true },
];

export function NovaEntregaModal({ open, onClose, onSubmit }: NovaEntregaModalProps) {
  const [step, setStep] = useState(1);
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof MOCK_CUSTOMERS[0] | null>(null);
  const [selectedDeliverer, setSelectedDeliverer] = useState<typeof MOCK_DELIVERERS[0] | null>(null);
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const filteredCustomers = MOCK_CUSTOMERS.filter((c) =>
    !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!selectedCustomer) return;
    setSaving(true);
    // Simula API call
    await new Promise((r) => setTimeout(r, 1200));
    onSubmit({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      address: selectedCustomer.address,
      district: selectedCustomer.district,
      delivererId: selectedDeliverer?.id ?? null,
      delivererName: selectedDeliverer?.name ?? null,
      value: parseFloat(value) || 0,
      notes,
      priority,
    });
    setSaving(false);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setStep(1);
    setCustomerSearch('');
    setSelectedCustomer(null);
    setSelectedDeliverer(null);
    setValue('');
    setNotes('');
    setPriority('normal');
  };

  const canProceed = step === 1 ? !!selectedCustomer : !!value;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-2xl shadow-black/40 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10">
              <Package className="h-5 w-5 text-gold-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Nova Entrega</h2>
              <p className="text-xs text-muted-foreground">Etapa {step} de 2</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div className="h-full bg-gold-500 transition-all duration-300" style={{ width: `${step * 50}%` }} />
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {step === 1 ? (
            <>
              {/* Selecionar cliente */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Selecionar Cliente *
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                  />
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCustomer(c)}
                      className={cn(
                        'w-full text-left p-3 rounded-lg border transition-all text-sm',
                        selectedCustomer?.id === c.id
                          ? 'border-gold-500/30 bg-gold-500/8'
                          : 'border-border hover:border-gold-500/20 hover:bg-gold-500/5'
                      )}
                    >
                      <p className="font-medium">{c.name}</p>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-2.5 w-2.5" /> {c.address} · {c.district}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prioridade */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Prioridade
                </label>
                <div className="flex gap-2">
                  {(['normal', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn(
                        'flex-1 py-2 rounded-lg border text-sm font-medium transition-all',
                        priority === p
                          ? p === 'urgent'
                            ? 'border-red-500/30 bg-red-500/10 text-red-400'
                            : 'border-gold-500/30 bg-gold-500/10 text-gold-400'
                          : 'border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {p === 'normal' ? '📦 Normal' : '🔥 Urgente'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Resumo do cliente */}
              {selectedCustomer && (
                <div className="p-3 rounded-lg bg-gold-500/5 border border-gold-500/15">
                  <p className="text-sm font-medium">{selectedCustomer.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedCustomer.address} · {selectedCustomer.district}</p>
                </div>
              )}

              {/* Entregador (opcional) */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Entregador <span className="text-muted-foreground font-normal">(opcional)</span>
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {MOCK_DELIVERERS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDeliverer(selectedDeliverer?.id === d.id ? null : d)}
                      disabled={!d.available}
                      className={cn(
                        'w-full text-left p-2.5 rounded-lg border transition-all text-sm flex items-center justify-between',
                        !d.available && 'opacity-40 cursor-not-allowed',
                        selectedDeliverer?.id === d.id
                          ? 'border-gold-500/30 bg-gold-500/8'
                          : 'border-border hover:border-gold-500/20'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-medium">{d.name}</span>
                      </div>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', d.available ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400')}>
                        {d.available ? 'Disponível' : 'Ocupado'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Valor da Entrega (R$) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                  Observações
                </label>
                <textarea
                  rows={2}
                  placeholder="Instruções especiais, ponto de referência..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          {step > 1 ? (
            <button onClick={() => setStep(1)} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Voltar
            </button>
          ) : (
            <button onClick={onClose} className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              Cancelar
            </button>
          )}
          {step === 1 ? (
            <button
              disabled={!canProceed}
              onClick={() => setStep(2)}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                canProceed
                  ? 'bg-gold-500 hover:bg-gold-600 text-black shadow-md shadow-gold-500/20'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              Próximo
            </button>
          ) : (
            <button
              disabled={!canProceed || saving}
              onClick={handleSubmit}
              className={cn(
                'inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all',
                canProceed && !saving
                  ? 'bg-gold-500 hover:bg-gold-600 text-black shadow-md shadow-gold-500/20'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {saving ? 'Criando...' : 'Criar Entrega'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
