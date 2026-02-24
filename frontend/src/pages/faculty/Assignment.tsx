/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import api, { Assignment, Channel } from "../../lib/api";
import { useNavigate } from "react-router-dom";

const FacultyAssignment = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [channels, setChannels] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectType: "",
    isQuestions: false,
    lastDate: "",
    questionCount: 0,
    questions: [],
    totalScore: 0,
    examType: "quiz",
    channelId: "",
  });

  useEffect(() => {
    loadAssignments();
    loadChannels();
  }, []);

  const loadAssignments = async () => {
    try {
      const res = await Assignment.getForFaculty();
      setAssignments(res.data);
    } catch (error) {
      toast.error("Failed to load assignments");
    }
  };

  const loadChannels = async () => {
    try {
      const res = await Channel.getFacultyChannel()
      setChannels(res.data);
    } catch (error) {
      toast.error("Failed to load channels");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode) {

        await Assignment.update(currentId,formData)
        toast.success("Assignment updated");
      } else {
        await Assignment.create(formData);
        toast.success("Assignment created");
      }
      loadAssignments();
      resetForm();
    } catch (error) {
      toast.error("Operation failed");
    }
  };

  const handleEdit = (assignment: any) => {
    setFormData({
      title: assignment.title,
      description: assignment.description || "",
      projectType: assignment.projectType || "",
      isQuestions: assignment.isQuestions,
      lastDate: assignment.lastDate ? new Date(assignment.lastDate).toISOString().split("T")[0] : "",
      questionCount: assignment.questionCount || 0,
      questions: assignment.questions,
      totalScore: assignment.totalScore,
      examType: assignment.examType,
      channelId: assignment.channelId || "",
    });
    setCurrentId(assignment.id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      await api.delete(`/assignment/delete/${id}`);
      toast.success("Assignment deleted");
      loadAssignments();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      projectType: "",
      isQuestions: false,
      lastDate: "",
      questionCount: 0,
      questions: [],
      totalScore: 0,
      examType: "quiz",
      channelId: "",
    });
    setShowModal(false);
    setEditMode(false);
    setCurrentId("");
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Assignments</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Assignment
        </button>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">{assignment.title}</h3>
                <p className="text-gray-600 mb-3">{assignment.description}</p>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Type: {assignment.projectType}</span>
                  <span>Questions: {assignment.questionCount}</span>
                  <span>Score: {assignment.totalScore}</span>
                  <span>Due: {new Date(assignment.lastDate).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/faculty/project/${assignment.id}`)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEdit(assignment)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(assignment.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? "Edit Assignment" : "Create Assignment"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={formData.isQuestions}
                  onChange={(e) => setFormData({ ...formData, isQuestions: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Has Questions</label>
              </div>
              {formData.isQuestions && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Exam Type</label>
                    <select
                      value={formData.examType}
                      onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="quiz">Quiz</option>
                      <option value="summary">Summary</option>
                      <option value="coding">Coding</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Question Count</label>
                    <input
                      type="number"
                      value={formData.questionCount}
                      onChange={(e) => setFormData({ ...formData, questionCount: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Project Type</label>
                <input
                  type="text"
                  value={formData.projectType}
                  onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Total Score</label>
                <input
                  type="number"
                  value={formData.totalScore}
                  onChange={(e) => setFormData({ ...formData, totalScore: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Channel</label>
                <select
                  value={formData.channelId}
                  onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Channel</option>
                  {channels.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Date</label>
                <input
                  type="date"
                  value={formData.lastDate}
                  onChange={(e) => setFormData({ ...formData, lastDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editMode ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAssignment;
