import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, Send, Phone, MoreVertical, CheckCheck, Check,
  Clock, AlertCircle, MessageSquare, Users, TrendingUp,
  Smile, Paperclip, Mic, Filter, RefreshCw, Circle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MsgStatus = 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
type ConvStatus = 'active' | 'waiting' | 'resolved' | 'bot';

interface Message {
  id: string;
  from: 'us' | 'them';
  text: string;
  time: string;
  status: MsgStatus;
}

interface Conversation {
  id: string;
  contact: string;
  phone: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  status: ConvStatus;
  messages: Message[];
}

const CONV_STATUS_CONFIG: Record<ConvStatus, { label: string; color: string; dot: string }> = {
  active:   { label: 'Ativo',     color: 'text-green-400',  dot: 'bg-green-500' },
  waiting:  { label: 'Aguardando',color: 'text-yellow-400', dot: 'bg-yellow-500' },
  resolved: { label: 'Resolvido', color: 'text-muted-foreground', dot: 'bg-muted-foreground' },
  bot:      { label: 'Bot',       color: 'text-blue-400',   dot: 'bg-blue-500' },
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1', contact: 'Mercadinho do Zé', phone: '(11) 3345-6789', lastMessage: 'Obrigado! Recebi tudo certinho.', lastTime: '09:14', unread: 0, status: 'resolved',
    messages: [
      { id: 'm1', from: 'us',   text: 'Olá! Sua entrega #ENT-001 saiu para entrega. Previsão: 08:30.', time: '07:45', status: 'read' },
      { id: 'm2', from: 'them', text: 'Ótimo, obrigado pelo aviso!', time: '07:52', status: 'read' },
      { id: 'm3', from: 'us',   text: 'Entrega #ENT-001 concluída com sucesso. ✅', time: '08:14', status: 'read' },
      { id: 'm4', from: 'them', text: 'Obrigado! Recebi tudo certinho.', time: '09:14', status: 'read' },
    ],
  },
  {
    id: '2', contact: 'Farmácia Saúde Total', phone: '(11) 3234-5678', lastMessage: 'Quando chega meu pedido?', lastTime: '09:31', unread: 2, status: 'waiting',
    messages: [
      { id: 'm1', from: 'us',   text: 'Olá! Sua entrega #ENT-004 está a caminho. ETA: 09:55.', time: '09:20', status: 'read' },
      { id: 'm2', from: 'them', text: 'Quando chega meu pedido?', time: '09:31', status: 'delivered' },
    ],
  },
  {
    id: '3', contact: 'Restaurante Sabor & Arte', phone: '(11) 4567-8901', lastMessage: 'Pedido confirmado para amanhã.', lastTime: '08:55', unread: 0, status: 'active',
    messages: [
      { id: 'm1', from: 'them', text: 'Bom dia! Gostaria de agendar uma entrega para amanhã às 10h.', time: '08:40', status: 'read' },
      { id: 'm2', from: 'us',   text: 'Bom dia! Claro, vamos verificar disponibilidade para você.', time: '08:48', status: 'read' },
      { id: 'm3', from: 'us',   text: 'Pedido confirmado para amanhã.', time: '08:55', status: 'read' },
    ],
  },
  {
    id: '4', contact: 'Maria Oliveira', phone: '(11) 9 9812-3456', lastMessage: 'Sua entrega chegou! Confirme o recebimento.', lastTime: '09:15', unread: 0, status: 'bot',
    messages: [
      { id: 'm1', from: 'us',   text: 'Sua entrega #ENT-002 chegou! Confirme o recebimento.', time: '09:15', status: 'delivered' },
    ],
  },
  {
    id: '5', contact: 'Padaria Bom Pão Ltda', phone: '(11) 3456-7890', lastMessage: 'Perfeito! Até logo.', lastTime: '08:20', unread: 0, status: 'resolved',
    messages: [
      { id: 'm1', from: 'us',   text: 'Bom dia! Seu pedido mensal está confirmado. Total: R$ 980,00.', time: '08:05', status: 'read' },
      { id: 'm2', from: 'them', text: 'Tudo certo, pode confirmar.', time: '08:12', status: 'read' },
      { id: 'm3', from: 'us',   text: 'Confirmado! Entregas iniciam na segunda-feira.', time: '08:18', status: 'read' },
      { id: 'm4', from: 'them', text: 'Perfeito! Até logo.', time: '08:20', status: 'read' },
    ],
  },
  {
    id: '6', contact: 'Clínica Bem Estar', phone: '(11) 4456-7890', lastMessage: 'Não conseguimos entregar. Reagendar?', lastTime: '09:02', unread: 1, status: 'waiting',
    messages: [
      { id: 'm1', from: 'us',   text: 'Olá! Tentamos realizar a entrega mas não encontramos ninguém.', time: '09:00', status: 'read' },
      { id: 'm2', from: 'us',   text: 'Não conseguimos entregar. Reagendar?', time: '09:02', status: 'delivered' },
    ],
  },
  {
    id: '7', contact: 'Ana Costa', phone: '(11) 9 8765-4321', lastMessage: 'Entrega agendada para 14h. ✅', lastTime: '07:30', unread: 0, status: 'active',
    messages: [
      { id: 'm1', from: 'them', text: 'Oi, posso receber meu pedido após as 14h?', time: '07:22', status: 'read' },
      { id: 'm2', from: 'us',   text: 'Olá Ana! Sem problema, vamos remarcar para 14h.', time: '07:28', status: 'read' },
      { id: 'm3', from: 'us',   text: 'Entrega agendada para 14h. ✅', time: '07:30', status: 'read' },
    ],
  },
];

