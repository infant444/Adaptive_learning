import { BookOpen } from 'lucide-react';

export const Loading = () => {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <BookOpen className="w-16 h-16 text-blue-600 animate-bounce" />
          {/* <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /> */}
        </div>
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    </div>
  );
};
