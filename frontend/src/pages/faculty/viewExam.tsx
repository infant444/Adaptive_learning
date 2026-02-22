/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Exam, Channel, Response } from "../../lib/api";
import toast from "react-hot-toast";
import { ArrowLeft, X } from "lucide-react";

export const ViewExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("instructions");
  const [exam, setExam] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [channels, setChannels] = useState<any[]>([]);
  const [editMode, setEditMode] = useState<"details" | "questions" | null>(
    null,
  );
  const [formData, setFormData] = useState<any>({});
  const [questions, setQuestions] = useState<any[]>([]);
  const [isShowFeedback, setIsShowFeedback] = useState(false);
  const [facultyReview, setFacultyReview] = useState("");
  const [selectedResponse, setSelectedResponse] = useState("");
  useEffect(() => {
    loadExam();
    loadResponses();
    loadChannels();
  }, [id]);

  const loadExam = async () => {
    try {
      const res = await Exam.getFacultyByID(id!);
      setExam(res.data);
      setFormData({
        title: res.data.title,
        domain: res.data.domain,
        isDuration: res.data.isDuration,
        durationMinutes: res.data.durationMinutes,
        isStart: res.data.isStart,
        startAt: res.data.startAt
          ? new Date(res.data.startAt).toISOString().slice(0, 16)
          : "",
        endAt: res.data.endAt
          ? new Date(res.data.endAt).toISOString().slice(0, 16)
          : "",
        publishType: res.data.publishType,
        organization: res.data.organization,
        channelId: res.data.channelId,
        resultOut: res.data.resultOut,
        totalScore: res.data.totalScore,
      });
      setQuestions(res.data.questions);
    } catch (error) {
      toast.error("Failed to load exam");
    }
  };

  const loadResponses = async () => {
    try {
      const res = await Response.getExamResponse(id!);
      console.log(res.data);
      setResponses(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadChannels = async () => {
    try {
      const res = await Channel.getFacultyChannel();
      setChannels(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Exam.updateDetail(id!, {
        ...formData,
        channelId:
          formData.publishType === "private" ? formData.channelId : null,
        organization:
          formData.publishType === "organization"
            ? formData.organization
            : null,
      });
      toast.success("Exam details updated");
      setEditMode(null);
      loadExam();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update");
    }
  };

  const handleUpdateQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await Exam.updateQuestion(id!, { questions });
      toast.success("Questions updated");
      setEditMode(null);
      loadExam();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update");
    }
  };
  const handleFacultyFeedback = async () => {
    try {
      await Response.addFacultyFeedback(selectedResponse, { facultyFeedback: facultyReview });
      setIsShowFeedback(false);
      setSelectedResponse("")
      loadResponses();
    } catch (err) {
      toast.error("Failed to submit feedback");
    }
  };

  if (!exam) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-gray-700 cursor-pointer mb-4 flex items-center gap-1"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
      </div>

      <div className="border-b mb-6">
        <div className="flex gap-4">
          {["instructions", "questions", "responses", "feedback"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 border-b-2 ${
                activeTab === tab
                  ? "border-purple-600 text-purple-600"
                  : "border-transparent text-gray-600"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "instructions" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Exam Details</h2>
            <button
              onClick={() =>
                setEditMode(editMode === "details" ? null : "details")
              }
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {editMode === "details" ? "Cancel" : "Update Details"}
            </button>
          </div>

          {editMode === "details" ? (
            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domain
                </label>
                <input
                  type="text"
                  value={formData.domain}
                  onChange={(e) =>
                    setFormData({ ...formData, domain: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Score
                </label>
                <input
                  type="number"
                  value={formData.totalScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalScore: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isDuration}
                  onChange={(e) =>
                    setFormData({ ...formData, isDuration: e.target.checked })
                  }
                  className="rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Set Duration
                </label>
              </div>

              {formData.isDuration && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.durationMinutes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        durationMinutes: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isStart}
                  onChange={(e) =>
                    setFormData({ ...formData, isStart: e.target.checked })
                  }
                  className="rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Schedule Exam
                </label>
              </div>

              {formData.isStart && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startAt}
                      onChange={(e) =>
                        setFormData({ ...formData, startAt: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endAt}
                      onChange={(e) =>
                        setFormData({ ...formData, endAt: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Publish Type
                </label>
                <select
                  value={formData.publishType}
                  onChange={(e) =>
                    setFormData({ ...formData, publishType: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="public">Public</option>
                  <option value="organization">Organization</option>
                  <option value="private">Private (Channel)</option>
                </select>
              </div>

              {formData.publishType === "organization" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) =>
                      setFormData({ ...formData, organization: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              )}

              {formData.publishType === "private" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel
                  </label>
                  <select
                    value={formData.channelId}
                    onChange={(e) =>
                      setFormData({ ...formData, channelId: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select Channel</option>
                    {channels.map((ch) => (
                      <option key={ch.id} value={ch.id}>
                        {ch.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.resultOut}
                  onChange={(e) =>
                    setFormData({ ...formData, resultOut: e.target.checked })
                  }
                  className="rounded"
                />
                <label className="text-sm font-medium text-gray-700">
                  Show Results to Students
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Save Details
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>Domain:</strong> {exam.domain || "N/A"}
              </p>
              <p>
                <strong>Test Type:</strong> {exam.testType}
              </p>
              <p>
                <strong>Total Score:</strong> {exam.totalScore}
              </p>
              <p>
                <strong>Questions:</strong> {exam.questionCount}
              </p>
              <p>
                <strong>Duration:</strong>{" "}
                {exam.isDuration
                  ? `${exam.durationMinutes} minutes`
                  : "No limit"}
              </p>
              <p>
                <strong>Schedule:</strong>{" "}
                {exam.isStart
                  ? `${new Date(exam.startAt).toLocaleString()} - ${new Date(exam.endAt).toLocaleString()}`
                  : "Not scheduled"}
              </p>
              <p>
                <strong>Publish Type:</strong> {exam.testType}
              </p>
              {exam.organization && (
                <p>
                  <strong>Organization:</strong> {exam.organization}
                </p>
              )}
              <p>
                <strong>Results Visible:</strong>{" "}
                {exam.resultOut ? "Yes" : "No"}
              </p>
              {exam.instructions &&
                (() => {
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
                    <div className="mt-4">
                      <h3 className="font-bold mb-2">Instructions</h3>
                      {instructions.title && (
                        <p className="text-sm text-gray-600 mb-2">
                          <strong>Title:</strong> {instructions.title}
                        </p>
                      )}
                      {instructions.generalInstructions && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">
                            General Instructions:
                          </p>
                          <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                            {instructions.generalInstructions.map(
                              (item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                      {instructions.examGuidelines && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">
                            Exam Guidelines:
                          </p>
                          <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                            {instructions.examGuidelines.map(
                              (item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                      {instructions.examRules && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-gray-700">
                            Exam Rules:
                          </p>
                          <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                            {instructions.examRules.map(
                              (item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                      {instructions.importantNotes && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-red-600">
                            Important Notes:
                          </p>
                          <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                            {instructions.importantNotes.map(
                              (item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}
            </div>
          )}
        </div>
      )}

      {activeTab === "questions" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Questions</h2>
            <button
              onClick={() =>
                setEditMode(editMode === "questions" ? null : "questions")
              }
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              {editMode === "questions" ? "Cancel" : "Update Questions"}
            </button>
          </div>

          {editMode === "questions" ? (
            <form onSubmit={handleUpdateQuestions} className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="border p-4 rounded-lg">
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question {idx + 1}
                    </label>
                    <textarea
                      value={q.question}
                      onChange={(e) => {
                        const updated = [...questions];
                        updated[idx].question = e.target.value;
                        setQuestions(updated);
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={2}
                    />
                  </div>
                  {exam.testType === "quiz" && q.options && (
                    <div className="space-y-2">
                      {Object.entries(q.options).map(
                        ([key, value]: [string, any]) => (
                          <div key={key}>
                            <label className="block text-sm text-gray-600">
                              Option {key}
                            </label>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => {
                                const updated = [...questions];
                                updated[idx].options[key] = e.target.value;
                                setQuestions(updated);
                              }}
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                          </div>
                        ),
                      )}
                      <div>
                        <label className="block text-sm text-gray-600">
                          Correct Answer
                        </label>
                        <input
                          type="text"
                          value={q.correctAnswer}
                          onChange={(e) => {
                            const updated = [...questions];
                            updated[idx].correctAnswer = e.target.value;
                            setQuestions(updated);
                          }}
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  )}
                  {exam.testType === "summary" && (
                    <div>
                      <label className="block text-sm text-gray-600">
                        Marks
                      </label>
                      <input
                        type="number"
                        value={q.marks}
                        onChange={(e) => {
                          const updated = [...questions];
                          updated[idx].marks = parseInt(e.target.value);
                          setQuestions(updated);
                        }}
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                Save Questions
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div key={idx} className="border p-4 rounded-lg">
                  <p className="font-medium mb-2">
                    {idx + 1}. {q.question}
                  </p>
                  {exam.testType === "quiz" && q.options && (
                    <div className="ml-4 space-y-1 text-sm text-gray-600">
                      {Object.entries(q.options).map(
                        ([key, value]: [string, any]) => (
                          <p
                            key={key}
                            className={
                              key === q.correctAnswer
                                ? "text-green-600 font-medium"
                                : ""
                            }
                          >
                            {key}. {value}
                          </p>
                        ),
                      )}
                    </div>
                  )}
                  {exam.testType === "summary" && (
                    <p className="text-sm text-gray-600">Marks: {q.marks}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "responses" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Student Responses</h2>
          {responses.length === 0 ? (
            <p className="text-gray-500">No responses yet</p>
          ) : (
            <div className="space-y-3">
              {responses.map((res) => (
                <div key={res.id} className="border p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {res.student?.name || "Anonymous"}
                      </p>
                      <p className="text-sm text-gray-600">
                        Score: {res.yourScore}/{res.totalScore} (
                        {res.responseScore}%)
                      </p>
                      <p className="text-sm text-gray-600">
                        Duration: {res.duration} min
                      </p>
                      <p className="text-sm text-gray-600">
                        Violations: {res.violations?.length || 0}
                      </p>
                      {res.isTerminated && (
                        <p className="text-sm text-red-600">
                          Terminated: {res.terminatedReason}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/response/view/${res.id}`)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          if(!res.facultyReview){
                            setIsShowFeedback(true);
                        setSelectedResponse(res.id)}
                        else{
                          toast.error("Feedback already added")
                        }
                        }}
                        className="px-4 py-2 bg-gray-400 text-black rounded-lg hover:bg-gray-500"
                      >
                        Add Feedback
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "feedback" && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Overall Feedback</h2>
          {responses.length === 0 ? (
            <p className="text-gray-500">No responses to analyze</p>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="border p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold">{responses.length}</p>
                </div>
                <div className="border p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Average Score</p>
                  <p className="text-2xl font-bold">
                    {(
                      responses.reduce(
                        (sum, r) => sum + (r.responseScore || 0),
                        0,
                      ) / responses.length
                    ).toFixed(1)}
                    %
                  </p>
                </div>
                <div className="border p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Completion Rate</p>
                  <p className="text-2xl font-bold">
                    {(
                      (responses.filter((r) => !r.isTerminated).length /
                        responses.length) *
                      100
                    ).toFixed(0)}
                    %
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {isShowFeedback&&
        <div className="absolute z-40 bg-black/30 h-full w-full top-0 left-0 flex flex-col justify-center items-center">
          <div className="bg-white/90 p-6 rounded-lg shadow-lg lg:w-120 w-96 ">
            <div className="flex justify-between">
              <h2 className="text-xl font-semibold mb-4">
                Add Faculty Feedback
              </h2>
              <X
                className="cursor-pointer"
                onClick={() => setIsShowFeedback(false)}
              />
            </div>
            <div>
           <textarea  
           value={facultyReview}
              onChange={(e) =>
                setFacultyReview(e.target.value)
              }
              className="w-full px-3 py-2 border rounded-lg"
              rows={6}
              required/>
            </div>
            <div className="flex gap-4 justify-end">
              <button onClick={()=>setIsShowFeedback(false)} className="text-black bg-gray-200 hover:bg-gray-300 rounded-sm px-3 py-2">Cancel</button>
              <button onClick={handleFacultyFeedback} className="text-white bg-purple-600 hover:bg-purple-700 rounded-sm px-3 py-2" disabled={!facultyReview}>Submit</button>
            </div>
          </div>
        </div>
      }
    </div>
  );
};

export default ViewExam;
