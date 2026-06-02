import { useState } from 'react';
import {
  Building2, MapPin, Phone, Mail, Globe, Upload,
  Save, CheckCircle2, Edit, Camera, Star, Package,
  ChevronRight, Zap, Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div className={cn('space-y-1.5', span2 && 'col-span-2')}>
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
    </div>
  );
}

function Input({ defaultValue, placeholder, mono }: { defaultValue?: string; placeholder?: string; mono?: boolean }) {
  return (
    <input
      defaultValue={defaultValue}
      placeholder={placeholder}
      className={cn(
        'w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50',
        mono && 'font-mono'
      )}
    />
  );
}

function Select({ defaultValue, options }: { defaultValue: string; options: string[] }) {
  return (
    <div className="relative">
      <select
        defaultValue={defaultValue}
        className="w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-gold-500/50 appearance-none"
      >
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none rotate-90" />
    </div>
  );
}

export function EmpresaPage() {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Empresa</h1>
          <p className="text-muted-foreground">Dados cadastrais, endereço e configurações da empresa</p>
        </div>
        <button
          onClick={handleSave}
          className={cn(
            'inline-flex items-center gap-2 font-semibold px-4 py-2 rounded-lg text-sm transition-all shadow-md',
            saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-gold-500 hover:bg-gold-600 text-black shadow-gold-500/20'
          )}
        >
          {saved ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Salvo!' : 'Salvar Alterações'}
        </button>
      </div>

      {/* Logo + plano */}
      <Card className="border-gold-500/10 bg-gradient-to-r from-gold-500/5 to-transparent">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Logo */}
          <div className="relative">
            <div className="h-24 w-24 rounded-2xl bg-gold-500/15 border-2 border-dashed border-gold-500/30 flex items-center justify-center">
              <div className="text-center">
                <Building2 className="h-8 w-8 text-gold-500/50 mx-auto" />
                <p className="text-[10px] text-gold-500/50 mt-1">Logo</p>
              </div>
            </div>
            <button className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-full bg-gold-500 text-black flex items-center justify-center shadow-md hover:bg-gold-600 transition-colors">
              <Camera className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold">AbraSystem Logística Ltda</h2>
            <p className="text-sm text-muted-foreground mt-0.5">CNPJ: 00.000.000/0001-00</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/15 border border-gold-500/30 text-gold-400 text-xs font-semibold">
                <Star className="h-3 w-3" />
                Plano Professional
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
                <Zap className="h-3 w-3" />
                Ativo
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center sm:border-l sm:border-border sm:pl-6">
            {[
              { label: 'Usuários', value: '8/20' },
              { label: 'Entregas/mês', value: '2.180' },
              { label: 'Armazenamento', value: '4,2 GB' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-sm font-bold">{value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dados Gerais */}
        <Section icon={<Building2 className="h-5 w-5" />} title="Dados da Empresa" description="Informações cadastrais e jurídicas">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Razão Social" span2>
              <Input defaultValue="AbraSystem Logística Ltda" />
            </Field>
            <Field label="Nome Fantasia" span2>
              <Input defaultValue="AbraSystem" />
            </Field>
            <Field label="CNPJ">
              <Input defaultValue="00.000.000/0001-00" mono />
            </Field>
            <Field label="Inscrição Estadual">
              <Input defaultValue="Isento" />
            </Field>
            <Field label="Inscrição Municipal">
              <Input defaultValue="12.345.678-9" mono />
            </Field>
            <Field label="Regime Tributário">
              <Select defaultValue="Simples Nacional" options={['Simples Nacional', 'Lucro Presumido', 'Lucro Real']} />
            </Field>
            <Field label="Segmento" span2>
              <Select defaultValue="Logística e Entregas" options={['Logística e Entregas', 'E-commerce', 'Alimentação', 'Saúde', 'Varejo', 'Outro']} />
            </Field>
          </div>
        </Section>

        {/* Endereço */}
        <Section icon={<MapPin className="h-5 w-5" />} title="Endereço" description="Endereço da sede operacional">
          <div className="grid grid-cols-2 gap-4">
            <Field label="CEP">
              <Input defaultValue="01310-100" mono />
            </Field>
            <Field label="Estado">
              <Select defaultValue="SP" options={['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO', 'DF']} />
            </Field>
            <Field label="Cidade" span2>
              <Input defaultValue="São Paulo" />
            </Field>
            <Field label="Bairro">
              <Input defaultValue="Bela Vista" />
            </Field>
            <Field label="Número">
              <Input defaultValue="1000" />
            </Field>
            <Field label="Logradouro" span2>
              <Input defaultValue="Av. Paulista" />
            </Field>
            <Field label="Complemento" span2>
              <Input defaultValue="Sala 42 — Edifício Premium" />
            </Field>
          </div>
        </Section>

        {/* Contato */}
        <Section icon={<Phone className="h-5 w-5" />} title="Contato" description="Canais de atendimento da empresa">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Telefone">
              <Input defaultValue="(11) 3000-0000" />
            </Field>
            <Field label="WhatsApp">
              <Input defaultValue="(11) 9 9000-0000" />
            </Field>
            <Field label="E-mail Geral" span2>
              <Input defaultValue="contato@abrasystem.com.br" />
            </Field>
            <Field label="E-mail Financeiro">
              <Input defaultValue="financeiro@abrasystem.com.br" />
            </Field>
            <Field label="E-mail Suporte">
              <Input defaultValue="suporte@abrasystem.com.br" />
            </Field>
            <Field label="Site" span2>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input defaultValue="www.abrasystem.com.br" />
              </div>
            </Field>
          </div>
        </Section>

        {/* Identidade Visual */}
        <Section icon={<Upload className="h-5 w-5" />} title="Identidade Visual" description="Logo, cores e personalização do sistema">
          <div className="space-y-4">
            {/* Upload logo */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Logo da Empresa</p>
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-gold-500/30 hover:bg-gold-500/3 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">Arraste ou clique para fazer upload</p>
                <p className="text-[10px] text-muted-foreground mt-1">PNG, JPG ou SVG — máx. 2 MB</p>
              </div>
            </div>

            {/* Cor primária */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Cor de Destaque</p>
              <div className="flex items-center gap-3">
                {['#DAA520', '#E53E3E', '#38A169', '#3182CE', '#805AD5', '#DD6B20'].map((color) => (
                  <button
                    key={color}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-all',
                      color === '#DAA520' ? 'border-white scale-110 shadow-md' : 'border-transparent hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div className="relative ml-2">
                  <input defaultValue="#DAA520" className="pl-3 pr-3 py-1.5 text-xs font-mono rounded-lg bg-muted border border-border focus:outline-none w-24" />
                </div>
              </div>
            </div>

            {/* Fuso horário + idioma */}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Fuso Horário">
                <Select defaultValue="America/Sao_Paulo (UTC-3)" options={['America/Sao_Paulo (UTC-3)', 'America/Manaus (UTC-4)', 'America/Recife (UTC-3)']} />
              </Field>
              <Field label="Idioma">
                <Select defaultValue="Português (BR)" options={['Português (BR)', 'English (US)', 'Español']} />
              </Field>
            </div>
          </div>
        </Section>
      </div>

      {/* Plano */}
      <Section icon={<Package className="h-5 w-5" />} title="Plano e Assinatura" description="Detalhes do plano contratado e limites de uso">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Plano',           value: 'Professional',   sub: 'R$ 499/mês',    color: 'text-gold-400' },
            { label: 'Renovação',       value: '14/06/2026',      sub: 'Próximo ciclo', color: '' },
            { label: 'Usuários',        value: '8 de 20',         sub: '12 disponíveis',color: 'text-green-400' },
            { label: 'Entregas/mês',    value: '2.180 de 5.000',  sub: '43,6% usado',   color: '' },
          ].map(({ label, value, sub, color }) => (
            <div key={label} className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={cn('text-sm font-bold mt-1', color)}>{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-black text-sm font-semibold transition-colors">
            <Zap className="h-4 w-4" />
            Fazer Upgrade
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted hover:bg-accent text-sm text-muted-foreground transition-colors">
            <Shield className="h-4 w-4" />
            Ver Histórico de Faturas
          </button>
        </div>
      </Section>
    </div>
  );
}
