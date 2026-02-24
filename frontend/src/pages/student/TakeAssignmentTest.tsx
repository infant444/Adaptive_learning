/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AssignmentResponse } from "../../lib/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const AntiCameraOverlay = ({ userEmail }: { userEmail: string }) => {
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 4px)",
          animation: "scanMove 3s linear infinite",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.02)",
          mixBlendMode: "difference",
          animation: "flicker 0.5s infinite",
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(6)].map((_, row) =>
          [...Array(6)].map((_, col) => (
            <div
              key={`${row}-${col}`}
              className="absolute whitespace-nowrap"
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                opacity: 0.05,
                transform: `rotate(-30deg)`,
                color: "#000000",
                top: `${row * 150}px`,
                left: `${col * 300}px`,
              }}
            >
              {userEmail}
            </div>
          )),
        )}
      </div>
      <style>{`@keyframes flicker {
       0%, 100% { opacity: 0.04; }
        50% { opacity: 0.08; }
         } 
          @keyframes scanMove { 0% { background-position: 0 0; } 100% { background-position: 0 100px; } }`}</style>
    </>
  );
};

const KioskLockOverlay = ({ onReenter }: { onReenter: () => void }) => {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0,0,0,0.98)",
        backdropFilter: "blur(20px)",
        pointerEvents: "auto",
      }}
    >
      <div className="bg-white rounded-lg p-8 max-w-md text-center shadow-2xl">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Fullscreen Required
        </h2>
        <p className="text-gray-600 mb-6">
          You must remain in fullscreen mode to continue the test.
        </p>
        <button
          onClick={onReenter}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold w-full"
        >
          Re-Enter Fullscreen
        </button>
      </div>
    </div>
  );
};

