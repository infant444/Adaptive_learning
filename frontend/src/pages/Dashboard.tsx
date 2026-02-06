import { useAuth } from '../context/AuthContext';
import { StudentDashboard } from './StudentDashboard';
import { FacultyDashboard } from './FacultyDashboard';

export const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'student') {
    return <StudentDashboard />;
  }

  if (user?.role === 'faculty') {
    return <FacultyDashboard />;
  }

  return <StudentDashboard />;
};