import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const EditQuestions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions: initialQuestions, formData } = location.state || {};
  const [questions, setQuestions] = useState(initialQuestions || []);

  if (!initialQuestions) {
    navigate('/faculty/exams/create');
    return null;
  }

  const handleNext = () => {
    if (questions.length === 0) {
      toast.error('Add at least one question');
      return;
    }
    navigate('/faculty/exams/exam-details', { state: { questions, formData } });
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_: any, i: number) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Step 2: Edit Questions</h1>

      <div className="space-y-4 mb-6">
        {questions.map((q: any, i: number) => (
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

              {formData.testType === 'quiz' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                    {q.options?.map((opt: string, j: number) => (
                      <input
                        key={j}
                        value={opt}
                        onChange={(e) => {
                          const newOpts = [...q.options];
                          newOpts[j] = e.target.value;
                          updateQuestion(i, 'options', newOpts);
                        }}
                        className="w-full px-3 py-2 border rounded-lg mb-2"
                        placeholder={`Option ${j + 1}`}
                      />
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer</label>
                    <input
                      value={q.correctAnswer}
                      onChange={(e) => updateQuestion(i, 'correctAnswer', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation</label>
                <textarea
                  value={q.explanation || ''}
                  onChange={(e) => updateQuestion(i, 'explanation', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => navigate('/faculty/exams/create')}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Next: Exam Details
        </button>
      </div>
    </div>
  );
};
