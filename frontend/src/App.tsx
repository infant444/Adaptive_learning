/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { LoadingProvider } from "./context/LoadingContext";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { Dashboard } from "./pages/Dashboard";
import { OTPVerification } from "./pages/OTPVerification";
import { TestQuizGeneration } from "./pages/TestQuizGeneration";
import { Settings } from "./pages/Settings";
import { ChannelDetail } from "./pages/ChannelDetail";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleBasedRoute } from "./components/RoleBasedRoute";
import { PublicRoute } from "./components/PublicRoute";
import { FacultyLayout } from "./components/FacultyLayout";
import { StudentLayout } from "./components/StudentLayout";
import { FacultyChannels } from "./pages/faculty/FacultyChannels";
import { FacultyExams } from "./pages/faculty/FacultyExams";
import { CreateExamSingle } from "./pages/faculty/CreateExamSingle";
import StudentChannels from "./pages/student/StudentChannels";
import { StudentExams } from "./pages/student/StudentExams";
import { TakeExam } from "./pages/student/TakeExam";
import ViewExam from "./pages/faculty/viewExam";
import { NotFound } from "./pages/NotFound";
import AnalysisView from "./pages/AnalysisView";
import Reports from "./pages/student/reports";
import FacultyAssignment from "./pages/faculty/Assignment";
import StudentAssignment from "./pages/student/StudentAssignments";
import { TakeAssignmentTest } from "./pages/student/TakeAssignmentTest";
import ViewAssignment from "./pages/faculty/ViewAssignment";
import { FacultyDashboard } from "./pages/faculty/FacultyDashboard";
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { ForgotPassword } from "./pages/ForgotPassword";
function App() {
  return (
    <AuthProvider>
      <LoadingProvider>
        <Toaster position="top-right" />
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route
              path="/test-quiz"
              element={
                <ProtectedRoute>
                  <TestQuizGeneration />
                </ProtectedRoute>
              }
            />
            <Route
              path="/channel/:id"
              element={
                <ProtectedRoute>
                  <ChannelDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/join-channel/:id"
              element={
                <ProtectedRoute>
                  <ChannelDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/response/view/:responseId"
              element={
                <ProtectedRoute>
                  <AnalysisView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["faculty"]}>
                    <FacultyLayout />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            >
              
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="channels" element={<FacultyChannels />} />
              <Route path="exams" element={<FacultyExams />} />
              <Route path="exam/:id" element={<ViewExam />} />
              <Route path="exams/create" element={<CreateExamSingle />} />
              <Route path="projects" element={<FacultyAssignment />} />
              <Route path="project/:id" element={<ViewAssignment />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            <Route
              path="/student"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["student"]}>
                    <StudentLayout />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="exams" element={<StudentExams />} />
              <Route path="project-submit" element={<StudentAssignment />} />
              <Route path="settings" element={<Settings />} />
              <Route path="channel" element={<StudentChannels />} />
              <Route path="analysis" element={<Reports />} />
            </Route>
            <Route
              path="/student/assignment/test/:responseId"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["student"]}>
                    <TakeAssignmentTest />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/exam/:examId"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["student"]}>
                    <TakeExam />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default App;
