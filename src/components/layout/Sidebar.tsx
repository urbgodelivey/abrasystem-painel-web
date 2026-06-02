import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { SIDEBAR_GROUPS } from '@/lib/constants';
import {
  LayoutDashboard, Package, Map, Users, Bike, Factory, Calculator,
  TrendingUp, TrendingDown, Wallet, Building2, FileText, ScrollText,
  FileCheck, Settings2, MessageCircle, FileCode, History, Building,
  UserCog, Shield, Cog, ChevronLeft, ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Mapa de ícones Lucide por nome
const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard, Package, Map, Users, Bike, Factory, Calculator,
  TrendingUp, TrendingDown, Wallet, Building2, FileText, ScrollText,
  FileCheck, Settings2, MessageCircle, FileCode, History, Building,
  UserCog, Shield, Cog,
};

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const permissions = useAuthStore((s) => s.user?.permissions ?? []);
  const isAdmin = permissions.includes('admin');
  const location = useLocation();

  const hasPermission = (perm: string | null) => {
    if (!perm || isAdmin) return true;
    return permissions.includes(perm);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300',
        sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="Dog King"
              className="h-9 w-9 rounded-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="text-base font-black leading-tight tracking-wide">
                <span className="text-brand-500">DOG</span>
                <span className="text-gold-400"> KING</span>
              </span>
              <span className="text-[8px] tracking-[0.15em] text-brand-500/60 uppercase">
                O Melhor Delivery
              </span>
            </div>
          </div>
        )}
        {sidebarCollapsed && (
          <img
            src="/logo.png"
            alt="DK"
            className="h-8 w-8 rounded-full object-contain mx-auto"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = document.createElement('span');
              fallback.className = 'text-brand-500 font-black text-lg';
              fallback.textContent = 'DK';
              target.parentElement?.appendChild(fallback);
            }}
          />
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-brand-500/50 hover:text-brand-400"
          title={sidebarCollapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-6">
        {SIDEBAR_GROUPS.map((group) => {
          const visibleItems = group.items.filter((item) =>
            hasPermission(item.permission)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label}>
              {!sidebarCollapsed && (
                <p className="px-4 mb-2 text-[10px] font-bold tracking-widest text-gold-600/40 uppercase">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5 px-2">
                {visibleItems.map((item) => {
                  const Icon = iconMap[item.icon] || LayoutDashboard;
                  const isActive = location.pathname === item.path;

                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 group',
                        isActive
                          ? 'bg-brand-500/15 text-brand-400 font-medium border border-brand-500/20'
                          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-gold-400/80'
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0 transition-colors',
                          isActive ? 'text-brand-500' : 'text-sidebar-foreground/40 group-hover:text-gold-500/70'
                        )}
                      />
                      {!sidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Versão no rodapé */}
      <div className="border-t border-sidebar-border p-3 text-center">
        {!sidebarCollapsed && (
          <p className="text-[10px] text-gold-700/40">v1.0.0</p>
        )}
      </div>
    </aside>
  );
}