function MsgStatusIcon({ status }: { status: MsgStatus }) {
  if (status === 'pending')   return <Clock className="h-3 w-3 text-muted-foreground" />;
  if (status === 'sent')      return <Check className="h-3 w-3 text-muted-foreground" />;
  if (status === 'delivered') return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
  if (status === 'read')      return <CheckCheck className="h-3 w-3 text-blue-400" />;
  if (status === 'failed')    return <AlertCircle className="h-3 w-3 text-red-400" />;
  return null;
}

function ContactAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={cn(
      'rounded-full bg-gold-500/15 border border-gold-500/20 flex items-center justify-center font-bold text-gold-400 shrink-0',
      size === 'sm' ? 'h-9 w-9 text-xs' : 'h-11 w-11 text-sm'
    )}>
      {initials}
    </div>
  );
}

export function WhatsAppPage() {
  const [selectedId, setSelectedId] = useState<string>('2');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | ConvStatus>('all');
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const conversation = MOCK_CONVERSATIONS.find((c) => c.id === selectedId);

  const filtered = useMemo(() => MOCK_CONVERSATIONS.filter((c) => {
    const matchFilter = filter === 'all' || c.status === filter;
    const q = search.toLowerCase();
    const matchSearch = !q || c.contact.toLowerCase().includes(q) || c.phone.includes(q);
    return matchFilter && matchSearch;
  }), [filter, search]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedId]);

  const kpis = useMemo(() => ({
    sent:     MOCK_CONVERSATIONS.reduce((s, c) => s + c.messages.filter((m) => m.from === 'us').length, 0),
    active:   MOCK_CONVERSATIONS.filter((c) => c.status === 'active' || c.status === 'waiting').length,
    unread:   MOCK_CONVERSATIONS.reduce((s, c) => s + c.unread, 0),
    resolved: MOCK_CONVERSATIONS.filter((c) => c.status === 'resolved').length,
  }), []);

  const FILTER_TABS: { key: 'all' | ConvStatus; label: string }[] = [
    { key: 'all',     label: 'Todas' },
    { key: 'waiting', label: 'Aguardando' },
    { key: 'active',  label: 'Ativas' },
    { key: 'bot',     label: 'Bot' },
    { key: 'resolved',label: 'Resolvidas' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">WhatsApp</h1>
          <p className="text-muted-foreground">Central de atendimento e notificações via WhatsApp</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-md shadow-gold-500/20">
          <Send className="h-4 w-4" />
          Nova Mensagem
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-gold-500/10">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><MessageSquare className="h-4 w-4 text-gold-400" /></div>
            <div><p className="text-lg font-bold">{kpis.sent}</p><p className="text-xs text-muted-foreground">Enviadas hoje</p></div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><Users className="h-4 w-4 text-green-400" /></div>
            <div><p className="text-lg font-bold text-green-400">{kpis.active}</p><p className="text-xs text-muted-foreground">Conversas ativas</p></div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/10">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10"><Clock className="h-4 w-4 text-yellow-400" /></div>
            <div><p className="text-lg font-bold text-yellow-400">{kpis.unread}</p><p className="text-xs text-muted-foreground">Não respondidas</p></div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/10">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><TrendingUp className="h-4 w-4 text-blue-400" /></div>
            <div><p className="text-lg font-bold text-blue-400">{kpis.resolved}</p><p className="text-xs text-muted-foreground">Resolvidas</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Chat layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 rounded-xl border border-gold-500/10 overflow-hidden" style={{ height: '56vh' }}>
        {/* Lista de conversas */}
        <div className="border-r border-border flex flex-col bg-card">
          {/* Busca */}
          <div className="p-3 border-b border-border space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar conversa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-full"
              />
            </div>
            <div className="flex gap-1 flex-wrap">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={cn(
                    'px-2 py-0.5 rounded-full text-[10px] font-medium transition-all',
                    filter === tab.key
                      ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filtered.map((conv) => {
              const cfg = CONV_STATUS_CONFIG[conv.status];
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                  className={cn(
                    'w-full text-left p-3 flex items-start gap-3 hover:bg-gold-500/5 transition-colors',
                    selectedId === conv.id && 'bg-gold-500/8 border-l-2 border-gold-500'
                  )}
                >
                  <div className="relative">
                    <ContactAvatar name={conv.contact} size="sm" />
                    <span className={cn('absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card', cfg.dot)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-sm font-semibold truncate">{conv.contact}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{conv.lastTime}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="h-5 w-5 rounded-full bg-green-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Área do chat */}
        <div className="lg:col-span-2 flex flex-col bg-card">
          {conversation ? (
            <>
              {/* Header do chat */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-3">
                  <ContactAvatar name={conversation.contact} />
                  <div>
                    <p className="font-semibold text-sm">{conversation.contact}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Circle className={cn('h-2 w-2 fill-current', CONV_STATUS_CONFIG[conversation.status].color)} />
                      {conversation.phone} · {CONV_STATUS_CONFIG[conversation.status].label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <Filter className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
                {conversation.messages.map((msg) => (
                  <div key={msg.id} className={cn('flex', msg.from === 'us' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm',
                      msg.from === 'us'
                        ? 'bg-gold-500/20 border border-gold-500/20 text-foreground rounded-br-sm'
                        : 'bg-card border border-border text-foreground rounded-bl-sm'
                    )}>
                      <p className="leading-relaxed">{msg.text}</p>
                      <div className={cn('flex items-center gap-1 mt-1', msg.from === 'us' ? 'justify-end' : 'justify-start')}>
                        <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                        {msg.from === 'us' && <MsgStatusIcon status={msg.status} />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border bg-card">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                    <Smile className="h-4 w-4" />
                  </button>
                  <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <input
                    type="text"
                    placeholder="Digite uma mensagem..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setInput(''); }}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50"
                  />
                  {input
                    ? (
                      <button
                        onClick={() => setInput('')}
                        className="p-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-black transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    ) : (
                      <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
                        <Mic className="h-4 w-4" />
                      </button>
                    )
                  }
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Selecione uma conversa</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
