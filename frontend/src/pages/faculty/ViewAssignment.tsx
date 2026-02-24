/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Assignment, AssignmentResponse } from "../../lib/api";
import toast from "react-hot-toast";
import { Calendar, FileText, Users, ArrowLeft, Eye, Send, Download } from "lucide-react";

const AssignmentDetails = ({ assignment }: { assignment: any }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">{assignment.title}</h2>
      <p className="text-gray-600 mb-4">{assignment.description}</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-gray-500" />
          <span>Type: {assignment.projectType}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <span>Due: {new Date(assignment.lastDate).toLocaleDateString()}</span>
        </div>
        <div>
          <span className="font-semibold">Total Score:</span> {assignment.totalScore}
        </div>
        {assignment.isQuestions && (
          <>
            <div>
              <span className="font-semibold">Exam Type:</span> {assignment.examType}
            </div>
            <div>
              <span className="font-semibold">Questions:</span> {assignment.questionCount}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StudentResponses = ({ responses, onReload }: { responses: any[]; onReload: () => void }) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<any>(null);
  const [score, setScore] = useState("");
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const viewAnalysis = (response: any, type?: string) => {
    if (type === 'project') {
      const analysis = response.analyses;
      if (analysis) {
        const parsed = typeof analysis === 'string' ? JSON.parse(analysis) : analysis;
        setSelectedAnalysis(parsed);
        setShowModal(true);
      }
    } else {
      // For question analysis, show the response array directly
      const studentAnswers = response.response;
      if (studentAnswers) {
        const parsed = typeof studentAnswers === 'string' ? JSON.parse(studentAnswers) : studentAnswers;
        setSelectedAnalysis({ studentAnswers: parsed, responseAnalysis: response.responseAnalysis });
        setShowModal(true);
      }
    }
  };

  const openFeedbackModal = (response: any) => {
    setSelectedResponse(response);
    setScore(response.score || "");
    setReview(response.review || "");
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = async () => {
    if (!score) {
      toast.error("Please enter a score");
      return;
    }
    setSubmitting(true);
    try {
      await AssignmentResponse.sendFeedback(selectedResponse.id, {
        score: parseInt(score),
        review
      });
      toast.success("Feedback sent successfully");
      setShowFeedbackModal(false);
      onReload();
    } catch (error) {
      toast.error("Failed to send feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <h2 className="text-xl font-bold">Student Submissions ({responses.length})</h2>
        </div>
        <button
          onClick={() => {
            const csv = [
              ['Name', 'Email', 'Submitted Date', 'Score', 'Total', 'Status'].join(','),
              ...responses.map(r => [
                r.student.name,
                r.student.email,
                new Date(r.createdAt).toLocaleDateString(),
                r.yourScore || '-',
                r.totalScore,
                r.response ? 'Completed' : 'Pending'
              ].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'assignment_responses.csv';
            a.click();
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>
      {responses.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No submissions yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">Student</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Submitted</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {responses.map((response) => (
                <tr key={response.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{response.student.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{response.student.email}</td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(response.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {response.response ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm">
                        Completed
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {response.yourScore || "-"}/{response.totalScore}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {response.attachment && (
                        <a
                          href={response.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View File
                        </a>
                      )}
                      {response.analyses && (
                        <button
                          onClick={() => viewAnalysis(response, 'project')}
                          className="text-green-600 hover:underline text-sm flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Project Analysis
                        </button>
                      )}
                      <button
                        onClick={() => openFeedbackModal(response)}
                        className="text-purple-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <Send className="w-4 h-4" />
                        Grade
                      </button>
                      {response.responseAnalysis && (
                        <button
                          onClick={() => viewAnalysis(response, 'question')}
                          className="text-orange-600 hover:underline text-sm flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          Question Analysis
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {showModal && selectedAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Analysis Report</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            {selectedAnalysis.projectOverview ? (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Project Overview</h3>
                  <p className="font-semibold">{selectedAnalysis.projectOverview.title}</p>
                  <p className="text-gray-700 mt-2">{selectedAnalysis.projectOverview.description}</p>
                  <div className="mt-3">
                    <p className="font-semibold">Objectives:</p>
                    <ul className="list-disc pl-5">
                      {selectedAnalysis.projectOverview.objectives?.map((obj: string, i: number) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Technical Details</h3>
                  <p><span className="font-semibold">Technologies:</span> {selectedAnalysis.technicalDetails.technologies?.join(', ')}</p>
                  <p><span className="font-semibold">Languages:</span> {selectedAnalysis.technicalDetails.languages?.join(', ')}</p>
                  <p className="mt-2">{selectedAnalysis.technicalDetails.architecture}</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">AI Content Analysis</h3>
                  <p><span className="font-semibold">AI Generated:</span> {selectedAnalysis.aiContentAnalysis.estimatedAIGeneratedPercentage}%</p>
                  <p><span className="font-semibold">Originality Score:</span> {selectedAnalysis.aiContentAnalysis.originalityScore}%</p>
                  {selectedAnalysis.aiContentAnalysis.suspiciousSections?.length > 0 && (
                    <div className="mt-2">
                      <p className="font-semibold">Suspicious Sections:</p>
                      {selectedAnalysis.aiContentAnalysis.suspiciousSections.map((s: any, i: number) => (
                        <div key={i} className="ml-4 mt-1">
                          <p className="text-sm">• {s.section} - {s.reason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Quality Assessment</h3>
                  <p><span className="font-semibold">Completeness:</span> {selectedAnalysis.qualityAssessment.completeness}%</p>
                  <p><span className="font-semibold">Technical Accuracy:</span> {selectedAnalysis.qualityAssessment.technicalAccuracy}%</p>
                  <p><span className="font-semibold">Documentation:</span> {selectedAnalysis.qualityAssessment.documentationQuality}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Recommendations</h3>
                  <p className="font-semibold">Areas for Improvement:</p>
                  <ul className="list-disc pl-5">
                    {selectedAnalysis.recommendations.areasForImprovement?.map((area: string, i: number) => (
                      <li key={i}>{area}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-100 p-4 rounded-lg">
                  <p className="font-semibold">Overall Assessment:</p>
                  <p>{selectedAnalysis.overallAssessment}</p>
                </div>
              </div>
            ) : selectedAnalysis.studentAnswers ? (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Student Responses Summary</h3>
                  <p><span className="font-semibold">Total Questions:</span> {selectedAnalysis.studentAnswers.length}</p>
                  <p><span className="font-semibold">Correct:</span> {selectedAnalysis.studentAnswers.filter((q: any) => q.answer === q.correctAnswer).length}</p>
                  <p><span className="font-semibold">Wrong:</span> {selectedAnalysis.studentAnswers.filter((q: any) => q.answer !== q.correctAnswer).length}</p>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-lg">Question-wise Breakdown</h3>
                  {selectedAnalysis.studentAnswers.map((q: any, i: number) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">Q{i + 1}: {q.question}</p>
                        <span className={`px-2 py-1 rounded text-sm ${
                          q.answer === q.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {q.answer === q.correctAnswer ? '✓ Correct' : '✗ Wrong'}
                        </span>
                      </div>
                      {q.options && (
                        <div className="mb-2">
                          <p className="text-sm text-gray-600"><span className="font-semibold">Options:</span></p>
                          <ul className="text-sm ml-4">
                            {Object.entries(q.options).map(([key, value]: [string, any]) => (
                              <li key={key} className={`${
                                key === q.answer ? 'font-semibold text-blue-600' : ''
                              } ${key === q.correctAnswer ? 'text-green-600' : ''}`}>
                                {key}. {value} {key === q.correctAnswer && '✓'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="text-sm"><span className="font-semibold">Student Answer:</span> {q.answer}</p>
                      <p className="text-sm"><span className="font-semibold">Correct Answer:</span> {q.correctAnswer}</p>
                      {q.explanation && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded"><span className="font-semibold">Explanation:</span> {q.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedAnalysis.questionWiseAnalysis ? (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Score Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <p><span className="font-semibold">Marks:</span> {selectedAnalysis.scoreAnalysis?.marksObtained}/{selectedAnalysis.scoreAnalysis?.totalMarks}</p>
                    <p><span className="font-semibold">Percentage:</span> {selectedAnalysis.scoreAnalysis?.percentage}%</p>
                    <p><span className="font-semibold">Grade:</span> {selectedAnalysis.scoreAnalysis?.grade}</p>
                    <p><span className="font-semibold">Level:</span> {selectedAnalysis.scoreAnalysis?.performanceLevel}</p>
                  </div>
                </div>

                <div className="bg-white border rounded-lg">
                  <h3 className="font-bold text-lg p-4 border-b">Question-wise Analysis</h3>
                  {selectedAnalysis.questionWiseAnalysis?.map((q: any, i: number) => (
                    <div key={i} className="p-4 border-b last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">Q{q.questionNumber}: {q.question}</p>
                        <span className={`px-2 py-1 rounded text-sm ${q.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {q.marksAwarded}/{q.maxMarks}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Student Answer:</span> {q.studentAnswer}</p>
                      <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Correct Answer:</span> {q.correctAnswer}</p>
                      <p className="text-sm text-blue-600">{q.feedback}</p>
                    </div>
                  ))}
                </div>

                {selectedAnalysis.mistakeAnalysis?.length > 0 && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">Mistake Analysis</h3>
                    {selectedAnalysis.mistakeAnalysis.map((m: any, i: number) => (
                      <div key={i} className="mb-3 last:mb-0">
                        <p className="font-semibold">Q{m.questionNumber} - {m.topic}</p>
                        <p className="text-sm text-gray-700"><span className="font-semibold">Mistake:</span> {m.mistake}</p>
                        <p className="text-sm text-gray-700"><span className="font-semibold">How to Improve:</span> {m.howToImprove}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Strengths</h3>
                  <ul className="list-disc pl-5">
                    {selectedAnalysis.strengths?.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-pink-50 p-4 rounded-lg">
                  <p className="italic">{selectedAnalysis.motivationalMessage}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Score Analysis</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <p><span className="font-semibold">Marks:</span> {selectedAnalysis.scoreAnalysis?.marksObtained}/{selectedAnalysis.scoreAnalysis?.totalMarks}</p>
                    <p><span className="font-semibold">Percentage:</span> {selectedAnalysis.scoreAnalysis?.percentage}%</p>
                    <p><span className="font-semibold">Grade:</span> {selectedAnalysis.scoreAnalysis?.grade}</p>
                    <p><span className="font-semibold">Level:</span> {selectedAnalysis.scoreAnalysis?.performanceLevel}</p>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Strengths</h3>
                  <ul className="list-disc pl-5">
                    {selectedAnalysis.strengths?.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Areas for Improvement</h3>
                  {selectedAnalysis.areasForImprovement?.map((area: any, i: number) => (
                    <div key={i} className="mb-3">
                      <p className="font-semibold">{area.area}</p>
                      <p className="text-sm text-gray-700">{area.currentLevel}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Overall Feedback</h3>
                  <p>{selectedAnalysis.overallFeedback?.summary}</p>
                </div>

                <div className="bg-pink-50 p-4 rounded-lg">
                  <p className="italic">{selectedAnalysis.motivationalMessage}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showFeedbackModal && selectedResponse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Send Grade & Review</h2>
            <p className="text-gray-600 mb-4">Student: {selectedResponse.student.name}</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Score (out of {selectedResponse.totalScore})</label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                max={selectedResponse.totalScore}
                min="0"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter score"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Review (Optional)</label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
                placeholder="Write your review..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFeedbackModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
              >
                {submitting ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ViewAssignment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [assignmentRes, responsesRes] = await Promise.all([
        Assignment.getById(id!),
        AssignmentResponse.getAssignmentResponse(id!)
      ]);
      setAssignment(assignmentRes.data);
      setResponses(responsesRes.data);
    } catch (error) {
      toast.error("Failed to load assignment");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
      
      {assignment && <AssignmentDetails assignment={assignment} />}
      <StudentResponses responses={responses} onReload={loadData} />
    </div>
  );
};

export default ViewAssignment;
