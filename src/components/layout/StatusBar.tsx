import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';
import { Wifi, User, Building } from 'lucide-react';

export function StatusBar() {
  const user = useAuthStore((s) => s.user);
  const companies = useAuthStore((s) => s.companies);
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  const activeCompany = companies.find((c) => c.id === activeCompanyId);

  return (
    <footer
      className={cn(
        'fixed bottom-0 right-0 z-30 flex h-7 items-center justify-between border-t bg-muted/50 px-4 text-[11px] text-muted-foreground transition-all duration-300',
        sidebarCollapsed ? 'left-[68px]' : 'left-[260px]'
      )}
    >
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <User className="h-3 w-3" /> {user?.name ?? 'Carlos'}
        </span>
        <span className="flex items-center gap-1">
          <Building className="h-3 w-3" /> {activeCompany?.name ?? '—'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Wifi className="h-3 w-3 text-green-500" /> Conectado
        </span>
        <span>v1.0.0</span>
      </div>
    </footer>
  );
}
