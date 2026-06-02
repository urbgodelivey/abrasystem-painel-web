import { useState, useMemo } from 'react';
import {
  LayoutTemplate, Plus, Search, Eye, Edit, Copy, Trash2,
  CheckCircle2, Clock, XCircle, ChevronDown, Filter,
  MessageSquare, Tag, Variable, Send,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TemplateStatus   = 'aprovado' | 'pendente' | 'rejeitado';
type TemplateCategory = 'notificacao' | 'confirmacao' | 'cobranca' | 'marketing' | 'suporte';

interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  status: TemplateStatus;
  language: string;
  body: string;
  variables: string[];
  usedLast30: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<TemplateStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
  aprovado:  { label: 'Aprovado',  color: 'text-green-400',        bg: 'bg-green-500/10 border-green-500/20',   icon: CheckCircle2 },
  pendente:  { label: 'Pendente',  color: 'text-yellow-400',       bg: 'bg-yellow-500/10 border-yellow-500/20', icon: Clock },
  rejeitado: { label: 'Rejeitado', color: 'text-red-400',          bg: 'bg-red-500/10 border-red-500/20',       icon: XCircle },
};

const CATEGORY_CONFIG: Record<TemplateCategory, { label: string; color: string; bg: string }> = {
  notificacao: { label: 'Notificação', color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  confirmacao: { label: 'Confirmação', color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
  cobranca:    { label: 'Cobrança',    color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  marketing:   { label: 'Marketing',   color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  suporte:     { label: 'Suporte',     color: 'text-gold-400',   bg: 'bg-gold-500/10 border-gold-500/20' },
};

const MOCK_TEMPLATES: Template[] = [
  {
    id: '1', name: 'entrega_saiu', category: 'notificacao', status: 'aprovado', language: 'pt_BR',
    body: 'Olá, *{{1}}*! 🚴 Sua entrega *{{2}}* saiu para entrega. Previsão de chegada: *{{3}}*. Acompanhe em tempo real pelo link: {{4}}',
    variables: ['nome_cliente', 'codigo_entrega', 'horario_eta', 'link_rastreio'],
    usedLast30: 312, createdAt: '10/01/2026', updatedAt: '02/04/2026',
  },
  {
    id: '2', name: 'entrega_concluida', category: 'confirmacao', status: 'aprovado', language: 'pt_BR',
    body: 'Entrega *{{1}}* concluída com sucesso! ✅\n\nCliente: *{{2}}*\nHorário: {{3}}\n\nAvalie nossa entrega: {{4}}',
    variables: ['codigo_entrega', 'nome_cliente', 'horario', 'link_avaliacao'],
    usedLast30: 298, createdAt: '10/01/2026', updatedAt: '02/04/2026',
  },
  {
    id: '3', name: 'entrega_ausente', category: 'notificacao', status: 'aprovado', language: 'pt_BR',
    body: 'Olá, *{{1}}*! Tentamos realizar sua entrega *{{2}}* mas não encontramos ninguém no endereço.\n\nDeseja *reagendar*? Responda com:\n1️⃣ Amanhã mesmo horário\n2️⃣ Escolher novo horário\n3️⃣ Retirar no depósito',
    variables: ['nome_cliente', 'codigo_entrega'],
    usedLast30: 47, createdAt: '15/01/2026', updatedAt: '10/03/2026',
  },
  {
    id: '4', name: 'cobranca_vencimento', category: 'cobranca', status: 'aprovado', language: 'pt_BR',
    body: 'Olá, *{{1}}*! Lembramos que sua fatura no valor de *{{2}}* vence em *{{3}}*.\n\nPague via PIX: {{4}}\n\nDúvidas? Responda esta mensagem.',
    variables: ['nome_cliente', 'valor_fatura', 'data_vencimento', 'chave_pix'],
    usedLast30: 89, createdAt: '20/01/2026', updatedAt: '01/04/2026',
  },
  {
    id: '5', name: 'cobranca_vencida', category: 'cobranca', status: 'aprovado', language: 'pt_BR',
    body: 'Olá, *{{1}}*! Sua fatura de *{{2}}* está em atraso desde *{{3}}*.\n\nRegularize agora e evite suspensão do serviço.\n\nLink de pagamento: {{4}}',
    variables: ['nome_cliente', 'valor_fatura', 'data_vencimento', 'link_pagamento'],
    usedLast30: 34, createdAt: '20/01/2026', updatedAt: '01/04/2026',
  },
  {
    id: '6', name: 'boas_vindas_cliente', category: 'marketing', status: 'aprovado', language: 'pt_BR',
    body: 'Bem-vindo(a) à *AbraSystem Logística*, *{{1}}*! 🎉\n\nEstamos prontos para entregar com agilidade e segurança.\n\nSeu código de cliente: *{{2}}*\n\nQualquer dúvida, estamos aqui! 😊',
    variables: ['nome_cliente', 'codigo_cliente'],
    usedLast30: 18, createdAt: '05/02/2026', updatedAt: '05/02/2026',
  },
  {
    id: '7', name: 'confirmacao_pedido', category: 'confirmacao', status: 'aprovado', language: 'pt_BR',
    body: 'Pedido *{{1}}* confirmado! ✅\n\nCliente: {{2}}\nItens: {{3}}\nTotal: *{{4}}*\nPrevisão de coleta: {{5}}',
    variables: ['codigo_pedido', 'nome_cliente', 'qtd_itens', 'valor_total', 'horario_coleta'],
    usedLast30: 156, createdAt: '10/01/2026', updatedAt: '15/03/2026',
  },
  {
    id: '8', name: 'promocao_fidelidade', category: 'marketing', status: 'pendente', language: 'pt_BR',
    body: 'Olá, *{{1}}*! 🌟 Você acumulou *{{2}} pontos* de fidelidade.\n\nResgate agora e ganhe *{{3}}* de desconto na próxima entrega!\n\nVálido até: {{4}}',
    variables: ['nome_cliente', 'pontos', 'desconto', 'data_validade'],
    usedLast30: 0, createdAt: '01/05/2026', updatedAt: '01/05/2026',
  },
  {
    id: '9', name: 'suporte_chamado', category: 'suporte', status: 'aprovado', language: 'pt_BR',
    body: 'Seu chamado *#{{1}}* foi aberto com sucesso.\n\nAssunto: {{2}}\nPrazo de resposta: *{{3}}*\n\nAcompanhe pelo link: {{4}}',
    variables: ['numero_chamado', 'assunto', 'prazo', 'link_chamado'],
    usedLast30: 12, createdAt: '20/02/2026', updatedAt: '20/02/2026',
  },
  {
    id: '10', name: 'aviso_manutencao', category: 'notificacao', status: 'rejeitado', language: 'pt_BR',
    body: 'AVISO: O sistema estará em manutenção no dia {{1}} das {{2}} às {{3}}. Pedidos poderão sofrer atraso.',
    variables: ['data', 'hora_inicio', 'hora_fim'],
    usedLast30: 0, createdAt: '10/04/2026', updatedAt: '12/04/2026',
  },
];

const FILTER_TABS: { key: 'all' | TemplateStatus; label: string }[] = [
  { key: 'all',       label: 'Todos' },
  { key: 'aprovado',  label: 'Aprovado' },
  { key: 'pendente',  label: 'Pendente' },
  { key: 'rejeitado', label: 'Rejeitado' },
];

function StatusBadge({ status }: { status: TemplateStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function CategoryBadge({ category }: { category: TemplateCategory }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border whitespace-nowrap', cfg.bg, cfg.color)}>
      <Tag className="h-2.5 w-2.5" />
      {cfg.label}
    </span>
  );
}

function renderPreview(body: string, variables: string[]) {
  let preview = body;
  variables.forEach((v, i) => {
    preview = preview.replace(
      new RegExp(`\\{\\{${i + 1}\\}\\}`, 'g'),
      `[${v}]`
    );
  });
  return preview;
}

export function TemplatesPage() {
  const [statusFilter, setStatusFilter] = useState<'all' | TemplateStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<TemplateCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);

  const filtered = useMemo(() => MOCK_TEMPLATES.filter((t) => {
    const matchStatus   = statusFilter === 'all' || t.status === statusFilter;
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const q = search.toLowerCase();
    const matchSearch   = !q || t.name.toLowerCase().includes(q) || t.body.toLowerCase().includes(q);
    return matchStatus && matchCategory && matchSearch;
  }), [statusFilter, categoryFilter, search]);

  const counts = useMemo(() => ({
    all:       MOCK_TEMPLATES.length,
    aprovado:  MOCK_TEMPLATES.filter((t) => t.status === 'aprovado').length,
    pendente:  MOCK_TEMPLATES.filter((t) => t.status === 'pendente').length,
    rejeitado: MOCK_TEMPLATES.filter((t) => t.status === 'rejeitado').length,
  }), []);

  const totalUsed = MOCK_TEMPLATES.filter((t) => t.status === 'aprovado').reduce((s, t) => s + t.usedLast30, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Templates</h1>
          <p className="text-muted-foreground">Modelos de mensagem aprovados pela Meta para envio em massa</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors shadow-md shadow-gold-500/20">
          <Plus className="h-4 w-4" />
          Novo Template
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-gold-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/10"><LayoutTemplate className="h-5 w-5 text-gold-400" /></div>
            <div><p className="text-xl font-bold">{MOCK_TEMPLATES.length}</p><p className="text-xs text-muted-foreground">Total Templates</p></div>
          </CardContent>
        </Card>
        <Card className="border-green-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10"><CheckCircle2 className="h-5 w-5 text-green-400" /></div>
            <div><p className="text-xl font-bold text-green-400">{counts.aprovado}</p><p className="text-xs text-muted-foreground">Aprovados</p></div>
          </CardContent>
        </Card>
        <Card className="border-yellow-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10"><Clock className="h-5 w-5 text-yellow-400" /></div>
            <div><p className="text-xl font-bold text-yellow-400">{counts.pendente}</p><p className="text-xs text-muted-foreground">Aguardando aprovação</p></div>
          </CardContent>
        </Card>
        <Card className="border-blue-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10"><Send className="h-5 w-5 text-blue-400" /></div>
            <div><p className="text-xl font-bold text-blue-400">{totalUsed.toLocaleString('pt-BR')}</p><p className="text-xs text-muted-foreground">Usos nos últimos 30d</p></div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-gold-500/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <CardTitle className="text-base flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4 text-gold-500" />
              Biblioteca de Templates
            </CardTitle>
            <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as TemplateCategory | 'all')}
                  className="pl-3 pr-7 py-1.5 text-xs rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none text-muted-foreground"
                >
                  <option value="all">Todas as categorias</option>
                  {Object.entries(CATEGORY_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar template..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 w-48"
                />
              </div>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border bg-muted hover:bg-accent transition-colors text-muted-foreground">
                <Filter className="h-3.5 w-3.5" />
                Exportar
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1 mt-2">
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
                <col style={{ width: '22%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '30%' }} />
                <col style={{ width: '12%' }} />
                <col style={{ width: '10%' }} />
                <col style={{ width: '12%' }} />
              </colgroup>
              <thead>
                <tr className="bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  <th className="px-4 py-2.5 text-left">Nome</th>
                  <th className="px-4 py-2.5 text-left">Categoria</th>
                  <th className="px-4 py-2.5 text-left">Corpo da mensagem</th>
                  <th className="px-4 py-2.5 text-center">Variáveis</th>
                  <th className="px-4 py-2.5 text-center">Usos/30d</th>
                  <th className="px-4 py-2.5 text-center">Status / Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-muted-foreground">
                      <LayoutTemplate className="h-10 w-10 mx-auto mb-3 opacity-20" />
                      <p>Nenhum template encontrado</p>
                    </td>
                  </tr>
                ) : filtered.map((t) => (
                  <>
                    <tr key={t.id} className="hover:bg-gold-500/5 transition-colors group">
                      {/* Nome */}
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-semibold text-gold-500">{t.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{t.language} · Atualizado {t.updatedAt}</p>
                      </td>

                      {/* Categoria */}
                      <td className="px-4 py-3">
                        <CategoryBadge category={t.category} />
                      </td>

                      {/* Corpo */}
                      <td className="px-4 py-3">
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {t.body.replace(/\*([^*]+)\*/g, '$1').substring(0, 100)}...
                        </p>
                      </td>

                      {/* Variáveis */}
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Variable className="h-3 w-3" />
                          {t.variables.length}
                        </span>
                      </td>

                      {/* Usos */}
                      <td className="px-4 py-3 text-center">
                        <span className={cn('text-sm font-bold', t.usedLast30 > 100 ? 'text-green-400' : t.usedLast30 > 0 ? '' : 'text-muted-foreground')}>
                          {t.usedLast30 > 0 ? t.usedLast30.toLocaleString('pt-BR') : '—'}
                        </span>
                      </td>

                      {/* Status + Ações */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1.5">
                          <StatusBadge status={t.status} />
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setPreviewId(previewId === t.id ? null : t.id)}
                              className="p-1 rounded hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors"
                              title="Preview"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1 rounded hover:bg-gold-500/10 text-muted-foreground hover:text-gold-400 transition-colors" title="Editar">
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1 rounded hover:bg-purple-500/10 text-muted-foreground hover:text-purple-400 transition-colors" title="Duplicar">
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                            <button className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors" title="Excluir">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Preview expandido */}
                    {previewId === t.id && (
                      <tr key={`${t.id}-preview`} className="bg-blue-500/3 border-l-2 border-blue-500/30">
                        <td colSpan={6} className="px-6 py-4">
                          <div className="flex gap-6 items-start">
                            {/* Preview do balão */}
                            <div className="shrink-0">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2 font-semibold">Preview</p>
                              <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-xs shadow-sm">
                                <p className="text-xs leading-relaxed whitespace-pre-wrap">
                                  {renderPreview(t.body, t.variables)}
                                </p>
                                <p className="text-[10px] text-muted-foreground text-right mt-1">09:15 ✓✓</p>
                              </div>
                            </div>

                            {/* Variáveis */}
                            <div className="flex-1">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2 font-semibold">
                                <Variable className="h-3 w-3 inline mr-1" />Variáveis ({t.variables.length})
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {t.variables.map((v, i) => (
                                  <span key={v} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted border border-border text-[11px] font-mono">
                                    <span className="text-gold-500">{`{{${i + 1}}}`}</span>
                                    <span className="text-muted-foreground">{v}</span>
                                  </span>
                                ))}
                              </div>
                              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                                <span>Criado em: {t.createdAt}</span>
                                <span>·</span>
                                <span>Atualizado em: {t.updatedAt}</span>
                                <span>·</span>
                                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{t.usedLast30} usos nos últimos 30 dias</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Templates filtrados</p>
              <p className="text-sm font-bold mt-0.5">{filtered.length}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Aprovados</p>
              <p className="text-sm font-bold text-green-400 mt-0.5">{filtered.filter((t) => t.status === 'aprovado').length}</p>
            </div>
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-muted-foreground">Usos (filtrado)</p>
              <p className="text-sm font-bold text-blue-400 mt-0.5">{filtered.reduce((s, t) => s + t.usedLast30, 0).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
