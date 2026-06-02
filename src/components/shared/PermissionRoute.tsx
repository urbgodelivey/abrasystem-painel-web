import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';

interface PermissionRouteProps {
  permission: string;
}

export function PermissionRoute({ permission }: PermissionRouteProps) {
  const permissions = useAuthStore((s) => s.user?.permissions ?? []);
  const isAdmin = permissions.includes('admin');

  if (!isAdmin && !permissions.includes(permission)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
