/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Exam, Channel } from '../../lib/api';
import toast from 'react-hot-toast';

export const ExamDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, formData: genData } = location.state || {};
  
  const [channels, setChannels] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    domain: genData?.subject || '',
    questionCount: questions?.length || 0,
    isDuration: true,
    durationMinutes: 60,
    isStart: false,
    startAt: '',
    endAt: '',
    testType: genData?.testType || 'quiz',
    publishType: 'public',
    organization: '',
    channelId: ''
  });

  useEffect(() => {
    if (!questions) {
      navigate('/faculty/exams/create');
      return;
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      questions,
      channelId: formData.publishType === 'private' ? formData.channelId : null,
      organization: formData.publishType === 'organization' ? formData.organization : null
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Step 3: Exam Details</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
          <input
            type="text"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isDuration}
            onChange={(e) => setFormData({ ...formData, isDuration: e.target.checked })}
            className="rounded"
          />
          <label className="text-sm font-medium text-gray-700">Set Duration</label>
        </div>

        {formData.isDuration && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
            <input
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg"
              min="1"
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isStart}
            onChange={(e) => setFormData({ ...formData, isStart: e.target.checked })}
            className="rounded"
          />
          <label className="text-sm font-medium text-gray-700">Schedule Exam</label>
        </div>

        {formData.isStart && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Publish Type</label>
          <select
            value={formData.publishType}
            onChange={(e) => setFormData({ ...formData, publishType: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="public">Public</option>
            <option value="organization">Organization</option>
            <option value="private">Private (Channel)</option>
          </select>
        </div>

        {formData.publishType === 'organization' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
            <input
              type="text"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>
        )}

        {formData.publishType === 'private' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
            <select
              value={formData.channelId}
              onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
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
            onClick={() => navigate('/faculty/exams/edit-questions', { state: { questions, formData: genData } })}
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
    </div>
  );
};
