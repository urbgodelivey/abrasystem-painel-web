import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { StatusBar } from './StatusBar';
import { useUIStore } from '@/store/ui.store';
import { cn } from '@/lib/utils';

export function Shell() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'
        )}
      >
        <Header />
        <main className="flex-1 overflow-y-auto pt-16 pb-7">
          <div className="p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
        <StatusBar />
      </div>
    </div>
  );
}
