import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import {
  Bell, LogOut, ChevronDown, Sun, Moon, Wifi,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function Header() {
  const { user, tenant, companies, activeCompanyId, setActiveCompany, logout } = useAuthStore();
  const { sidebarCollapsed, theme, setTheme } = useUIStore();
  const navigate = useNavigate();
  const [companyMenuOpen, setCompanyMenuOpen] = useState(false);

  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 backdrop-blur-sm px-6 transition-all duration-300',
        sidebarCollapsed ? 'left-[68px]' : 'left-[260px]'
      )}
    >
      {/* Lado esquerdo — Empresa + Tenant */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setCompanyMenuOpen(!companyMenuOpen)}
            className="flex items-center gap-2 rounded-lg px-3 py-1.5 hover:bg-accent transition-colors"
          >
            <div className="text-left">
              <p className="text-sm font-semibold leading-tight">
                {activeCompany?.name ?? tenant?.name}
              </p>
              <p className="text-[11px] text-gold-500/70">{tenant?.plan}</p>
            </div>
            {companies.length > 1 && (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Dropdown de empresas */}
          {companyMenuOpen && companies.length > 1 && (
            <div className="absolute left-0 top-full mt-1 w-64 rounded-lg border bg-popover shadow-lg p-1 z-50 animate-fade-in">
              {companies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => {
                    setActiveCompany(company.id);
                    setCompanyMenuOpen(false);
                  }}
                  className={cn(
                    'w-full flex flex-col items-start rounded-md px-3 py-2 text-sm transition-colors',
                    company.id === activeCompanyId
                      ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                      : 'hover:bg-accent/50'
                  )}
                >
                  <span className="font-medium">{company.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {company.city}/{company.state}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lado direito — Ações */}
      <div className="flex items-center gap-2">
        {/* Status de conexão */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-2">
          <Wifi className="h-3.5 w-3.5 text-green-500" />
          <span className="hidden lg:inline">Conectado</span>
        </div>

        {/* Tema */}
        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Alternar tema">
          {theme === 'dark' ? <Sun className="h-4 w-4 text-gold-500/70" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notificações */}
        <Button variant="ghost" size="icon" className="relative" title="Notificações">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gold-500 text-[10px] font-bold text-black flex items-center justify-center">
            3
          </span>
        </Button>

        {/* Usuário */}
        <div className="flex items-center gap-3 ml-2 pl-4 border-l border-border">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium leading-tight">{user?.name ?? 'Carlos'}</p>
            <p className="text-[11px] text-muted-foreground">{user?.email ?? 'carlos@abrasystem.com.br'}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gold-500 to-gold-700 flex items-center justify-center text-black text-sm font-bold shadow-md shadow-gold-500/20">
            {user?.name?.charAt(0).toUpperCase() ?? 'C'}
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>
    </header>
  );
}
