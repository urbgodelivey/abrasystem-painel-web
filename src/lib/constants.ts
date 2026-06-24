// ── Versão do sistema ─────────────────────
export const APP_VERSION = '1.0.0';
export const APP_NAME = 'Dog King';

// ── Grupos do Menu Lateral ────────────────
export const SIDEBAR_GROUPS = [
  {
    label: 'OPERAÇÃO',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/dashboard', permission: null },
      { id: 'deliveries', label: 'Entregas', icon: 'Package', path: '/entregas', permission: 'deliveries.view' },
      { id: 'live-map', label: 'Mapa ao Vivo', icon: 'Map', path: '/mapa', permission: 'deliveries.view' },
    ],
  },
  {
    label: 'CADASTROS',
    items: [
      { id: 'stores', label: 'Lojas', icon: 'Building2', path: '/lojas', permission: 'customers.view' },
      { id: 'deliverers', label: 'Entregadores', icon: 'Bike', path: '/entregadores', permission: 'deliverers.view' },
      { id: 'pricing', label: 'Tabelas de Preço', icon: 'Calculator', path: '/tabelas-preco', permission: 'pricing.view' },
    ],
  },
  {
    label: 'FINANCEIRO',
    items: [
      { id: 'motoboys-pagar', label: 'Motoboys a Pagar', icon: 'Bike', path: '/financeiro/motoboys', permission: 'financial.payables' },
    ],
  },
  {
    label: 'FISCAL',
    items: [
      { id: 'fiscal-docs', label: 'Documentos Fiscais', icon: 'ScrollText', path: '/fiscal/documentos', permission: 'fiscal.view' },
      { id: 'nfse', label: 'NFS-e', icon: 'FileCheck', path: '/fiscal/nfse', permission: 'fiscal.nfse' },
      { id: 'fiscal-config', label: 'Config. Fiscais', icon: 'Settings2', path: '/fiscal/configuracoes', permission: 'fiscal.config' },
    ],
  },
  {
    label: 'MENSAGERIA',
    items: [
      { id: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle', path: '/mensageria/whatsapp', permission: 'messaging.whatsapp' },
      { id: 'templates', label: 'Templates', icon: 'FileCode', path: '/mensageria/templates', permission: 'messaging.templates' },
      { id: 'msg-history', label: 'Histórico', icon: 'History', path: '/mensageria/historico', permission: 'messaging.history' },
    ],
  },
  {
    label: 'CONFIGURAÇÕES',
    items: [
      { id: 'company', label: 'Empresa', icon: 'Building', path: '/configuracoes/empresa', permission: 'settings.company' },
      { id: 'users', label: 'Usuários', icon: 'UserCog', path: '/configuracoes/usuarios', permission: 'settings.users' },
      { id: 'roles', label: 'Permissões', icon: 'Shield', path: '/configuracoes/perfis', permission: 'settings.roles' },
      { id: 'system', label: 'Sistema', icon: 'Cog', path: '/configuracoes/sistema', permission: 'settings.system' },
    ],
  },
] as const;
