/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Exam } from "../../lib/api";
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
          You must remain in fullscreen mode to continue the exam.
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

export const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exam, setExam] = useState<any>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<any[]>([]);
  const [violations, setViolations] = useState(0);
  const [violationLog, setViolationLog] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const timerRef = useRef<any>(null);
  const cleanupRef = useRef<any>(null);
  const checkIntervalRef = useRef<any>(null);
  const violationLogRef = useRef<string[]>([]);

  useEffect(() => {
    fetchExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (cleanupRef.current) cleanupRef.current();
      exitFullscreen();
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!showInstructions && exam) {
      enterFullscreen();
      startTimer();
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

  const fetchExam = async () => {
    try {
      const res = await Exam.startExam(examId!);
      setExam(res.data);
      const parsedQuestions =
        typeof res.data.questions === "string"
          ? JSON.parse(res.data.questions)
          : res.data.questions;
      const shuffled = [...parsedQuestions].sort(() => Math.random() - 0.5);
      setResponses(
        shuffled.map((q: any) => ({
          ...q,
          yourAnswer: res.data.testType === "quiz" ? "" : "",
          answer: "",
        })),
      );
      if (res.data.isDuration) setTimeLeft(res.data.durationMinutes * 60);
    } catch (error: any) {
      toast.error("Failed to load exam");
      navigate(-1);
    }
  };

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.();
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen?.();
  };

  const startTimer = () => {
    if (!exam?.isDuration) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
    console.log(violationLog)
    const newLog = [...violationLogRef.current, type];
    violationLogRef.current = newLog;
    setViolationLog(newLog);
    const newViolations = newLog.length;
    setViolations(newViolations);
    toast.error(`Warning: ${type}! (${newViolations}/3)`);
    if (newViolations >= 3) {
      toast.error("Maximum violations reached. Auto-submitting...");
      setTimeout(() => handleSubmit(), 2000);
    }
  };

  const handleAnswer = (answer: string) => {
    const updated = [...responses];
    if (exam.testType === "quiz") {
      updated[currentQuestion].yourAnswer = answer;
    } else {
      updated[currentQuestion].answer = answer;
    }
    setResponses(updated);
  };
const handleViolationSubmit= async()=>{
    const allAnswered = responses.every((r) =>
      exam.testType === "quiz" ? r.yourAnswer : r.answer,
    );
     setIsSubmitting(true);
    setIsLocked(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    if (cleanupRef.current) cleanupRef.current();
    exitFullscreen();

}
  const handleSubmit = async () => {
    const allAnswered = responses.every((r) =>
      exam.testType === "quiz" ? r.yourAnswer : r.answer,
    );
    if (!allAnswered) {
      toast.error("Please answer all questions before submitting");
      return;
    }
    setIsSubmitting(true);
    setIsLocked(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    if (cleanupRef.current) cleanupRef.current();
    exitFullscreen();
    try {
      console.log(responses);
      console.log(violationLog)
      toast.success("Exam submitted successfully");
      navigate("/student/exams");
    } catch (error) {
      toast.error("Failed to submit exam");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!exam) return <div className="p-8 text-center">Loading...</div>;

  if (showInstructions) {
    let instructions;
    try {
      instructions =
        typeof exam.instructions === "string"
          ? JSON.parse(exam.instructions)
          : exam.instructions;
    } catch {
      instructions = {};
    }
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">
            {instructions.title || "Exam Instructions"}
          </h1>
          {instructions.generalInstructions && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">
                General Instructions
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                {instructions.generalInstructions.map(
                  (item: string, i: number) => (
                    <li key={i} className="text-gray-700">
                      {item}
                    </li>
                  ),
                )}
              </ul>
            </div>
          )}
          {instructions.examGuidelines && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Exam Guidelines</h2>
              <ul className="list-disc pl-6 space-y-2">
                {instructions.examGuidelines.map((item: string, i: number) => (
                  <li key={i} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {instructions.examRules && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Exam Rules</h2>
              <ul className="list-disc pl-6 space-y-2">
                {instructions.examRules.map((item: string, i: number) => (
                  <li key={i} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {instructions.importantNotes && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3 text-red-600">
                Important Notes
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                {instructions.importantNotes.map((item: string, i: number) => (
                  <li key={i} className="text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 text-center">
            <button
              onClick={() => setShowInstructions(false)}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
            >
              Start Exam
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
                className={`w-10 h-10 rounded ${i === currentQuestion ? "bg-blue-600 text-white" : responses[i].yourAnswer || responses[i].answer ? "bg-green-500 text-white" : "bg-gray-200"}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
        {exam.isDuration && (
          <div className="mb-4 p-3 bg-red-50 rounded">
            <p className="text-sm font-semibold text-red-600">Time Left</p>
            <p className="text-2xl font-bold text-red-600">
              {formatTime(timeLeft)}
            </p>
          </div>
        )}
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
            <div className="lg:hidden">
              {exam.isDuration && (
                <span className="text-red-600 font-bold">
                  {formatTime(timeLeft)}
                </span>
              )}
            </div>
          </div>
          <div className="mb-6 relative">
            <p className="text-lg mb-4 select-none relative z-10">
              {question.question}
            </p>
            {exam.testType === "quiz" && question.options && (
              <div className="space-y-3 relative z-10">
                {Object.entries(question.options).map(
                  ([key, value]: [string, any]) => (
                    <label
                      key={key}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 ${question.yourAnswer === key ? "border-blue-600 bg-blue-50" : "border-gray-300"} select-none`}
                    >
                      <input
                        type="radio"
                        name="answer"
                        value={key}
                        checked={question.yourAnswer === key}
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
            {exam.testType === "summary" && (
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
          <div className="flex justify-between">
            <button
              onClick={() =>
                setCurrentQuestion(Math.max(0, currentQuestion - 1))
              }
              disabled={currentQuestion === 0}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            {currentQuestion === responses.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Submit Exam
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
