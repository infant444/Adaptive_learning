/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Calendar, FileText, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { Assignment, AssignmentResponse } from "../../lib/api";

const StudentAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [responseId, setResponseId] = useState<any[]>([]);
  useEffect(() => {
    loadAssignments();
    loadResponse();
  }, []);

  const loadAssignments = async () => {
    try {
      const res = await Assignment.myAssignment();
      // console.log(res.data);
      setAssignments(res.data);
    } catch (error) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };
  const loadResponse = async () => {
    try {
      const res = await AssignmentResponse.getMyResponseId();
      // console.log(res.data)
      setResponseId(res.data);
    } catch (error) {
      toast.error("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };
  const handleFileUpload = async (id: string) => {
    if (!selectedFile || !selectedAssignment) return;

    setUploadingId(selectedAssignment.id);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await AssignmentResponse.submit(id, formData);

      toast.success("Assignment submitted successfully");
      setShowModal(false);
      setSelectedFile(null);

      if (selectedAssignment.isQuestions) {
        navigate(
          "/student/assignment/test/" + selectedAssignment?.assignment.id,
        );
      }
      loadAssignments();
      loadResponse();
    } catch (error) {
      toast.error("Failed to submit assignment");
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Assignments</h1>

      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No assignments available</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {assignment.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{assignment.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    {assignment.projectType && (
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        <span>Type: {assignment.projectType}</span>
                      </div>
                    )}
                    {assignment.isQuestions && (
                      <span>Questions: {assignment.questionCount}</span>
                    )}
                    <span>Score: {assignment.totalScore}</span>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Due:{" "}
                        {new Date(assignment.lastDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {assignment.isQuestions && (
                    <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                      {assignment.examType}
                    </div>
                  )}
                </div>
                <div className="ml-4 ">
                  {responseId.find((s) => s.assignmentId === assignment.id) ? (
                    <div className="flex flex-col justify-center h-full">
                      <div>
                        <div className="w-full sm:w-auto px-4 py-2 bg-green-100 text-green-700 rounded-lg text-center text-sm sm:text-base font-semibold">
                          Uploaded
                        </div>
                        {assignment.yourScore && assignment.yourScore>0 ? <p className="">Score:<span>{assignment.yourScore+'/'+assignment.totalScore}</span></p>:<p></p>}
                      </div>
                      {assignment.isQuestions &&
                        new Date(assignment.lastDate) > new Date() &&
                        assignment.status == "pending" && (
                          <button
                            onClick={() => {
                              navigate(
                                "/student/assignment/test/" + assignment.id,
                              );
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                          >
                            <ArrowRight className="w-4 h-4" />
                            Start exam
                          </button>
                        )}
                    </div>
                  ) : (
                    <div>
                      {new Date(assignment.lastDate) > new Date() &&
                      assignment.status == "pending" ? (
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setShowModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Upload
                        </button>
                      ) : (
                        <p className="text-xl text-red-500">Expired</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Upload Assignment</h3>
            <p className="text-gray-600 mb-4">{selectedAssignment.title}</p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-4">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : "Click to select file"}
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedFile(null);
                  setSelectedAssignment(null);
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFileUpload(selectedAssignment.id)}
                disabled={
                  !selectedFile || uploadingId === selectedAssignment.id
                }
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploadingId === selectedAssignment.id
                  ? "Uploading..."
                  : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
