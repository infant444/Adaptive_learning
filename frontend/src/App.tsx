import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { OTPVerification } from './pages/OTPVerification';
import { TestQuizGeneration } from './pages/TestQuizGeneration';
import { Settings } from './pages/Settings';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { FacultyLayout } from './components/FacultyLayout';
import { StudentLayout } from './components/StudentLayout';
import { FacultyDashboardHome } from './pages/faculty/FacultyDashboardHome';
import { FacultyChannels } from './pages/faculty/FacultyChannels';
import { FacultyQuiz } from './pages/faculty/FacultyQuiz';
import { FacultyProjects } from './pages/faculty/FacultyProjects';
import { StudentDashboardHome } from './pages/student/StudentDashboardHome';
import { StudentQuiz } from './pages/student/StudentQuiz';
import { StudentProjectSubmit } from './pages/student/StudentProjectSubmit';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/test-quiz" element={<ProtectedRoute><TestQuizGeneration /></ProtectedRoute>} />
          
          <Route path="/faculty" element={<ProtectedRoute><FacultyLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<FacultyDashboardHome />} />
            <Route path="channels" element={<FacultyChannels />} />
            <Route path="quiz" element={<FacultyQuiz />} />
            <Route path="projects" element={<FacultyProjects />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/student" element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<StudentDashboardHome />} />
            <Route path="quiz" element={<StudentQuiz />} />
            <Route path="project-submit" element={<StudentProjectSubmit />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
