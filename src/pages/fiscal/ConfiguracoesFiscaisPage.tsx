import { useState } from 'react';
import {
  Settings, Building2, ShieldCheck, FileText, Percent,
  CheckCircle2, AlertCircle, Upload, RefreshCw, Save,
  ChevronRight, Server, Link2, KeyRound, Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Env = 'producao' | 'homologacao';
type RegimeTrib = 'simples' | 'presumido' | 'real';

interface SectionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}

function Section({ icon, title, description, children }: SectionProps) {
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

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function InputField({ value, placeholder, mono }: { value: string; placeholder?: string; mono?: boolean }) {
  return (
    <input
      defaultValue={value}
      placeholder={placeholder}
      className={cn(
        'w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 transition-colors',
        mono && 'font-mono'
      )}
    />
  );
}

function SelectField({ value, options }: { value: string; options: { key: string; label: string }[] }) {
  return (
    <div className="relative">
      <select
        defaultValue={value}
        className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none"
      >
        {options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
      </select>
      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none rotate-90" />
    </div>
  );
}

function StatusChip({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
      ok ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'
    )}>
      {ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
      {label}
    </span>
  );
}

const ISS_RATES = [
  { code: '17.06', service: 'Serviços de transporte e logística',      rate: 2.0 },
  { code: '17.07', service: 'Serviços de coleta e entrega de encomendas', rate: 2.0 },
  { code: '10.09', service: 'Armazenagem, depósito, carga e descarga', rate: 3.0 },
  { code: '17.01', service: 'Assessoria em gestão operacional',         rate: 5.0 },
];

export function ConfiguracoesFiscaisPage() {
  const [env, setEnv] = useState<Env>('producao');
  const [regime, setRegime] = useState<RegimeTrib>('simples');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configurações Fiscais</h1>
          <p className="text-muted-foreground">Dados tributários, certificado digital e parâmetros de emissão</p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            'inline-flex items-center gap-2 font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-md',
            saved
              ? 'bg-green-500 text-white shadow-green-500/20'
              : 'bg-gold-500 hover:bg-gold-600 text-black shadow-gold-500/20'
          )}
        >
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Salvo!' : 'Salvar Alterações'}
        </button>
      </div>

      {/* Ambiente */}
      <div className="flex gap-3">
        {(['producao', 'homologacao'] as Env[]).map((e) => (
          <button
            key={e}
            onClick={() => setEnv(e)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition-all',
              env === e
                ? e === 'producao'
                  ? 'border-green-500/40 bg-green-500/8 text-green-400'
                  : 'border-yellow-500/40 bg-yellow-500/8 text-yellow-400'
                : 'border-border bg-card text-muted-foreground hover:border-gold-500/20'
            )}
          >
            <Server className="h-4 w-4" />
            {e === 'producao' ? 'Produção' : 'Homologação (Testes)'}
            {env === e && <CheckCircle2 className="h-3.5 w-3.5 ml-1" />}
          </button>
        ))}
      </div>

      {env === 'homologacao' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-yellow-500/8 border border-yellow-500/20 text-yellow-400 text-sm">
          <Info className="h-4 w-4 shrink-0" />
          Ambiente de homologação ativo — documentos emitidos não têm validade fiscal.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Fiscais */}
        <Section
          icon={<Building2 className="h-5 w-5" />}
          title="Dados Fiscais da Empresa"
          description="Informações tributárias da empresa emissora"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Field label="Razão Social">
                <InputField value="AbraSystem Logística Ltda" />
              </Field>
            </div>
            <Field label="CNPJ">
              <InputField value="00.000.000/0001-00" mono />
            </Field>
            <Field label="Inscrição Estadual">
              <InputField value="Isento" mono />
            </Field>
            <Field label="Inscrição Municipal">
              <InputField value="12.345.678-9" mono />
            </Field>
            <Field label="Regime Tributário">
              <div className="relative">
                <select
                  value={regime}
                  onChange={(e) => setRegime(e.target.value as RegimeTrib)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none"
                >
                  <option value="simples">Simples Nacional</option>
                  <option value="presumido">Lucro Presumido</option>
                  <option value="real">Lucro Real</option>
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none rotate-90" />
              </div>
            </Field>
            <div className="col-span-2">
              <Field label="Endereço Fiscal">
                <InputField value="Av. Paulista, 1000 — Bela Vista, São Paulo/SP — CEP 01310-100" />
              </Field>
            </div>
          </div>
        </Section>

        {/* Certificado Digital */}
        <Section
          icon={<KeyRound className="h-5 w-5" />}
          title="Certificado Digital"
          description="Certificado A1 ou A3 para assinatura de documentos fiscais"
        >
          <div className="space-y-4">
            {/* Status certificado */}
            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Certificado A1</p>
                  <p className="text-xs text-muted-foreground mt-0.5 font-mono">CN=ABRASYSTEM LOGISTICA LTDA:00000000000100</p>
                </div>
                <StatusChip ok label="Válido" />
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-muted-foreground">Válido até</p>
                  <p className="font-semibold text-green-400 mt-0.5">14/05/2027</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Emitido por</p>
                  <p className="font-semibold mt-0.5">SERPRO-ACF</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tipo</p>
                  <p className="font-semibold mt-0.5">e-CNPJ A1</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Dias restantes</p>
                  <p className="font-semibold text-green-400 mt-0.5">365 dias</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border bg-muted/50 hover:border-gold-500/30 hover:bg-gold-500/5 text-sm text-muted-foreground hover:text-gold-400 transition-all">
                <Upload className="h-4 w-4" />
                Substituir Certificado
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
                Validar
              </button>
            </div>
          </div>
        </Section>

        {/* Config NFS-e */}
        <Section
          icon={<FileText className="h-5 w-5" />}
          title="Parâmetros NFS-e"
          description="Configurações de emissão de nota fiscal de serviço"
        >
          <div className="grid grid-cols-2 gap-4">
            <Field label="Município de Prestação">
              <InputField value="São Paulo" />
            </Field>
            <Field label="Código do Município (IBGE)">
              <InputField value="3550308" mono />
            </Field>
            <Field label="Série RPS">
              <InputField value="1" mono />
            </Field>
            <Field label="Número RPS Atual">
              <InputField value="142" mono />
            </Field>
            <Field label="Código de Serviço Padrão" hint="Código LC 116/2003">
              <InputField value="17.06" mono />
            </Field>
            <Field label="Alíquota ISS Padrão (%)">
              <InputField value="2,00" mono />
            </Field>
            <div className="col-span-2">
              <Field label="Descrição Padrão do Serviço">
                <textarea
                  defaultValue="Serviços de logística e entrega expressa de mercadorias."
                  rows={2}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 resize-none"
                />
              </Field>
            </div>
            <div className="col-span-2 flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <input type="checkbox" id="iss-retido" className="accent-gold-500 h-4 w-4" defaultChecked={false} />
              <div>
                <label htmlFor="iss-retido" className="text-sm font-medium cursor-pointer">Permitir ISS Retido na Fonte</label>
                <p className="text-[11px] text-muted-foreground">Habilita a opção de retenção do ISS pelo tomador do serviço</p>
              </div>
            </div>
          </div>
        </Section>

        {/* Integrações */}
        <Section
          icon={<Link2 className="h-5 w-5" />}
          title="Integrações e Webservices"
          description="Conexão com SEFAZ, prefeitura e provedores de NFS-e"
        >
          <div className="space-y-3">
            {[
              { name: 'SEFAZ Nacional (NF-e/CT-e)',    status: true,  endpoint: 'https://www.nfe.fazenda.gov.br/NFeAutorizacao4', last: '14/05/2026 08:30' },
              { name: 'Prefeitura de São Paulo (NFS-e)',status: true,  endpoint: 'https://nfe.prefeitura.sp.gov.br/ws/lotenfe.asmx', last: '14/05/2026 09:15' },
              { name: 'SEFAZ Contingência (DPEC)',      status: false, endpoint: 'https://www.nfe.fazenda.gov.br/DPEC',             last: 'Nunca testado' },
            ].map((svc) => (
              <div key={svc.name} className="p-3 rounded-xl bg-muted/50 border border-border space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className={cn('h-2 w-2 rounded-full shrink-0', svc.status ? 'bg-green-500' : 'bg-muted-foreground')} />
                    <p className="text-sm font-semibold">{svc.name}</p>
                  </div>
                  <StatusChip ok={svc.status} label={svc.status ? 'Online' : 'Não testado'} />
                </div>
                <p className="text-[10px] font-mono text-muted-foreground truncate">{svc.endpoint}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-muted-foreground">Último ping: {svc.last}</p>
                  <button className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-gold-400 transition-colors">
                    <RefreshCw className="h-2.5 w-2.5" />
                    Testar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Tabela de alíquotas ISS */}
      <Section
        icon={<Percent className="h-5 w-5" />}
        title="Alíquotas ISS por Serviço"
        description="Tabela de alíquotas configuradas conforme LC 116/2003"
      >
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <colgroup>
              <col style={{ width: '12%' }} />
              <col style={{ width: '58%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '15%' }} />
            </colgroup>
            <thead>
              <tr className="bg-muted/60 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <th className="px-4 py-2.5 text-left">Código LC 116</th>
                <th className="px-4 py-2.5 text-left">Descrição do Serviço</th>
                <th className="px-4 py-2.5 text-right">Alíquota ISS</th>
                <th className="px-4 py-2.5 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ISS_RATES.map((r) => (
                <tr key={r.code} className="hover:bg-gold-500/5 transition-colors group">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-bold text-gold-500">{r.code}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm">{r.service}</p>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-bold text-blue-400">{r.rate.toFixed(2).replace('.', ',')}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="p-1.5 rounded opacity-0 group-hover:opacity-100 hover:bg-gold-500/10 text-muted-foreground hover:text-gold-400 transition-all">
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-border bg-muted/30 hover:border-gold-500/30 hover:bg-gold-500/5 text-sm text-muted-foreground hover:text-gold-400 transition-all">
          <ShieldCheck className="h-4 w-4" />
          Adicionar Serviço / Alíquota
        </button>
      </Section>
    </div>
  );
}
