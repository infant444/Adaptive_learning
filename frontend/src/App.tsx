import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider } from './context/LoadingContext';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { OTPVerification } from './pages/OTPVerification';
import { TestQuizGeneration } from './pages/TestQuizGeneration';
import { Settings } from './pages/Settings';
import { ChannelDetail } from './pages/ChannelDetail';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleBasedRoute } from './components/RoleBasedRoute';
import { PublicRoute } from './components/PublicRoute';
import { FacultyLayout } from './components/FacultyLayout';
import { StudentLayout } from './components/StudentLayout';
import { FacultyDashboardHome } from './pages/faculty/FacultyDashboardHome';
import { FacultyChannels } from './pages/faculty/FacultyChannels';
import { FacultyProjects } from './pages/faculty/FacultyProjects';
import { FacultyExams } from './pages/faculty/FacultyExams';
import { CreateExamSingle } from './pages/faculty/CreateExamSingle';
import { StudentDashboardHome } from './pages/student/StudentDashboardHome';
import { StudentProjectSubmit } from './pages/student/StudentProjectSubmit';
import StudentChannels from './pages/student/StudentChannels';
import { StudentExams } from './pages/student/StudentExams';
import { TakeExam } from './pages/student/TakeExam';
import ViewExam from './pages/faculty/viewExam';
import { NotFound } from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <Toaster position="top-right" />
        <Router>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/test-quiz" element={<ProtectedRoute><TestQuizGeneration /></ProtectedRoute>} />
            <Route path="/channel/:id" element={<ProtectedRoute><ChannelDetail /></ProtectedRoute>} />
            <Route path='/join-channel/:id' element={<ProtectedRoute><ChannelDetail/></ProtectedRoute>}/>
            
            <Route path="/faculty" element={<ProtectedRoute><RoleBasedRoute allowedRoles={['faculty']}><FacultyLayout /></RoleBasedRoute></ProtectedRoute>}>
              <Route path="dashboard" element={<FacultyDashboardHome />} />
              <Route path="channels" element={<FacultyChannels />} />
              <Route path="exams" element={<FacultyExams />} />
              <Route path="exam/:id"element={<ViewExam/>}/>
              <Route path="exams/create" element={<CreateExamSingle />} />
              <Route path="projects" element={<FacultyProjects />} />
              <Route path="settings" element={<Settings />} />

            </Route>

            <Route path="/student" element={<ProtectedRoute><RoleBasedRoute allowedRoles={['student']}><StudentLayout /></RoleBasedRoute></ProtectedRoute>}>
              <Route path="dashboard" element={<StudentDashboardHome />} />
              <Route path="exams" element={<StudentExams />} />
              <Route path="project-submit" element={<StudentProjectSubmit />} />
              <Route path="settings" element={<Settings />} />
              <Route path="channel" element={<StudentChannels />} />
            </Route>

            <Route path="/student/exam/:examId" element={<ProtectedRoute><RoleBasedRoute allowedRoles={['student']}><TakeExam /></RoleBasedRoute></ProtectedRoute>} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
