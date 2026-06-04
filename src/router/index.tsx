import { Routes, Route, Navigate } from 'react-router-dom';
import { Shell } from '@/components/layout/Shell';
import { PrivateRoute } from '@/components/shared/PrivateRoute';
import { LoginPage } from '@/pages/login/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { EntregasPage } from '@/pages/entregas/EntregasPage';
import { MapaPage } from '@/pages/mapa/MapaPage';
import { LojasPage } from '@/pages/lojas/LojasPage';
import { EntregadoresPage } from '@/pages/entregadores/EntregadoresPage';
import { TabelasPrecoPage } from '@/pages/tabelas-preco/TabelasPrecoPage';
import { MotoboysPagarPage } from '@/pages/financeiro/MotoboysPagarPage';
import { DocumentosFiscaisPage } from '@/pages/fiscal/DocumentosFiscaisPage';
import { NfsePage } from '@/pages/fiscal/NfsePage';
import { ConfiguracoesFiscaisPage } from '@/pages/fiscal/ConfiguracoesFiscaisPage';
import { WhatsAppPage } from '@/pages/mensageria/WhatsAppPage';
import { TemplatesPage } from '@/pages/mensageria/TemplatesPage';
import { HistoricoPage } from '@/pages/mensageria/HistoricoPage';
import { EmpresaPage } from '@/pages/configuracoes/EmpresaPage';
import { UsuariosPage } from '@/pages/configuracoes/UsuariosPage';
import { PermissoesPage } from '@/pages/configuracoes/PermissoesPage';
import { SistemaPage } from '@/pages/configuracoes/SistemaPage';
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage';

export function AppRouter() {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rotas autenticadas */}
      <Route element={<PrivateRoute />}>
        <Route element={<Shell />}>
          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/entregas" element={<EntregasPage />} />
          <Route path="/mapa" element={<MapaPage />} />
          <Route path="/lojas" element={<LojasPage />} />
          <Route path="/entregadores" element={<EntregadoresPage />} />
          <Route path="/tabelas-preco" element={<TabelasPrecoPage />} />
          <Route path="/financeiro/motoboys" element={<MotoboysPagarPage />} />
          <Route path="/fiscal/documentos" element={<DocumentosFiscaisPage />} />
          <Route path="/fiscal/nfse" element={<NfsePage />} />
          <Route path="/fiscal/configuracoes" element={<ConfiguracoesFiscaisPage />} />
          <Route path="/mensageria/whatsapp" element={<WhatsAppPage />} />
          <Route path="/mensageria/templates" element={<TemplatesPage />} />
          <Route path="/mensageria/historico" element={<HistoricoPage />} />
          <Route path="/configuracoes/empresa" element={<EmpresaPage />} />
          <Route path="/configuracoes/usuarios" element={<UsuariosPage />} />
          <Route path="/configuracoes/perfis" element={<PermissoesPage />} />
          <Route path="/configuracoes/sistema" element={<SistemaPage />} />

          <Route path="/403" element={<ForbiddenPage />} />
        </Route>
      </Route>

      {/* Redirect padrão */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// Componente placeholder para módulos futuros
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="rounded-lg border border-dashed border-border p-12 text-center">
        <p className="text-muted-foreground">
          Módulo <strong>{title}</strong> será implementado nas próximas fases.
        </p>
      </div>
    </div>
  );
}
