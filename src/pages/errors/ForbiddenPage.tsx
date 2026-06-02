import { ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
      <div className="p-4 rounded-full bg-destructive/10">
        <ShieldOff className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold">Acesso Negado</h1>
      <p className="text-muted-foreground max-w-sm">
        Você não tem permissão para acessar este módulo. Entre em contato com o administrador do sistema.
      </p>
      <Button variant="outline" onClick={() => navigate('/dashboard')}>
        Voltar ao Dashboard
      </Button>
    </div>
  );
}
