/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Dashboard } from "../../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { BookOpen, Users, FileText, CheckCircle, Clock } from "lucide-react";

export const FacultyDashboard = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await Dashboard.getFaculty();
      setData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!data) return <div className="text-center py-8">Loading...</div>;

  const statsCards = [
    { title: "Total Channels", value: data.totalChannels, icon: Users, color: "bg-blue-500" },
    { title: "Total Exams", value: data.totalExams, icon: BookOpen, color: "bg-purple-500" },
    { title: "Total Assignments", value: data.totalAssignments, icon: FileText, color: "bg-green-500" },
    { title: "Exam Responses", value: data.totalExamResponses, icon: CheckCircle, color: "bg-orange-500" },
    { title: "Current Assignments", value: data.currentAssignments, icon: Clock, color: "bg-red-500" },
  ];

  const examChartData = data.examStats.map((e: any) => ({
    name: e.title.length > 15 ? e.title.substring(0, 15) + "..." : e.title,
    responses: e._count.responses,
  }));

  const assignmentChartData = data.assignmentStats.map((a: any) => ({
    name: a.title.length > 15 ? a.title.substring(0, 15) + "..." : a.title,
    responses: a._count.responses,
  }));

  const pieData = [
    { name: "Exams", value: data.totalExams },
    { name: "Assignments", value: data.totalAssignments },
  ];

  const COLORS = ["#8b5cf6", "#10b981"];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Faculty Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
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
          <h2 className="text-xl font-semibold mb-4">Exam Responses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={examChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="responses" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Assignment Responses</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={assignmentChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="responses" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Content Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={(entry) => entry.name} outerRadius={80} fill="#8884d8" dataKey="value">
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Responses</h2>
          <div className="space-y-3">
            {data.recentResponses.map((r: any) => (
              <div key={r.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{r.student.name}</p>
                  <p className="text-sm text-gray-500">{r.exam.title}</p>
                </div>
                <p className="text-sm text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Exams</h2>
          <div className="space-y-3">
            {data.recentExams.map((e: any) => (
              <div key={e.id} className="flex justify-between items-center border-b pb-2">
                <p className="font-medium">{e.title}</p>
                <p className="text-sm text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Assignments</h2>
          <div className="space-y-3">
            {data.recentAssignments.map((a: any) => (
              <div key={a.id} className="flex justify-between items-center border-b pb-2">
                <p className="font-medium">{a.title}</p>
                <p className="text-sm text-gray-400">{new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
