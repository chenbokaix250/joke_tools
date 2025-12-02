import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  onRate: (rating: number) => void;
  disabled?: boolean;
}

export const Rating: React.FC<RatingProps> = ({ rating, onRate, disabled }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-pink-600 font-cute text-xl">这个笑话好笑吗？</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onRate(star)}
            disabled={disabled}
            className={`transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none`}
          >
            <Star
              size={40}
              fill={star <= rating ? "#FBBF24" : "none"}
              stroke={star <= rating ? "#FBBF24" : "#9CA3AF"}
              className={star <= rating ? "text-yellow-400 drop-shadow-sm" : "text-gray-400"}
            />
          </button>
        ))}
      </div>
      {rating > 0 && (
        <div className="h-8 mt-1">
          <span className="text-lg font-cute text-purple-600 animate-bounce block">
            {rating === 5 ? "太棒了！哈哈哈哈！" :
             rating >= 4 ? "很好笑！" :
             rating >= 3 ? "还不错哦！" : "一般般啦~"}
          </span>
        </div>
      )}
    </div>
  );
};