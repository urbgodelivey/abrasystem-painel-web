import { useState } from 'react';
import {
  Settings, Bell, Shield, Database, RefreshCw, Save,
  CheckCircle2, Moon, Sun, Monitor, Smartphone, Wifi,
  Lock, Key, Download, Trash2, Clock,
  ToggleLeft, ToggleRight, ChevronRight, Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';

function Section({ icon, title, description, children }: {
  icon: React.ReactNode; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <Card className="border-gold-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold-500/10 text-gold-400">{icon}</div>
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function Toggle({ enabled, onChange, label, description }: {
  enabled: boolean; onChange: () => void; label: string; description?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      <button
        onClick={onChange}
        className={cn('shrink-0 transition-colors', enabled ? 'text-gold-400' : 'text-muted-foreground')}
      >
        {enabled
          ? <ToggleRight className="h-7 w-7" />
          : <ToggleLeft className="h-7 w-7" />
        }
      </button>
    </div>
  );
}

const LOG_ENTRIES = [
  { time: '09:14:22', level: 'info',  event: 'Entrega #ENT-001 marcada como entregue',                 user: 'Carlos' },
  { time: '09:12:05', level: 'info',  event: 'NFS-e #RPS-142 autorizada pela prefeitura',              user: 'Sistema' },
  { time: '09:08:31', level: 'warn',  event: 'Tentativa de login falhou — IP: 177.12.34.56',           user: 'Sistema' },
  { time: '09:02:10', level: 'info',  event: 'WhatsApp: 3 mensagens enviadas via template entrega_saiu',user: 'Sistema' },
  { time: '08:45:00', level: 'info',  event: 'Usuário Fernanda Lima fez login',                        user: 'Fernanda' },
  { time: '08:30:12', level: 'error', event: 'Falha ao enviar WhatsApp para (11) 9 9234-5678',         user: 'Sistema' },
  { time: '08:15:44', level: 'info',  event: 'Backup automático concluído — 4,2 GB',                   user: 'Sistema' },
  { time: '08:00:00', level: 'info',  event: 'Sistema iniciado — versão 1.0.0',                        user: 'Sistema' },
];

const LEVEL_CONFIG = {
  info:  { color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20',   label: 'INFO' },
  warn:  { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'WARN' },
  error: { color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',      label: 'ERRO' },
};

type Theme = 'dark' | 'light' | 'system';

export function SistemaPage() {
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useUIStore();

  // Notificações
  const [notifEntregas, setNotifEntregas]         = useState(true);
  const [notifFinanceiro, setNotifFinanceiro]       = useState(true);
  const [notifWhatsApp, setNotifWhatsApp]           = useState(true);
  const [notifSistema, setNotifSistema]             = useState(false);

  // Segurança
  const [twoFactor, setTwoFactor]                   = useState(false);
  const [sessionTimeout, setSessionTimeout]         = useState(true);
  const [ipWhitelist, setIpWhitelist]               = useState(false);
  const [auditLog, setAuditLog]                     = useState(true);

  // Backup
  const [autoBackup, setAutoBackup]                 = useState(true);
  const [backupWhatsApp, setBackupWhatsApp]         = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sistema</h1>
          <p className="text-muted-foreground">Aparência, notificações, segurança e configurações gerais</p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            'inline-flex items-center gap-2 font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-md',
            saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-gold-500 hover:bg-gold-600 text-black shadow-gold-500/20'
          )}
        >
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Salvo!' : 'Salvar Configurações'}
        </button>
      </div>

      {/* Status do sistema */}
      <Card className="border-green-500/10 bg-green-500/3">
        <CardContent className="p-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-green-400">Sistema Operacional</span>
          </div>
          {[
            { label: 'Versão',    value: 'v1.0.0' },
            { label: 'Uptime',    value: '14 dias, 6h' },
            { label: 'CPU',       value: '12%' },
            { label: 'Memória',   value: '1,8 GB / 8 GB' },
            { label: 'DB',        value: 'Online · 42ms' },
            { label: 'Último backup', value: 'Hoje 08:15' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-sm font-semibold mt-0.5">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aparência */}
        <Section icon={<Monitor className="h-5 w-5" />} title="Aparência" description="Tema e personalização visual do sistema">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Tema</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { key: 'dark' as Theme,   label: 'Escuro',  icon: <Moon className="h-5 w-5" /> },
                  { key: 'light' as Theme,  label: 'Claro',   icon: <Sun className="h-5 w-5" /> },
                  { key: 'system' as Theme, label: 'Sistema', icon: <Monitor className="h-5 w-5" /> },
                ] as const).map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={cn(
                      'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-sm',
                      theme === key
                        ? 'border-gold-500/40 bg-gold-500/8 text-gold-400'
                        : 'border-border text-muted-foreground hover:border-gold-500/20'
                    )}
                  >
                    {icon}
                    <span className="text-xs font-medium">{label}</span>
                    {theme === key && <CheckCircle2 className="h-3 w-3" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Densidade da Interface</p>
              <div className="flex gap-2">
                {['Compacta', 'Normal', 'Confortável'].map((d, i) => (
                  <button
                    key={d}
                    className={cn(
                      'flex-1 py-1.5 rounded-lg border text-xs font-medium transition-all',
                      i === 1
                        ? 'border-gold-500/40 bg-gold-500/8 text-gold-400'
                        : 'border-border text-muted-foreground hover:border-gold-500/20'
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Idioma do Sistema</p>
              <div className="relative">
                <select className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none">
                  <option>Português (Brasil)</option>
                  <option>English (US)</option>
                  <option>Español</option>
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none rotate-90" />
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <Smartphone className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">Modo Mobile</p>
                <p className="text-[11px] text-muted-foreground">Layout adaptado para uso em celular</p>
              </div>
              <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-semibold">Ativo</span>
            </div>
          </div>
        </Section>

        {/* Notificações */}
        <Section icon={<Bell className="h-5 w-5" />} title="Notificações" description="Configure quais alertas e avisos receber">
          <Toggle enabled={notifEntregas}   onChange={() => setNotifEntregas(!notifEntregas)}   label="Alertas de Entregas"   description="Notificar ao concluir, falhar ou atrasar entregas" />
          <Toggle enabled={notifFinanceiro} onChange={() => setNotifFinanceiro(!notifFinanceiro)} label="Alertas Financeiros"  description="Vencimentos, pagamentos e cobranças em atraso" />
          <Toggle enabled={notifWhatsApp}   onChange={() => setNotifWhatsApp(!notifWhatsApp)}   label="Mensagens WhatsApp"    description="Notificar quando receber resposta de cliente" />
          <Toggle enabled={notifSistema}    onChange={() => setNotifSistema(!notifSistema)}     label="Avisos do Sistema"     description="Manutenção, atualizações e status de serviços" />

          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Canal de Notificação</p>
            <div className="flex gap-2">
              {['E-mail', 'Push (App)', 'WhatsApp'].map((c, i) => (
                <label key={c} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" defaultChecked={i < 2} className="accent-gold-500 h-3.5 w-3.5" />
                  <span className="text-xs text-muted-foreground">{c}</span>
                </label>
              ))}
            </div>
          </div>
        </Section>

        {/* Segurança */}
        <Section icon={<Shield className="h-5 w-5" />} title="Segurança" description="Autenticação, sessões e controle de acesso">
          <Toggle enabled={twoFactor}      onChange={() => setTwoFactor(!twoFactor)}           label="Autenticação 2 Fatores (2FA)" description="Exigir código TOTP no login de todos os usuários" />
          <Toggle enabled={sessionTimeout} onChange={() => setSessionTimeout(!sessionTimeout)}  label="Timeout de Sessão"            description="Encerrar sessão após 30 minutos de inatividade" />
          <Toggle enabled={ipWhitelist}    onChange={() => setIpWhitelist(!ipWhitelist)}        label="Whitelist de IPs"             description="Permitir acesso apenas de IPs cadastrados" />
          <Toggle enabled={auditLog}       onChange={() => setAuditLog(!auditLog)}              label="Log de Auditoria"             description="Registrar todas as ações dos usuários" />

          <div className="mt-4 flex gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-xs text-muted-foreground transition-colors">
              <Key className="h-3.5 w-3.5" />
              Rotacionar Chaves de API
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs text-red-400 transition-colors">
              <Lock className="h-3.5 w-3.5" />
              Encerrar Todas as Sessões
            </button>
          </div>
        </Section>

        {/* Backup */}
        <Section icon={<Database className="h-5 w-5" />} title="Backup e Dados" description="Configurações de backup automático e exportação">
          <Toggle enabled={autoBackup}   onChange={() => setAutoBackup(!autoBackup)}     label="Backup Automático Diário"  description="Salvar backup completo toda noite às 08:00" />
          <Toggle enabled={backupWhatsApp} onChange={() => setBackupWhatsApp(!backupWhatsApp)} label="Backup do Histórico WhatsApp" description="Incluir conversas e mídias no backup" />

          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Últimos Backups</p>
            {[
              { date: 'Hoje, 08:15',        size: '4,2 GB', status: 'ok' },
              { date: 'Ontem, 08:15',       size: '4,1 GB', status: 'ok' },
              { date: '12/05/2026, 08:15',  size: '4,0 GB', status: 'ok' },
            ].map(({ date, size, status }) => (
              <div key={date} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  <p className="text-xs font-medium">{date}</p>
                  <p className="text-[10px] text-muted-foreground">{size}</p>
                </div>
                <button className="p-1 rounded hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors">
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-xs text-muted-foreground transition-colors">
              <RefreshCw className="h-3.5 w-3.5" />
              Fazer Backup Agora
            </button>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-xs text-muted-foreground transition-colors">
              <Download className="h-3.5 w-3.5" />
              Exportar Todos os Dados
            </button>
          </div>
        </Section>
      </div>

      {/* Log do Sistema */}
      <Section icon={<Activity className="h-5 w-5" />} title="Log do Sistema" description="Registro de eventos, ações e alertas recentes">
        <div className="space-y-1">
          {LOG_ENTRIES.map((entry, i) => {
            const cfg = LEVEL_CONFIG[entry.level as keyof typeof LEVEL_CONFIG];
            return (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0 hover:bg-gold-500/3 transition-colors rounded px-1">
                <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold border shrink-0 mt-0.5', cfg.bg, cfg.color)}>
                  {cfg.label}
                </span>
                <p className="text-xs font-mono text-muted-foreground shrink-0 mt-0.5 w-16">{entry.time}</p>
                <p className="text-xs flex-1 leading-relaxed">{entry.event}</p>
                <p className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{entry.user}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex gap-2">
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-xs text-muted-foreground transition-colors">
            <Download className="h-3.5 w-3.5" />
            Exportar Log Completo
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs text-red-400 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
            Limpar Logs Antigos
          </button>
        </div>
      </Section>

    </div>
  );
}
