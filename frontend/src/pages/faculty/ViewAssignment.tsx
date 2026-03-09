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
                  <h3 className="font-bold text-lg mb-2">📋 Project Overview</h3>
                  <p className="font-semibold text-xl">{selectedAnalysis.projectOverview.title}</p>
                  <p className="text-gray-700 mt-2">{selectedAnalysis.projectOverview.description}</p>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="font-semibold">Objectives:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {selectedAnalysis.projectOverview.objectives?.map((obj: string, i: number) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold">Problem Statement:</p>
                      <p className="text-sm text-gray-700">{selectedAnalysis.projectOverview.problemStatement}</p>
                      {selectedAnalysis.projectOverview.targetUsers && (
                        <p className="text-sm mt-2"><span className="font-semibold">Target Users:</span> {selectedAnalysis.projectOverview.targetUsers}</p>
                      )}
                    </div>
                  </div>
                  {selectedAnalysis.projectOverview.innovation && (
                    <div className="mt-3 bg-white p-2 rounded">
                      <p className="text-sm"><span className="font-semibold">💡 Innovation:</span> {selectedAnalysis.projectOverview.innovation}</p>
                    </div>
                  )}
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">⚙️ Technical Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <p className="font-semibold">Technologies:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedAnalysis.technicalDetails.technologies?.map((tech: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs">{tech}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">Languages:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedAnalysis.technicalDetails.languages?.map((lang: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs">{lang}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="font-semibold">Architecture:</p>
                    <p className="text-sm text-gray-700">{selectedAnalysis.technicalDetails.architecture}</p>
                  </div>
                  {selectedAnalysis.technicalDetails.keyFeatures?.length > 0 && (
                    <div className="mt-3">
                      <p className="font-semibold">Key Features:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {selectedAnalysis.technicalDetails.keyFeatures.map((f: string, i: number) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {selectedAnalysis.implementationDetails && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">🔧 Implementation Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {selectedAnalysis.implementationDetails.modules?.length > 0 && (
                        <div>
                          <p className="font-semibold">Modules:</p>
                          <p className="text-gray-700">{selectedAnalysis.implementationDetails.modules.join(', ')}</p>
                        </div>
                      )}
                      {selectedAnalysis.implementationDetails.methodology && (
                        <div>
                          <p className="font-semibold">Methodology:</p>
                          <p className="text-gray-700">{selectedAnalysis.implementationDetails.methodology}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">🤖 AI Content Analysis</h3>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="bg-white p-3 rounded text-center">
                      <p className="text-2xl font-bold text-orange-600">{selectedAnalysis.aiContentAnalysis.estimatedAIGeneratedPercentage}%</p>
                      <p className="text-xs text-gray-600">AI Generated</p>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedAnalysis.aiContentAnalysis.originalityScore}%</p>
                      <p className="text-xs text-gray-600">Originality</p>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <p className="text-lg font-bold text-blue-600">{selectedAnalysis.aiContentAnalysis.writingStyleConsistency}</p>
                      <p className="text-xs text-gray-600">Style</p>
                    </div>
                  </div>
                  {selectedAnalysis.aiContentAnalysis.understandingIndicators?.length > 0 && (
                    <div className="mb-3">
                      <p className="font-semibold text-sm">✅ Understanding Indicators:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {selectedAnalysis.aiContentAnalysis.understandingIndicators.map((ind: string, i: number) => (
                          <li key={i} className="text-green-700">{ind}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedAnalysis.aiContentAnalysis.suspiciousSections?.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm">⚠️ Suspicious Sections:</p>
                      {selectedAnalysis.aiContentAnalysis.suspiciousSections.map((s: any, i: number) => (
                        <div key={i} className="bg-white p-2 rounded mt-2">
                          <p className="text-sm font-semibold">{s.section}</p>
                          <p className="text-xs text-gray-600">{s.reason}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            s.confidence === 'high' ? 'bg-red-100 text-red-700' :
                            s.confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>{s.confidence} confidence</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">📊 Quality Assessment</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded">
                      <p className="text-sm text-gray-600">Completeness</p>
                      <p className="text-xl font-bold">{selectedAnalysis.qualityAssessment.completeness}%</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-sm text-gray-600">Technical Accuracy</p>
                      <p className="text-xl font-bold">{selectedAnalysis.qualityAssessment.technicalAccuracy}%</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-sm text-gray-600">Documentation</p>
                      <p className="text-lg font-bold capitalize">{selectedAnalysis.qualityAssessment.documentationQuality}</p>
                    </div>
                    <div className="bg-white p-3 rounded">
                      <p className="text-sm text-gray-600">Code Quality</p>
                      <p className="text-lg font-bold capitalize">{selectedAnalysis.qualityAssessment.codeQuality}</p>
                    </div>
                  </div>
                </div>

                {selectedAnalysis.vivaQuestions?.length > 0 && (
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">❓ Viva Questions</h3>
                    <div className="space-y-3">
                      {selectedAnalysis.vivaQuestions.map((q: any, i: number) => (
                        <div key={i} className="bg-white p-3 rounded border-l-4 border-pink-400">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-sm">Q{i + 1}. {q.question}</p>
                            <span className={`text-xs px-2 py-1 rounded ${
                              q.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                              q.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>{q.difficulty}</span>
                          </div>
                          <p className="text-xs text-gray-600"><span className="font-semibold">Category:</span> {q.category}</p>
                          <p className="text-xs text-gray-500 italic mt-1">{q.purpose}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">💡 Recommendations</h3>
                  {selectedAnalysis.recommendations.strengths?.length > 0 && (
                    <div className="mb-3">
                      <p className="font-semibold text-green-700">✅ Strengths:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {selectedAnalysis.recommendations.strengths.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedAnalysis.recommendations.areasForImprovement?.length > 0 && (
                    <div className="mb-3">
                      <p className="font-semibold text-orange-700">⚠️ Areas for Improvement:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {selectedAnalysis.recommendations.areasForImprovement.map((area: string, i: number) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedAnalysis.recommendations.redFlags?.length > 0 && (
                    <div>
                      <p className="font-semibold text-red-700">🚩 Red Flags:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {selectedAnalysis.recommendations.redFlags.map((flag: string, i: number) => (
                          <li key={i}>{flag}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="font-semibold mb-2">📝 Overall Assessment:</p>
                  <p className="text-gray-800">{selectedAnalysis.overallAssessment}</p>
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
            ) : selectedAnalysis.projectUnderstanding ? (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">📊 Score Analysis</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white p-3 rounded text-center">
                      <p className="text-2xl font-bold text-blue-600">{selectedAnalysis.scoreAnalysis?.marksObtained}</p>
                      <p className="text-xs text-gray-600">Marks Obtained</p>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <p className="text-2xl font-bold text-gray-600">{selectedAnalysis.scoreAnalysis?.totalMarks}</p>
                      <p className="text-xs text-gray-600">Total Marks</p>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <p className="text-2xl font-bold text-green-600">{selectedAnalysis.scoreAnalysis?.percentage}%</p>
                      <p className="text-xs text-gray-600">Percentage</p>
                    </div>
                    <div className="bg-white p-3 rounded text-center">
                      <p className="text-lg font-bold text-purple-600">{selectedAnalysis.scoreAnalysis?.grade}</p>
                      <p className="text-xs text-gray-600">Grade</p>
                    </div>
                  </div>
                  {selectedAnalysis.scoreAnalysis?.graceMarksAwarded > 0 && (
                    <p className="text-sm text-green-600 mt-2">✨ Grace Marks Awarded: {selectedAnalysis.scoreAnalysis.graceMarksAwarded}</p>
                  )}
                </div>

                <div className="bg-white border rounded-lg">
                  <h3 className="font-bold text-lg p-4 border-b">📝 Question-wise Analysis</h3>
                  {selectedAnalysis.questionWiseAnalysis?.map((q: any, i: number) => (
                    <div key={i} className="p-4 border-b last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold">Q{q.questionNumber}: {q.question}</p>
                        <div className="text-right">
                          <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-700">
                            {q.marksAwarded}/{q.maxMarks}
                          </span>
                          {q.graceMarksAwarded > 0 && (
                            <p className="text-xs text-green-600 mt-1">+{q.graceMarksAwarded} grace</p>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded mb-2">
                        <p className="text-sm font-semibold text-gray-700">Student Answer:</p>
                        <p className="text-sm text-gray-800">{q.studentAnswer}</p>
                      </div>
                      {q.expectedKeyPoints?.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-semibold text-gray-700">Expected Key Points:</p>
                          <ul className="list-disc pl-5 text-sm text-gray-600">
                            {q.expectedKeyPoints.map((point: string, idx: number) => (
                              <li key={idx}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-sm font-semibold text-blue-700">Feedback:</p>
                        <p className="text-sm text-gray-700">{q.feedback}</p>
                      </div>
                      {q.strengthsInAnswer?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-green-700">✅ Strengths:</p>
                          <ul className="list-disc pl-5 text-xs text-green-600">
                            {q.strengthsInAnswer.map((s: string, idx: number) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {q.areasToImprove?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-orange-700">⚠️ Areas to Improve:</p>
                          <ul className="list-disc pl-5 text-xs text-orange-600">
                            {q.areasToImprove.map((a: string, idx: number) => (
                              <li key={idx}>{a}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">🎯 Project Understanding</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-semibold">Technical Depth:</p>
                      <p className="text-sm text-gray-700">{selectedAnalysis.projectUnderstanding.technicalDepth}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Conceptual Clarity:</p>
                      <p className="text-sm text-gray-700">{selectedAnalysis.projectUnderstanding.conceptualClarity}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Practical Knowledge:</p>
                      <p className="text-sm text-gray-700">{selectedAnalysis.projectUnderstanding.practicalKnowledge}</p>
                    </div>
                  </div>
                  <div className="mt-3 bg-white p-3 rounded">
                    <p className="text-sm font-semibold">Overall Comprehension:</p>
                    <p className="text-sm text-gray-700">{selectedAnalysis.projectUnderstanding.overallComprehension}</p>
                  </div>
                </div>

                {selectedAnalysis.conceptualAnalysis && (
                  <div className="bg-white border rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-3">🧠 Conceptual Analysis</h3>
                    {selectedAnalysis.conceptualAnalysis.strongConcepts?.length > 0 && (
                      <div className="mb-3">
                        <p className="font-semibold text-green-700">✅ Strong Concepts:</p>
                        <ul className="list-disc pl-5 text-sm">
                          {selectedAnalysis.conceptualAnalysis.strongConcepts.map((c: string, i: number) => (
                            <li key={i} className="text-green-600">{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedAnalysis.conceptualAnalysis.weakConcepts?.length > 0 && (
                      <div className="mb-3">
                        <p className="font-semibold text-orange-700">⚠️ Weak Concepts:</p>
                        <ul className="list-disc pl-5 text-sm">
                          {selectedAnalysis.conceptualAnalysis.weakConcepts.map((c: string, i: number) => (
                            <li key={i} className="text-orange-600">{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {selectedAnalysis.conceptualAnalysis.misconceptions?.length > 0 && (
                      <div>
                        <p className="font-semibold text-red-700">❌ Misconceptions:</p>
                        <ul className="list-disc pl-5 text-sm">
                          {selectedAnalysis.conceptualAnalysis.misconceptions.map((m: string, i: number) => (
                            <li key={i} className="text-red-600">{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">💪 Strengths</h3>
                  <ul className="list-disc pl-5 text-sm">
                    {selectedAnalysis.strengths?.map((s: string, i: number) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>

                {selectedAnalysis.improvementRoadmap?.length > 0 && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="font-bold text-lg mb-2">🗺️ Improvement Roadmap</h3>
                    {selectedAnalysis.improvementRoadmap.map((item: any, i: number) => (
                      <div key={i} className="bg-white p-3 rounded mb-3 last:mb-0">
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold">{item.area}</p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.priority === 'High' ? 'bg-red-100 text-red-700' :
                            item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>{item.priority}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1"><span className="font-semibold">Current:</span> {item.currentUnderstanding}</p>
                        <p className="text-sm text-gray-600 mb-2"><span className="font-semibold">Target:</span> {item.targetUnderstanding}</p>
                        {item.actionSteps?.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-semibold">Action Steps:</p>
                            <ul className="list-disc pl-5 text-xs">
                              {item.actionSteps.map((step: string, idx: number) => (
                                <li key={idx}>{step}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {item.resources?.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold">Resources:</p>
                            <ul className="list-disc pl-5 text-xs text-blue-600">
                              {item.resources.map((res: string, idx: number) => (
                                <li key={idx}>{res}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">📋 Overall Feedback</h3>
                  <p className="text-gray-800 mb-3">{selectedAnalysis.overallFeedback?.summary}</p>
                  {selectedAnalysis.overallFeedback?.keyTakeaways?.length > 0 && (
                    <div className="mb-2">
                      <p className="font-semibold text-sm">Key Takeaways:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {selectedAnalysis.overallFeedback.keyTakeaways.map((t: string, i: number) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedAnalysis.overallFeedback?.nextSteps?.length > 0 && (
                    <div>
                      <p className="font-semibold text-sm">Next Steps:</p>
                      <ul className="list-disc pl-5 text-sm">
                        {selectedAnalysis.overallFeedback.nextSteps.map((s: string, i: number) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-400">
                  <p className="font-semibold mb-2">💬 Motivational Message</p>
                  <p className="italic text-gray-800">{selectedAnalysis.motivationalMessage}</p>
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
