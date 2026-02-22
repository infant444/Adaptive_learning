/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { Channel, Discussion, Exam } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import * as XLSX from "xlsx";
import {
  ArrowLeft,
  UserPlus,
  FileText,
  Briefcase,
  Users,
  UserStar,
  BookOpen,
  ArrowRightToLineIcon,
  UserRound,
  Send,
  MessageSquare,
  WalletCardsIcon,
} from "lucide-react";

export const ChannelDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [channel, setChannel] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("admin");
  const [host, setHost] = useState<any>(null);
  const location = useLocation();
  const [showJoinPopup, setShowJoinPopup] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [studentEmails, setStudentEmails] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [exams, setExams] = useState<any>(null);
  useEffect(() => {
    fetchChannel();
    if (activeTab === "discussion") {
      fetchMessages();
    }
    if (activeTab == "exams") {
      fetchExams();
    }
  }, [id, activeTab]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (activeTab === "discussion" && id) {
      socketRef.current = io("http://localhost:5000");
      socketRef.current.emit("join-channel", id);

      socketRef.current.on("new-message", (message: any) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.emit("leave-channel", id);
          socketRef.current.disconnect();
        }
      };
    }
  }, [activeTab, id]);

  useEffect(() => {
    if (location.pathname.includes("join-channel") && channel) {
      const isMember = channel.teamMembers?.includes(user?.id);
      if (!isMember) {
        setShowJoinPopup(true);
      } else {
        navigate(`/channel/${id}`, { replace: true });
      }
    }
  }, [location, id, channel, user]);
  const AcceptChannel = async () => {
    try {
      await Channel.addTeamMember(id!);
      await fetchChannel();
      setShowJoinPopup(false);
      navigate(`/channel/${id}`, { replace: true });
    } catch (err) {
      console.error(err);
    }
  };
  const fetchMessages = async () => {
    try {
      const response = await Discussion.getMessages(id!);
      setMessages(response.data);
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await Discussion.sendMessage(id!, newMessage);
      setNewMessage("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const reject = () => {
    navigate(-1);
  };
  const fetchChannel = async () => {
    try {
      const response = await Channel.getById(id!);
      setChannel(response.data);
      console.log(response.data);
      setHost(response.data.faculty);
    } catch (err) {
      console.error(err);
    }
  };
  const fetchExams = async () => {
    try {
      const response = await Exam.getChannel(id!);
      setExams(response.data);
      console.log(response.data);
    } catch (err) {
      console.error(err);
    }
  };
  const handleFileUpload = async (file: File) => {
    try {
      const fileName = file.name.toLowerCase();
      let allText = "";

      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        allText = XLSX.utils.sheet_to_csv(worksheet);
      } else {
        allText = await file.text();
      }

      console.log("File content:", allText);
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const extractedEmails = allText.match(emailRegex) || [];
      console.log("Extracted emails:", extractedEmails);
      const uniqueEmails = [...new Set(extractedEmails)];
      setStudentEmails(uniqueEmails.join("\n"));
      setUploadFile(file);
    } catch (err) {
      console.error(err);
      toast.error("Failed to read file");
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const extractedEmails = studentEmails.match(emailRegex) || [];
      const uniqueEmails = [...new Set(extractedEmails)];

      if (uniqueEmails.length === 0) {
        toast.error("No valid emails found");
        return;
      }
      console.log(uniqueEmails);
      await Channel.sendInvite({ id: id, emails: uniqueEmails });
      toast.success(`Invitations sent to ${uniqueEmails.length} email(s)`);
      setStudentEmails("");
      setUploadFile(null);
      setShowAddStudentModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send invitations. Please check the emails.");
    }
  };
  const ExitChannel = async () => {
    if (confirm("Are you sure you want to exit this channel?")) {
      await Channel.exitTeamMember(id!);
      toast.success("exit successfully");
      navigate(-1);
    }
  };
  const isFacultyOwner = user?.id === channel?.facultyId;
  const isStudentMember =
    channel?.teamMembers?.includes(user?.id) && user?.role == "student";
  // const isNotStudentMember=!channel?.teamMembers?.includes(user?.id) && user?.role=='student'

  return (
    <div
      className="min-h-screen bg-gray-50 scrollbar-hide"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <nav className="bg-white shadow-sm border-b border-gray-400">
        <div className="max-w-7xl px-4 sm:px-6 ">
          <div className="flex justify-start items-center h-16">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Adaptive Learning
              </span>
            </div>
          </div>
        </div>
      </nav>
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-600 text-white rounded-lg flex items-center justify-center text-xl sm:text-2xl font-bold ">
                {channel?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {channel?.name}
                </h1>
              </div>
            </div>

            {isFacultyOwner && (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 text-sm"
                  onClick={() => {
                    setShowAddStudentModal(true);
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Student</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            )}
            {isStudentMember && (
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 border text-white bg-red-500 border-gray-300 rounded-lg cursor-pointer hover:bg-red-600 text-sm"
                  onClick={ExitChannel}
                >
                  <span className="hidden sm:inline">Exit Channel</span>
                  <span className="sm:hidden">Exit</span>
                  <ArrowRightToLineIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b overflow-x-auto">
            <div className="flex gap-2 sm:gap-4 px-4 sm:px-6 min-w-max">
              <button
                onClick={() => setActiveTab("admin")}
                className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "admin"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <WalletCardsIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Details
                </div>
              </button>
              <button
                onClick={() => setActiveTab("discussion")}
                className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "discussion"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                  Discussion
                </div>
              </button>
              <button
                onClick={() => setActiveTab("exams")}
                className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "exams"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  Exams
                </div>
              </button>
              <button
                onClick={() => setActiveTab("work")}
                className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "work"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
                  Work
                </div>
              </button>
              <button
                onClick={() => setActiveTab("students")}
                className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-sm sm:text-base whitespace-nowrap ${
                  activeTab === "students"
                    ? "border-purple-600 text-purple-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                  Students
                </div>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "discussion" && (
              <div className="flex flex-col h-[500px]">
                <div
                  className="flex-1 overflow-y-auto mb-4 space-y-3 scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {messages.length > 0 && (
                    <>
                      {messages.map((msg: any) => {
                        const isMe = msg.sendBy === user?.id;

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}
                          >
                            <div
                              className={`
          max-w-[75%]
          px-3 py-2
          rounded-lg
          shadow-sm
          ${
            isMe
              ? "bg-[#48005c] text-white rounded-br-none"
              : "bg-[#202c33] text-gray-100 rounded-bl-none"
          }
        `}
                            >
                              {!isMe && (
                                <p className="text-xs font-semibold text-green-400 mb-1">
                                  {msg.sendUser?.name}
                                </p>
                              )}

                              <p className="text-sm whitespace-pre-wrap break-words">
                                {msg.message}
                              </p>

                              <div className="flex justify-end mt-1">
                                <span className="text-[10px] text-gray-300 opacity-70">
                                  {new Date(msg.sendAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}

                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}

            {activeTab === "students" && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <h2 className="text-base sm:text-lg font-semibold">
                    Students ({channel?.teamMembersDetail?.length || 0})
                  </h2>
                  {isFacultyOwner && (
                    <button
                      onClick={() => setShowAddStudentModal(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Add Student
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {channel?.teamMembersDetail?.map((member: any) => (
                    <div
                      key={member.id}
                      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {member.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {(!channel?.teamMembersDetail ||
                  channel?.teamMembersDetail?.length === 0) && (
                  <p className="text-gray-500 text-sm sm:text-base text-center py-8">
                    No students added yet
                  </p>
                )}
              </div>
            )}

            {activeTab === "exams" && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <h2 className="text-base sm:text-lg font-semibold">Exams</h2>
                  {isFacultyOwner && (
                    <button className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    onClick={() =>navigate("/faculty/exams/create")}>
                      Add Exam
                    </button>
                  )}
                </div>
                {exams && exams.length > 0 ? (
                  <div className="grid gap-4">
                    {exams.map((exam: any) => (
                      <div
                        key={exam.id}
                        className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1 w-full">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">
                              {exam.title}
                            </h3>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                              {exam.domain}
                            </p>
                            <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-500">
                              <span>{exam.durationMinutes} min</span>
                              <span>{exam.questionCount} questions</span>
                              <span className="capitalize">
                                {exam.testType}
                              </span>
                              <span className="capitalize text-red-500">
                                {exam.endAt != null && exam.endAt < new Date()
                                  ? "expire"
                                  : ""}
                              </span>
                            </div>
                            {exam.isStart && (
                              <div className="mt-2 text-xs sm:text-sm text-gray-500">
                                Start: {new Date(exam.startAt).toLocaleString()}
                              </div>
                            )}
                          </div>
                          {(!exam.isStart ||
                            (exam.isStart &&
                              new Date(exam.startAt) <= new Date())) &&
                            (!exam.endAt ||
                              new Date(exam.endAt) > new Date()) && (
                              <button
                                onClick={() =>
                                  navigate(`/student/exam/${exam.id}`)
                                }
                                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                              >
                                Start Exam
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm sm:text-base text-center py-8">
                    No exams available
                  </p>
                )}
              </div>
            )}

            {activeTab === "work" && (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <h2 className="text-base sm:text-lg font-semibold">Work</h2>
                  {isFacultyOwner && (
                    <button className="w-full sm:w-auto px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Add Work
                    </button>
                  )}
                </div>
                <p className="text-gray-500 text-sm sm:text-base">
                  Work list will be displayed here
                </p>
              </div>
            )}
            {activeTab === "admin" && (
              <div>
                <div className="flex justify-between mb-4">
                  <h2 className="text-base sm:text-3xl font-bold">Details</h2>
                </div>
                <div>
                  <div className="flex justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold">
                      Description
                    </h2>
                  </div>
                  <div className="w-full bg-white/50 shadow rounded-lg p-2 text-justify text-xl">
                    {channel?.description}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold">
                      Created At
                    </h2>
                  </div>
                  <div className="w-full bg-white/50 shadow rounded-lg p-2 text-justify text-xl">
                    {new Date(channel?.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-semibold">Host</h2>
                  </div>
                  <div className="w-full bg-white/50 shadow rounded-lg">
                    {host ? (
                      <div className="flex flex-col lg:flex-row p-4 sm:p-7 gap-4 sm:gap-5">
                        <div className="flex justify-center lg:justify-start">
                          <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 bg-green-600 text-white rounded-lg flex items-center justify-center text-5xl sm:text-6xl lg:text-7xl font-bold">
                            {host?.name?.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex flex-col justify-center gap-1.5 text-center lg:text-left">
                          <h2 className="text-xl sm:text-2xl font-bold">
                            {host?.name}
                          </h2>
                          <p className="text-gray-700 text-base sm:text-xl break-all">
                            {host?.email}
                          </p>
                          <div className="flex flex-col gap-2 text-sm sm:text-xl">
                            <p className="break-words">
                              <span className="font-semibold">University:</span>{" "}
                              {host?.university}
                            </p>
                            <p className="break-words">
                              <span className="font-semibold">
                                College Name:
                              </span>{" "}
                              {host?.collegeName}
                            </p>
                          </div>
                          <div className="flex justify-center lg:justify-start mt-2">
                            <button className="text-base sm:text-xl text-white bg-purple-600 px-6 py-2 rounded-2xl font-semibold shadow hover:bg-purple-700">
                              Connect
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Loading channel information...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {showJoinPopup && (
        <div className="absolute h-full w-full bg-black/50 top-0 flex flex-col justify-center items-center z-40">
          <div className="md:w-[600px] md:h-72 bg-white flex flex-col justify-center items-center gap-5 shadow rounded-2xl w-[90%] h-64">
            <h2 className="text-center text-2xl md:text-3xl font-bold">
              Do you want to join this channel?
            </h2>
            <div className="w-[80%] flex justify-around">
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
                onClick={reject}
              >
                Reject
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
                onClick={AcceptChannel}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold mb-4">Add Students</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Emails (one per line or comma-separated)
                </label>
                <textarea
                  placeholder="student1@example.com&#10;student2@example.com&#10;or student1@example.com, student2@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={4}
                  value={studentEmails}
                  onChange={(e) => setStudentEmails(e.target.value)}
                  disabled={!!uploadFile}
                />
              </div>
              <div className="text-center text-gray-500 text-sm">OR</div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload CSV/Excel File
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.txt"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                />
                {uploadFile && (
                  <p className="text-sm text-gray-600 mt-1">
                    File: {uploadFile.name}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddStudentModal(false);
                    setStudentEmails("");
                    setUploadFile(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
