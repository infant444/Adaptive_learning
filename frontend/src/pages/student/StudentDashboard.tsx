/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Dashboard } from "../../lib/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { BookOpen, Users, FileText, CheckCircle, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const StudentDashboard = () => {
  const [data, setData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await Dashboard.getStudent();
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!data) return <div className="text-center py-8">Loading...</div>;

  const statsCards = [
    { title: "My Channels", value: data.totalChannels, icon: Users, color: "bg-blue-500" },
    { title: "Available Exams", value: data.totalExams, icon: BookOpen, color: "bg-purple-500" },
    { title: "Assignments", value: data.totalAssignments, icon: FileText, color: "bg-green-500" },
    { title: "Completed Exams", value: data.completedExams, icon: CheckCircle, color: "bg-orange-500" },
    { title: "Completed Assignments", value: data.completedAssignments, icon: CheckCircle, color: "bg-teal-500" },
    { title: "Average Score", value: data.avgScore.toFixed(1), icon: TrendingUp, color: "bg-red-500" },
  ];

  const performanceData = data.performanceStats.map((p: any, idx: number) => ({
    name: `Test ${idx + 1}`,
    score: p.yourScore,
    total: p.exam.totalScore,
    percentage: ((p.yourScore / p.exam.totalScore) * 100).toFixed(1),
  }));

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statsCards.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Performance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Score Percentage</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="percentage" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Exam Responses</h2>
          <div className="space-y-3">
            {data.recentExamResponses.map((r: any) => (
              <div key={r.id} className="flex justify-between items-center border-b pb-2 cursor-pointer" onClick={()=>navigate("/response/view/"+r.id)}>
                <div>
                  <p className="font-medium">{r.exam.title}</p>
                  <p className="text-sm text-gray-500">Score: {r.yourScore || "Pending"}</p>
                </div>
                <p className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Assignment Submissions</h2>
          <div className="space-y-3">
            {data.recentAssignmentResponses.map((r: any) => (
              <div key={r.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{r.assignment.title}</p>
                  <p className="text-sm text-gray-500">Score: {r.yourScore || "Pending"}</p>
                </div>
                <p className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Exams
          </h2>
          <div className="space-y-3">
            {data.upcomingExams.length > 0 ? (
              data.upcomingExams.map((e: any) => (
                <div key={e.id} className="flex justify-between items-center border-b pb-2">
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-gray-400">{new Date(e.startAt).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No upcoming exams</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Assignments
          </h2>
          <div className="space-y-3">
            {data.pendingAssignments.length > 0 ? (
              data.pendingAssignments.map((a: any) => (
                <div key={a.id} className="flex justify-between items-center border-b pb-2">
                  <p className="font-medium">{a.assignment.title}</p>
                  <p className="text-sm text-gray-400">{new Date(a.assignment.lastDate).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No pending assignments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
