/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import { setLoadingHandler } from '../lib/api';

interface LoadingContextType {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const setLoading = (loading: boolean) => {
    setIsLoading(loading);
  };

  useEffect(() => {
    setLoadingHandler(setLoading);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <BookOpen className="w-16 h-16 text-blue-600 animate-bounce" />
              {/* <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /> */}
            </div>
            <p className="text-white/85 font-medium">Loading...</p>
          </div>
        </div>
      )}
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within LoadingProvider');
  return context;
};
