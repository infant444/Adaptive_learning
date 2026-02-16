/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exam, Channel } from '../../lib/api';
import toast from 'react-hot-toast';

export const CreateExamSingle = () => {
  const [step, setStep] = useState(1);
  const [channels, setChannels] = useState<any[]>([]);
  const navigate = useNavigate();

  // Step 1: Generate Questions
  const [genData, setGenData] = useState({
    subject: '',
    description: '',
    difficulty: 'medium',
    count: 10,
    testType: 'quiz'
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Step 2: Questions
  const [questions, setQuestions] = useState<any[]>([]);

  // Step 3: Exam Details
  const [examData, setExamData] = useState({
    title: '',
    domain: '',
    questionCount: 0,
    isDuration: true,
    durationMinutes: 60,
    isStart: false,
    startAt: '',
    endAt: '',
    testType: 'quiz',
    publishType: 'public',
    organization: '',
    channelId: ''
  });

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const res = await Channel.getFacultyChannel();
      setChannels(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please upload a file');
      return;
    }

    const data = new FormData();
    data.append('subject', genData.subject);
    data.append('description', genData.description);
    data.append('difficulty', genData.difficulty);
    data.append('count', genData.count.toString());
    data.append('testType', genData.testType);
    data.append('file', file);

    setLoading(true);
    try {
      const res = await Exam.generate(data);
      const generatedQuestions = res.data.questions || res.data || [];
      if (generatedQuestions.length === 0) {
        toast.error('No questions generated');
        return;
      }
      console.log(generatedQuestions);
      setQuestions(generatedQuestions);
      setExamData({ ...examData, domain: genData.subject, testType: genData.testType, questionCount: generatedQuestions.length });
      toast.success('Questions generated');
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setExamData({ ...examData, questionCount: questions.length - 1 });
  };

  const handleNextToDetails = () => {
    if (questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      ...examData,
      questions,
      channelId: examData.publishType === 'private' ? examData.channelId : null,
      organization: examData.publishType === 'organization' ? examData.organization : null
    };

    try {
      await Exam.create(data);
      toast.success('Exam created successfully');
      navigate('/faculty/exams');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create exam');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Create Exam</h1>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {s}
              </div>
              {s < 3 && <div className={`flex-1 h-1 ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>Generate</span>
          <span>Edit Questions</span>
          <span>Details</span>
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={handleGenerate} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold mb-4">Step 1: Generate Questions</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={genData.subject}
              onChange={(e) => setGenData({ ...genData, subject: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={genData.description}
              onChange={(e) => setGenData({ ...genData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
              <select
                value={genData.testType}
                onChange={(e) => setGenData({ ...genData, testType: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="quiz">Quiz (MCQ)</option>
                <option value="summary">Descriptive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                value={genData.difficulty}
                onChange={(e) => setGenData({ ...genData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
            <input
              type="number"
              value={genData.count}
              onChange={(e) => setGenData({ ...genData, count: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/faculty/exams')}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Questions'}
            </button>
          </div>
        </form>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Step 2: Edit Questions</h2>
          <div className="space-y-4 mb-6">
            {questions.map((q, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold">Question {i + 1}</h3>
                  <button
                    onClick={() => deleteQuestion(i)}
                    className="text-red-600 hover:bg-red-50 px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                    <textarea
                      value={q.question}
                      onChange={(e) => updateQuestion(i, 'question', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows={2}
                    />
                  </div>

                  {genData.testType === 'quiz' && q.options && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                        {Object.entries(q.options).map(([key, value]: [string, any]) => (
                          <div key={key} className="mb-2">
                            <label className="text-xs text-gray-500">{key}</label>
                            <input
                              value={value}
                              onChange={(e) => {
                                const newOpts = { ...q.options, [key]: e.target.value };
                                updateQuestion(i, 'options', newOpts);
                              }}
                              className="w-full px-3 py-2 border rounded-lg"
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                        <select
                          value={q.correctAnswer}
                          onChange={(e) => updateQuestion(i, 'correctAnswer', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          {Object.keys(q.options).map((key) => (
                            <option key={key} value={key}>{key}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {genData.testType === 'summary' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Key Points</label>
                        {q.keyPoints?.map((point: string, j: number) => (
                          <input
                            key={j}
                            value={point}
                            onChange={(e) => {
                              const newPoints = [...q.keyPoints];
                              newPoints[j] = e.target.value;
                              updateQuestion(i, 'keyPoints', newPoints);
                            }}
                            className="w-full px-3 py-2 border rounded-lg mb-2"
                            placeholder={`Key point ${j + 1}`}
                          />
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Suggested Length</label>
                          <input
                            value={q.suggestedLength || ''}
                            onChange={(e) => updateQuestion(i, 'suggestedLength', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="e.g., 200-300 words"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Marks</label>
                          <input
                            type="number"
                            value={q.marks || 10}
                            onChange={(e) => updateQuestion(i, 'marks', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border rounded-lg"
                            min="1"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleNextToDetails}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Next: Exam Details
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
          <h2 className="text-lg font-semibold mb-4">Step 3: Exam Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={examData.title}
              onChange={(e) => setExamData({ ...examData, title: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
            <input
              type="text"
              value={examData.domain}
              onChange={(e) => setExamData({ ...examData, domain: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={examData.isDuration}
              onChange={(e) => setExamData({ ...examData, isDuration: e.target.checked })}
              className="rounded"
            />
            <label className="text-sm font-medium text-gray-700">Set Duration</label>
          </div>

          {examData.isDuration && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={examData.durationMinutes}
                onChange={(e) => setExamData({ ...examData, durationMinutes: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg"
                min="1"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={examData.isStart}
              onChange={(e) => setExamData({ ...examData, isStart: e.target.checked })}
              className="rounded"
            />
            <label className="text-sm font-medium text-gray-700">Schedule Exam</label>
          </div>

          {examData.isStart && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                <input
                  type="datetime-local"
                  value={examData.startAt}
                  onChange={(e) => setExamData({ ...examData, startAt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={examData.endAt}
                  onChange={(e) => setExamData({ ...examData, endAt: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Publish Type</label>
            <select
              value={examData.publishType}
              onChange={(e) => setExamData({ ...examData, publishType: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="public">Public</option>
              <option value="organization">Organization</option>
              <option value="private">Private (Channel)</option>
            </select>
          </div>

          {examData.publishType === 'organization' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input
                type="text"
                value={examData.organization}
                onChange={(e) => setExamData({ ...examData, organization: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          )}

          {examData.publishType === 'private' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <select
                value={examData.channelId}
                onChange={(e) => setExamData({ ...examData, channelId: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              >
                <option value="">Select Channel</option>
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>{ch.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Exam
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
