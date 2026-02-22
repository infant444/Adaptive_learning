/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Channel, User, Exam } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const useChannels = () => {
  const [channels, setChannels] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();


  const fetchChannels = async () => {
    try {
      setError(null);
      const response = user?.role === 'faculty'
        ? await Channel.getFacultyChannel()
        : await Channel.getStudentChannel();
      setChannels(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch channels');
      setChannels([]);
    }
  };

  useEffect(() => {
    if (user) {
      fetchChannels();
    }
  }, [user]);

  return { channels, error, refetch: fetchChannels };
};
export const useExploreChannels = () => {
  const [exploreChannel, setExploreChannel] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();



  const fetchExploreChannels = async () => {
    try {
      setError(null);
      const response = await Channel.getExploreChannel();
      setExploreChannel(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch channels');
      setExploreChannel([]);
    }
  };
  useEffect(() => {
    if (user) {
      fetchExploreChannels()
    }
  }, [user]);

  return { exploreChannel, error, refetch: fetchExploreChannels };
};


export const useStudents = () => {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
      setError(null);
      const response = await User.getStudent();
      setStudents(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, error, refetch: fetchStudents };
};

export const useFaculty = () => {
  const [faculty, setFaculty] = useState([]);
  const [error, setError] = useState<string | null>(null);

  const fetchFaculty = async () => {
    try {
      setError(null);
      const response = await User.getFaculty();
      setFaculty(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch faculty');
      setFaculty([]);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  return { faculty, error, refetch: fetchFaculty };
};

export const useExams = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchExams = async () => {
    try {
      setError(null);
      const response = user?.role === 'faculty'
        ? await Exam.getFaculty()
        : await Exam.getMy();
      setExams(response.data || []);
      setFilteredExams(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch exams');
      setExams([]);
      setFilteredExams([]);
    }
  };

  const searchExams = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredExams(exams);
      return;
    }
    const filtered = exams.filter((exam: any) =>
      exam.title?.toLowerCase().includes(query.toLowerCase()) ||
      exam.domain?.toLowerCase().includes(query.toLowerCase()) ||
      exam.testType?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredExams(filtered);
  };

  useEffect(() => {
    if (user) {
      fetchExams();
    }
  }, [user]);

  return { exams: filteredExams, error, refetch: fetchExams, searchExams, searchQuery };
};

export const useExploreExams = () => {
  const [exploreExams, setExploreExams] = useState([]);
  const [filteredExploreExams, setFilteredExploreExams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchExploreExams = async () => {
    try {
      setError(null);
      const response = await Exam.explore();
      setExploreExams(response.data || []);
      console.log(response.data)
      setFilteredExploreExams(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch exams');
      setExploreExams([]);
      setFilteredExploreExams([]);
    }
  };

  const searchExams = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredExploreExams(exploreExams);
      return;
    }
    const filtered = exploreExams.filter((exam: any) =>
      exam.title?.toLowerCase().includes(query.toLowerCase()) ||
      exam.domain?.toLowerCase().includes(query.toLowerCase()) ||
      exam.testType?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredExploreExams(filtered);
  };

  useEffect(() => {
    fetchExploreExams();
  }, []);

  return { exploreExams: filteredExploreExams, error, refetch: fetchExploreExams, searchExams, searchQuery };
};
