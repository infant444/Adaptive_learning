import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExams, useExploreExams } from '../../hooks/useApi';
import toast from 'react-hot-toast';

const CountdownTimer = ({ startAt }: { startAt: string }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startAt).getTime();
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        clearInterval(interval);
        window.location.reload();
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startAt]);

  return <span className="text-orange-600 font-semibold">{timeLeft}</span>;
};

export const StudentExams = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'explore'>('my');
  const { exams: myExams, error: myError, searchExams: searchMy, searchQuery: myQuery } = useExams();
  const { exploreExams, error: exploreError, searchExams: searchExplore, searchQuery: exploreQuery } = useExploreExams();
  const navigate = useNavigate();

  useEffect(() => {
    if (myError) toast.error(myError);
    if (exploreError) toast.error(exploreError);
  }, [myError, exploreError]);

  const exams = activeTab === 'my' ? myExams : exploreExams;
  const searchQuery = activeTab === 'my' ? myQuery : exploreQuery;
  const searchExams = activeTab === 'my' ? searchMy : searchExplore;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Exams</h1>

      <div className="flex gap-2 sm:gap-4 mb-6 border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab('my')}
          className={`pb-2 px-3 sm:px-4 whitespace-nowrap text-sm sm:text-base ${activeTab === 'my' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-600'}`}
        >
          My Exams
        </button>
        <button
          onClick={() => setActiveTab('explore')}
          className={`pb-2 px-3 sm:px-4 whitespace-nowrap text-sm sm:text-base ${activeTab === 'explore' ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-600'}`}
        >
          Explore Exams
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
            No exams available
          </div>
        ) : (
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                      Start: {new Date(exam.startAt).toLocaleString()}
                    </div>
                  )}
                </div>
                {exam.isStart && exam.endAt && new Date(exam.endAt) < new Date() ? (
                  <div className="w-full sm:w-auto px-4 py-2 bg-red-100 text-red-700 rounded-lg text-center text-sm sm:text-base font-semibold">
                    Time Expired
                  </div>
                ) : exam.isStart && new Date(exam.startAt) > new Date() ? (
                  <div className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-center text-sm sm:text-base">
                    Starts in: <CountdownTimer startAt={exam.startAt} />
                  </div>
                ) : (
                  <button
                    onClick={() => navigate(`/student/exam/${exam.id}`)}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                  >
                    Start Exam
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
