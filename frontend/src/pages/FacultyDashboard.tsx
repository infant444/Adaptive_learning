import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, BookOpen, FileText, BarChart } from 'lucide-react';

export const FacultyDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-purple-600 mr-3" />
              <h1 className="text-xl font-semibold">Adaptive Learning - Faculty</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">My Courses</p>
                  <p className="text-2xl font-semibold">8</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Students</p>
                  <p className="text-2xl font-semibold">156</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Assignments</p>
                  <p className="text-2xl font-semibold">24</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <BarChart className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Avg Score</p>
                  <p className="text-2xl font-semibold">85%</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Faculty Profile</h2>
            <div className="space-y-3">
              <div className="flex">
                <span className="font-medium w-32">Name:</span>
                <span className="text-gray-700">{user?.name}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Email:</span>
                <span className="text-gray-700">{user?.email}</span>
              </div>
              <div className="flex">
                <span className="font-medium w-32">Role:</span>
                <span className="text-gray-700 capitalize">{user?.role}</span>
              </div>
              {user?.university && (
                <div className="flex">
                  <span className="font-medium w-32">University:</span>
                  <span className="text-gray-700">{user.university}</span>
                </div>
              )}
              {user?.collegeName && (
                <div className="flex">
                  <span className="font-medium w-32">College:</span>
                  <span className="text-gray-700">{user.collegeName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};