export const TakeAssignmentTest = () => {
  const { assignmentId, responseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignmentResponse, setAssignmentResponse] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [violations, setViolations] = useState(0);
  const [alreadyAttended, setAlreadyAttended] = useState(false);
  const [violationLog, setViolationLog] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const cleanupRef = useRef<any>(null);
  const checkIntervalRef = useRef<any>(null);
  const violationLogRef = useRef<string[]>([]);

  useEffect(() => {
    fetchAssignmentResponse();
    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (cleanupRef.current) cleanupRef.current();
      exitFullscreen();
      document.body.style.overflow = "";
    };
  }, [responseId]);

  useEffect(() => {
    if (!showInstructions && assignmentResponse) {
      enterFullscreen();
      setStartTime(Date.now());
      cleanupRef.current = setupViolationDetection();
      startFullscreenCheck();
    }
  }, [showInstructions]);

  useEffect(() => {
    if (isLocked) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isLocked]);

  const fetchAssignmentResponse = async () => {
    try {
      const res = await AssignmentResponse.getResponseById(responseId!);
      const data = res.data;
      
      if (data.alreadyCompleted) {
 setAlreadyAttended(true);
        setLoading(false);
        return;
      }
      
      setAssignmentResponse(data);
      const parsedQuestions =
        typeof data.question === "string"
          ? JSON.parse(data.question)
          : data.question;
      const questions = parsedQuestions?.questions || parsedQuestions || [];
      const shuffled = [...questions].sort(() => Math.random() - 0.5);
      setResponses(
        shuffled.map((q: any) => ({
          ...q,
          answer: "",
          status: "notanswered",
        })),
      );
      setLoading(false);
    } catch (error: any) {
      toast.error("Failed to load test");
      navigate(-1);
    }
  };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.();
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
  };

  const startFullscreenCheck = () => {
    checkIntervalRef.current = setInterval(() => {
      if (!document.fullscreenElement && !isSubmitting && !showInstructions) {
        setIsLocked(true);
      }
    }, 500);
  };

  const handleReenterFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsLocked(false);
    } catch (error) {
      toast.error("Failed to enter fullscreen. Please try again.");
    }
  };

  const setupViolationDetection = () => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !showInstructions && !isSubmitting) {
        setIsLocked(true);
        recordViolation("Exited fullscreen");
      } else if (document.fullscreenElement) {
        setIsLocked(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !showInstructions && !isSubmitting)
        recordViolation("Focus lost");
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (!isSubmitting) {
        e.preventDefault();
        toast.error("Right-click disabled");
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (
        !isSubmitting &&
        (e.key === "PrintScreen" ||
          (e.ctrlKey &&
            e.shiftKey &&
            (e.key === "I" || e.key === "J" || e.key === "C")) ||
          (e.ctrlKey && e.key === "u") ||
          e.key === "F12" ||
          e.key === "F11" ||
          e.key === "Escape")
      ) {
        e.preventDefault();
        recordViolation("Attempted restricted action");
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (!isSubmitting) {
        e.preventDefault();
        recordViolation("Copy attempted");
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      if (!isSubmitting) {
        e.preventDefault();
        toast.error("Paste disabled");
      }
    };

    const handleResize = () => {
      if (!document.fullscreenElement && !isSubmitting && !showInstructions)
        setIsLocked(true);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      window.removeEventListener("resize", handleResize);
    };
  };

  const recordViolation = (type: string) => {
    if (violationLogRef.current.includes(type)) return;
    const newLog = [...violationLogRef.current, type];
    violationLogRef.current = newLog;
    setViolationLog(newLog);
    const newViolations = newLog.length;
    setViolations(newViolations);
    toast.error(`Warning: ${type}! (${newViolations}/3)`);
    if (newViolations >= 3) {
      toast.error("Maximum violations reached. Auto-submitting...");
      setTimeout(() => handleViolationSubmit(), 2000);
    }
  };

  const handleAnswer = (answer: string) => {
    const updated = [...responses];
    updated[currentQuestion].answer = answer;
    updated[currentQuestion].status = "answered";
    setResponses(updated);
  };

  const handleSkip = () => {
    const updated = [...responses];
    updated[currentQuestion].status = "skipped";
    setResponses(updated);
    if (currentQuestion < responses.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handleViolationSubmit = async () => {
    setIsSubmitting(true);
    setIsLocked(false);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    if (cleanupRef.current) cleanupRef.current();
    exitFullscreen();
    try {
      await AssignmentResponse.updateResponse(responseId!, {
        response: responses,
        violations: violationLogRef.current,
        isTerminated: true,
        terminatedReason: "Maximum violations reached",
      });
      toast.error("Test auto-submitted due to violations");
      setIsTerminated(true);
    } catch (error) {
      toast.error("Failed to submit test");
    }
  };

  const handleSubmit = async () => {
    const unanswered = responses.filter(
      (r) => r.status === "notanswered" || r.status === "skipped",
    );
    if (unanswered.length > 0) {
      const confirm = window.confirm(
        `You have ${unanswered.length} unanswered/skipped questions. Submit anyway?`,
      );
      if (!confirm) return;
    }
    setIsSubmitting(true);
    setIsLocked(false);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    if (cleanupRef.current) cleanupRef.current();
    exitFullscreen();
    try {
      await AssignmentResponse.updateResponse(responseId!, {
        response: responses,
        violations: violationLogRef.current,
        isTerminated: false,
        terminatedReason: null,
      });
      toast.success("Test submitted successfully");
      setIsCompleted(true);
    } catch (error) {
      toast.error("Failed to submit test");
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (alreadyAttended) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Attended</h1>
          <p className="text-gray-600 mb-6">You have already completed this exam.</p>
          <button
            onClick={() => navigate("/student/project-submit", { replace: true })}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }
  if (isCompleted) {
    const answered = responses.filter((r) => r.status === "answered").length;
    const skipped = responses.filter((r) => r.status === "skipped").length;
    const notAnswered = responses.filter(
      (r) => r.status === "notanswered",
    ).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test Completed!
            </h1>
            <p className="text-gray-600">
              Your responses have been submitted successfully
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Submission Summary</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{answered}</p>
                <p className="text-sm text-gray-600">Answered</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{skipped}</p>
                <p className="text-sm text-gray-600">Skipped</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <p className="text-2xl font-bold text-gray-600">
                  {notAnswered}
                </p>
                <p className="text-sm text-gray-600">Not Answered</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/student/project-submit", { replace: true })}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  if (isTerminated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
          <div className="mb-6">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 6L18 18M6 18L18 6"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Test Terminated!
            </h1>
            <p className="text-gray-600">
              Your test has been terminated due to a violation of test guidelines.
            </p>
          </div>

          <button
            onClick={() => navigate("/student/assignments", { replace: true })}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            Assignment Test Instructions
          </h1>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">General Instructions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-gray-700">Read each question carefully before answering</li>
              <li className="text-gray-700">You can navigate between questions using Previous/Next buttons</li>
              <li className="text-gray-700">You can skip questions and return to them later</li>
              <li className="text-gray-700">Review all your answers before final submission</li>
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Test Guidelines</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-gray-700">The test must be taken in fullscreen mode</li>
              <li className="text-gray-700">Do not exit fullscreen or switch tabs during the test</li>
              <li className="text-gray-700">Right-click, copy, and paste are disabled</li>
              <li className="text-gray-700">Your screen will be monitored for violations</li>
            </ul>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-red-600">Important Notes</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li className="text-gray-700">You have a maximum of 3 violations allowed</li>
              <li className="text-gray-700">After 3 violations, the test will be auto-submitted</li>
              <li className="text-gray-700">Once submitted, you cannot retake the test</li>
              <li className="text-gray-700">Make sure you have a stable internet connection</li>
            </ul>
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowInstructions(false)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
            >
              Start Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = responses[currentQuestion];

  return (
    <div
      className="min-h-screen bg-gray-50 flex relative overflow-hidden"
      style={{
        userSelect: isLocked ? "none" : "auto",
        pointerEvents: isLocked ? "none" : "auto",
      }}
    >
      {isLocked && <KioskLockOverlay onReenter={handleReenterFullscreen} />}
      <AntiCameraOverlay userEmail={user?.email || "Student"} />
      <div
        className="w-64 bg-white shadow-lg p-4 hidden lg:block"
        style={{ filter: isLocked ? "blur(10px)" : "none" }}
      >
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {responses.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQuestion(i)}
                className={`w-10 h-10 rounded text-sm font-semibold ${
                  i === currentQuestion
                    ? "bg-blue-600 text-white"
                    : responses[i].status === "answered"
                      ? "bg-green-500 text-white"
                      : responses[i].status === "skipped"
                        ? "bg-orange-400 text-white"
                        : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4 p-3 bg-yellow-50 rounded">
          <p className="text-sm font-semibold text-yellow-600">Violations</p>
          <p className="text-2xl font-bold text-yellow-600">{violations}/3</p>
        </div>
      </div>
      <div
        className="flex-1 p-4 sm:p-8"
        style={{ filter: isLocked ? "blur(10px)" : "none" }}
      >
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">
              Question {currentQuestion + 1} of {responses.length}
            </h2>
          </div>
          <div className="mb-6 relative">
            <p className="text-lg mb-4 select-none relative z-10">
              {question.question}
            </p>
            {(assignmentResponse.assignment.examType === "quiz" || assignmentResponse.assignment.examType === "mcq") && question.options && (
              <div className="space-y-3 relative z-10">
                {Object.entries(question.options).map(
                  ([key, value]: [string, any]) => (
                    <label
                      key={key}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${question.answer === key ? "border-blue-600 bg-blue-50" : "border-gray-300"} select-none`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={key}
                        checked={question.answer === key}
                        onChange={(e) => handleAnswer(e.target.value)}
                        className="mr-3"
                      />
                      <span>
                        {key}. {value}
                      </span>
                    </label>
                  ),
                )}
              </div>
            )}
            {assignmentResponse.assignment.examType === "summary" && (
              <div>
                <textarea
                  value={question.answer}
                  onChange={(e) => handleAnswer(e.target.value)}
                  className="w-full h-64 p-4 border-2 rounded-lg focus:border-blue-600 bg-white"
                  placeholder="Write your answer here..."
                />
                {question.suggestedLength && (
                  <p className="text-sm text-gray-500 mt-2 select-none">
                    Suggested length: {question.suggestedLength}
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-between gap-3">
            <button
              onClick={() =>
                setCurrentQuestion(Math.max(0, currentQuestion - 1))
              }
              disabled={currentQuestion === 0}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={handleSkip}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Skip
            </button>
            {currentQuestion === responses.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit Test
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestion(
                    Math.min(responses.length - 1, currentQuestion + 1),
                  )
                }
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
