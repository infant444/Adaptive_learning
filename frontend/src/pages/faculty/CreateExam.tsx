import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exam } from '../../lib/api';
import toast from 'react-hot-toast';

export const CreateExam = () => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    difficulty: 'medium',
    count: 10,
    testType: 'quiz'
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please upload a file');
      return;
    }

    const data = new FormData();
    data.append('subject', formData.subject);
    data.append('description', formData.description);
    data.append('difficulty', formData.difficulty);
    data.append('count', formData.count.toString());
    data.append('testType', formData.testType);
    data.append('file', file);

    setLoading(true);
    try {
      const res = await Exam.generate(data);
      toast.success('Questions generated');
      navigate('/faculty/exams/edit-questions', { state: { questions: res.data, formData } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Exam - Step 1: Generate Questions</h1>
      
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
          <select
            value={formData.testType}
            onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="quiz">Quiz (MCQ)</option>
            <option value="summary">Descriptive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
          <input
            type="number"
            value={formData.count}
            onChange={(e) => setFormData({ ...formData, count: parseInt(e.target.value) })}
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

        <div className="flex gap-3">
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
    </div>
  );
};
