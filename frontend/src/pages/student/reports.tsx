/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Response } from "../../lib/api";
import toast from "react-hot-toast";
import { Eye } from "lucide-react";

const Reports = () => {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResponses();
  }, []);

  const loadResponses = async () => {
    try {
      const res = await Response.getMyResponse();
      setResponses(res.data);
    } catch (error) {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Exam Reports</h1>
      
      {responses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No exam reports available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {responses.map((response) => (
            <div key={response.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {response.exam.title}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Score</p>
                      <p className="text-lg font-bold text-blue-600">
                        {response.analyses?.scoreAnalysis?.marksObtained || 0}/{response.exam.totalScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Percentage</p>
                      <p className="text-lg font-bold text-green-600">
                        {response.analyses?.scoreAnalysis?.percentage || 0}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Grade</p>
                      <p className="text-lg font-bold text-purple-600">
                        {response.analyses?.scoreAnalysis?.grade || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="text-lg font-medium text-gray-700">
                        {response.duration} min
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Domain: {response.exam.domain}</span>
                    <span>Questions: {response.exam.questionCount}</span>
                    <span>Date: {new Date(response.createdAt).toLocaleDateString()}</span>
                  </div>
                  {response.isTerminated && (
                    <div className="mt-3 px-3 py-2 bg-red-100 text-red-700 rounded inline-block text-sm font-medium">
                      Terminated: {response.terminatedReason}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate(`/response/view/${response.id}`)}
                  className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Analysis
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
