import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'teacher' || user?.role === 'faculty') {
    return <Navigate to="/faculty/dashboard" replace />;
  }

  return <Navigate to="/student/dashboard" replace />;
};