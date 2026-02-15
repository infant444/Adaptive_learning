import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleBasedRoute = ({ children, allowedRoles }: RoleBasedRouteProps) => {
  const { user } = useAuth();

  if (!user?.role || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
