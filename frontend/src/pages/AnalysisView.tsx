/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Exam, Response } from "../lib/api";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { ArrowLeft, LucideDownload } from "lucide-react";

export const AnalysisView = () => {
  const { examId, responseId } = useParams();
  const navigate = useNavigate();
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResponse();
  }, [examId, responseId]);

  const loadResponse = async () => {
    try {
      const res = await Response.getResponseById(responseId!);
      setResponse(res.data);
    } catch (error) {
      toast.error("Failed to load analysis");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!response) return;
    const analysis = response.analyses;

    const doc = new jsPDF();
    let y = 20;
    const lineHeight = 7;
    const pageHeight = 280;

    const addText = (text: string, fontSize = 12, isBold = false) => {
      if (y > pageHeight) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      const lines = doc.splitTextToSize(text, 180);
      doc.text(lines, 15, y);
      y += lines.length * lineHeight;
    };

    addText("EXAM ANALYSIS REPORT", 18, true);
    y += 5;
    addText("Exam Detail", 14, true);
    addText(`Title: ${response.exam.title}`);
    addText(`Domine: ${response.exam.domain}`);
    addText(`Exam type: ${response.exam.testType}`);
    addText(`No of Questions: ${response.exam.questionCount}`);
    addText(`Total Mark: ${response.exam.totalScore}`);
    addText(`Duration: ${response.exam.durationMinutes} minutes`);
    addText(`Exam Date: ${new Date(response.createdAt).toLocaleDateString()}`);
    y += 5;

    addText("SCORE ANALYSIS", 14, true);
    addText(`Total Marks: ${analysis?.scoreAnalysis?.totalMarks}`);
    addText(`Marks Obtained: ${analysis?.scoreAnalysis?.marksObtained}`);
    addText(`Percentage: ${analysis?.scoreAnalysis?.percentage}%`);
    addText(`Grade: ${analysis?.scoreAnalysis?.grade}`);
    addText(`Performance: ${analysis?.scoreAnalysis?.performanceLevel}`);
    y += 5;

    if (response.violations?.length > 0) {
      addText("VIOLATIONS", 14, true);
      addText(`Total Violations: ${response.violations.length}`);
      response.violations.forEach((v: string, i: number) => {
        addText(`${i + 1}. ${v}`);
      });
      if (response.isTerminated) {
        addText(
          `Status: Exam Terminated - ${response.terminatedReason}`,
          12,
          true,
        );
      }
      y += 5;
    }

    addText("QUESTION-WISE ANALYSIS", 14, true);
    analysis?.questionWiseAnalysis?.forEach((q: any) => {
      addText(`Q${q.questionNumber}: ${q.question}`, 11, true);
      addText(`Your Answer: ${q.studentAnswer || "Not answered"}`);
      addText(`Correct Answer: ${q.correctAnswer}`);
      addText(`Marks: ${q.marksAwarded}/${q.maxMarks}`);
      addText(`Feedback: ${q.feedback}`);
      if (q.graceMarksAwarded > 0)
        addText(`Grace Marks: +${q.graceMarksAwarded}`);
      y += 3;
    });

    if (analysis?.mistakeAnalysis?.length > 0) {
      addText("MISTAKE ANALYSIS", 14, true);
      analysis.mistakeAnalysis.forEach((m: any) => {
        addText(`Q${m.questionNumber} - ${m.topic}`, 11, true);
        addText(`Mistake: ${m.mistake}`);
        addText(`Correct Concept: ${m.correctConcept}`);
        addText(`How to Improve: ${m.howToImprove}`);
        y += 3;
      });
    }

    addText("TIME MANAGEMENT", 14, true);
    addText(`Time Allocated: ${analysis?.timeManagement?.totalTimeAllocated}`);
    addText(`Time Taken: ${analysis?.timeManagement?.timeTaken}`);
    addText(
      `Avg Time/Question: ${analysis?.timeManagement?.averageTimePerQuestion}`,
    );
    addText(`Efficiency: ${analysis?.timeManagement?.efficiency}`);
    if (analysis?.timeManagement?.suggestions?.length > 0) {
      addText("Suggestions:");
      analysis.timeManagement.suggestions.forEach((s: string) =>
        addText(`- ${s}`),
      );
    }
    y += 5;

    if (analysis?.strengths?.length > 0) {
      addText("STRENGTHS", 14, true);
      analysis.strengths.forEach((s: string) => addText(`- ${s}`));
      y += 5;
    }

    if (analysis?.areasForImprovement?.length > 0) {
      addText("AREAS FOR IMPROVEMENT", 14, true);
      analysis.areasForImprovement.forEach((area: any) => {
        addText(area.area, 11, true);
        addText(`Current Level: ${area.currentLevel}`);
        addText(`Target Level: ${area.targetLevel}`);
        addText("Action Steps:");
        area.actionSteps?.forEach((step: string) => addText(`- ${step}`));
        addText("Resources:");
        area.resources?.forEach((res: string) => addText(`- ${res}`));
        y += 3;
      });
    }

    if (analysis?.focusAreas?.length > 0) {
      addText("FOCUS AREAS", 14, true);
      analysis.focusAreas.forEach((focus: any) => {
        addText(`[${focus.priority} Priority] ${focus.topic}`, 11, true);
        addText(`Reason: ${focus.reason}`);
        addText(`Study Plan: ${focus.studyPlan}`);
        y += 3;
      });
    }

    addText("OVERALL FEEDBACK", 14, true);
    addText(analysis?.overallFeedback?.summary || "");
    if (analysis?.overallFeedback?.progressIndicators?.length > 0) {
      addText("Progress Indicators:");
      analysis.overallFeedback.progressIndicators.forEach((ind: string) =>
        addText(`- ${ind}`),
      );
    }
    if (analysis?.overallFeedback?.nextSteps?.length > 0) {
      addText("Next Steps:");
      analysis.overallFeedback.nextSteps.forEach((step: string) =>
        addText(`- ${step}`),
      );
    }
    y += 5;

    addText("MOTIVATIONAL MESSAGE", 14, true);
    addText(analysis?.motivationalMessage || "");

    if (response.facultyReview) {
      y += 5;
      addText("FACULTY REVIEW", 14, true);
      addText(response.facultyReview);
    }

    doc.save(`exam-analysis-${responseId}.pdf`);
    toast.success("PDF downloaded");
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!response) return <div className="text-center py-8">No data found</div>;

  const analysis = response.analyses;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-gray-700 cursor-pointer mb-4 flex items-center gap-1"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exam Analysis</h1>
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex gap-1"
          >
            <LucideDownload className="w-5 h-5"/>
            Download PDF
          </button>
        </div>
      </div>

      {/* Score Overview */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Score Analysis</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Marks</p>
            <p className="text-3xl font-bold text-blue-600">
              {analysis?.scoreAnalysis?.totalMarks}
            </p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Marks Obtained</p>
            <p className="text-3xl font-bold text-green-600">
              {analysis?.scoreAnalysis?.marksObtained}
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Percentage</p>
            <p className="text-3xl font-bold text-purple-600">
              {analysis?.scoreAnalysis?.percentage}%
            </p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-gray-600">Grade</p>
            <p className="text-3xl font-bold text-yellow-600">
              {analysis?.scoreAnalysis?.grade}
            </p>
          </div>
        </div>
        <p className="mt-4 text-center text-lg font-medium text-gray-700">
          Performance: {analysis?.scoreAnalysis?.performanceLevel}
        </p>
      </div>

      {/* Violations */}
      {response.violations?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-red-700">
            Violations
          </h2>
          <div className="mb-3">
            <p className="text-lg font-medium">
              Total Violations:{" "}
              <span className="text-red-600">{response.violations.length}</span>
            </p>
            {response.isTerminated && (
              <p className="text-red-600 font-medium mt-2">
                Status: Exam Terminated - {response.terminatedReason}
              </p>
            )}
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            {response.violations.map((v: string, idx: number) => (
              <li key={idx}>{v}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Question-wise Analysis */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Question-wise Analysis</h2>
        <div className="space-y-4">
          {analysis?.questionWiseAnalysis?.map((q: any, idx: number) => (
            <div
              key={idx}
              className={`border-l-4 p-4 rounded ${q.isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium text-gray-900">
                  Q{q.questionNumber}: {q.question}
                </p>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${q.isCorrect ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}
                >
                  {q.marksAwarded}/{q.maxMarks}
                </span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 mt-3 text-sm">
                <div>
                  <p className="text-gray-600">Your Answer:</p>
                  <p className="font-medium">
                    {q.studentAnswer || "Not answered"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Correct Answer:</p>
                  <p className="font-medium text-green-700">
                    {q.correctAnswer}
                  </p>
                </div>
              </div>
              <div className="mt-3 p-3 bg-white rounded">
                <p className="text-sm text-gray-600">Feedback:</p>
                <p className="text-sm text-gray-800">{q.feedback}</p>
              </div>
              {q.graceMarksAwarded > 0 && (
                <p className="mt-2 text-sm text-blue-600">
                  Grace Marks: +{q.graceMarksAwarded}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mistake Analysis */}
      {analysis?.mistakeAnalysis?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Mistake Analysis</h2>
          <div className="space-y-4">
            {analysis.mistakeAnalysis.map((m: any, idx: number) => (
              <div key={idx} className="border p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm font-medium">
                    Q{m.questionNumber}
                  </span>
                  <span className="font-medium text-gray-900">{m.topic}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Mistake:</p>
                    <p className="text-gray-800">{m.mistake}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Correct Concept:</p>
                    <p className="text-gray-800">{m.correctConcept}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">How to Improve:</p>
                    <p className="text-blue-700 font-medium">
                      {m.howToImprove}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time Management */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Time Management</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Time Allocated</p>
            <p className="text-lg font-medium">
              {analysis?.timeManagement?.totalTimeAllocated}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time Taken</p>
            <p className="text-lg font-medium">
              {analysis?.timeManagement?.timeTaken}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Avg Time/Question</p>
            <p className="text-lg font-medium">
              {analysis?.timeManagement?.averageTimePerQuestion}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Efficiency</p>
            <p className="text-lg font-medium">
              {analysis?.timeManagement?.efficiency}
            </p>
          </div>
        </div>
        {analysis?.timeManagement?.suggestions?.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Suggestions:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {analysis.timeManagement.suggestions.map(
                (s: string, idx: number) => (
                  <li key={idx}>{s}</li>
                ),
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Strengths */}
      {analysis?.strengths?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-green-700">
            Strengths
          </h2>
          <ul className="space-y-2">
            {analysis.strengths.map((s: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-green-600 mt-1">✓</span>
                <span className="text-gray-700">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas for Improvement */}
      {analysis?.areasForImprovement?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4 text-orange-700">
            Areas for Improvement
          </h2>
          <div className="space-y-4">
            {analysis.areasForImprovement.map((area: any, idx: number) => (
              <div key={idx} className="border p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">{area.area}</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Current Level:</p>
                    <p className="text-gray-800">{area.currentLevel}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Target Level:</p>
                    <p className="text-gray-800">{area.targetLevel}</p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Action Steps:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {area.actionSteps?.map((step: string, i: number) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Resources:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-blue-600">
                    {area.resources?.map((res: string, i: number) => (
                      <li key={i}>{res}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Focus Areas */}
      {analysis?.focusAreas?.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Focus Areas</h2>
          <div className="space-y-3">
            {analysis.focusAreas.map((focus: any, idx: number) => (
              <div
                key={idx}
                className="border-l-4 border-blue-500 p-4 bg-blue-50 rounded"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      focus.priority === "High"
                        ? "bg-red-200 text-red-800"
                        : focus.priority === "Medium"
                          ? "bg-yellow-200 text-yellow-800"
                          : "bg-green-200 text-green-800"
                    }`}
                  >
                    {focus.priority} Priority
                  </span>
                  <span className="font-medium text-gray-900">
                    {focus.topic}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">{focus.reason}</p>
                <p className="text-sm text-blue-700 font-medium">
                  Study Plan: {focus.studyPlan}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overall Feedback */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Overall Feedback</h2>
        <p className="text-gray-700 mb-4">
          {analysis?.overallFeedback?.summary}
        </p>
        {analysis?.overallFeedback?.progressIndicators?.length > 0 && (
          <div className="mb-4">
            <p className="font-medium text-gray-700 mb-2">
              Progress Indicators:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              {analysis.overallFeedback.progressIndicators.map(
                (ind: string, idx: number) => (
                  <li key={idx}>{ind}</li>
                ),
              )}
            </ul>
          </div>
        )}
        {analysis?.overallFeedback?.nextSteps?.length > 0 && (
          <div>
            <p className="font-medium text-gray-700 mb-2">Next Steps:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-600">
              {analysis.overallFeedback.nextSteps.map(
                (step: string, idx: number) => (
                  <li key={idx}>{step}</li>
                ),
              )}
            </ul>
          </div>
        )}
      </div>

      {/* Motivational Message */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3 text-purple-900">
          Message for You
        </h2>
        <p className="text-gray-800 leading-relaxed">
          {analysis?.motivationalMessage}
        </p>
      </div>
      {response.facultyReview && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg shadow mt-6">
          <h2 className="text-xl font-semibold mb-3 text-orange-900">
            Faculty Review
          </h2>
          <p className="text-gray-800 leading-relaxed">
            {response.facultyReview}
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalysisView;
