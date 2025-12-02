import React from 'react';

interface JokeDisplayProps {
  text: string;
  loading: boolean;
}

export const JokeDisplay: React.FC<JokeDisplayProps> = ({ text, loading }) => {
  if (loading) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center space-y-4">
        <div className="w-16 h-16 border-4 border-pink-300 border-t-pink-500 rounded-full animate-spin"></div>
        <p className="text-pink-500 font-cute text-xl animate-pulse">正在想一个超级好笑的笑话...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-64 flex items-center justify-center p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-4 border-pink-100 transform rotate-1">
      <p className="text-2xl md:text-3xl text-gray-700 leading-relaxed font-cute text-center break-words">
        {text}
      </p>
    </div>
  );
};