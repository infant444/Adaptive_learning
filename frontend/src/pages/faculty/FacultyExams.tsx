import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExams } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { Exam } from '../../lib/api';

export const FacultyExams = () => {
  const { exams, error, refetch, searchExams, searchQuery } = useExams();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleDelete = async (examId: string) => {
    if (!confirm('Delete this exam?')) return;
    try {
      await Exam.delete(examId);
      toast.success('Exam deleted');
      refetch();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Exams</h1>
        <button
          onClick={() => navigate('/faculty/exams/create')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Exam
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => searchExams(e.target.value)}
          placeholder="Search exams by title, domain, or type..."
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-4">
        {exams.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
            No exams found
          </div>
        ) : (
          exams.map((exam: any) => (
            <div key={exam.id} className="bg-white p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{exam.title}</h3>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">{exam.domain}</p>
                  <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 text-xs sm:text-sm text-gray-500">
                    <span>{exam.durationMinutes} min</span>
                    <span>{exam.questionCount} questions</span>
                    <span className="capitalize">{exam.testType}</span>
                    <span className="capitalize">{exam.publishType}</span>
                  </div>
                  {exam.isStart && (
                    <div className="mt-2 text-xs sm:text-sm text-gray-500">
                      {new Date(exam.startAt).toLocaleString()}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => navigate(`/faculty/exam/${exam.id}`)}
                    className="flex-1 sm:flex-none px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleDelete(exam.id)}
                    className="flex-1 sm:flex-none px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
