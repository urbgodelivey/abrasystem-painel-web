import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export function PrivateRoute() {
  const { isAuthenticated, setAuth, user } = useAuthStore();
  const [checking, setChecking] = useState(!isAuthenticated);

  useEffect(() => {
    // Se já está autenticado no store, não precisa checar
    if (isAuthenticated) {
      setChecking(false);
      return;
    }

    // Verifica sessão ativa no Supabase (persiste entre refreshes)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session && session.user) {
        // Sessão válida — restaura o estado de auth
        try {
          // Tenta buscar perfil do usuário
          let userName = session.user.user_metadata?.name
            ?? session.user.email?.split('@')[0]
            ?? 'Usuário';

          let role = 'admin';
          let permissions = ['admin'];

          try {
            const { data: userRow } = await supabase
              .from('users')
              .select('name, role, is_tenant_owner')
              .eq('id', session.user.id)
              .single();

            if (userRow) {
              userName = userRow.name ?? userName;
              role = userRow.role ?? (userRow.is_tenant_owner ? 'owner' : 'user');
            }
          } catch {
            // tabela users não existe, usa fallback
          }

          setAuth({
            accessToken: session.access_token,
            refreshToken: session.refresh_token ?? '',
            user: {
              id: session.user.id,
              name: userName,
              email: session.user.email ?? '',
              avatar: session.user.user_metadata?.avatar_url ?? null,
              role,
              permissions,
            },
            tenant: {
              id: 'default',
              name: 'Dog King',
              status: 'active',
              plan: 'Pro',
            },
            companies: [],
          });
        } catch {
          // erro ao restaurar, vai pro login
        }
      }
      setChecking(false);
    });
  }, []);

  // Aguarda verificação antes de decidir rota
  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verificando sessão...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
