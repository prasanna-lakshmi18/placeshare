import { Heart } from 'lucide-react';
import { useState } from 'react';
import { cn } from './ThemeToggle';

interface LikeButtonProps {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
}

export function LikeButton({ liked, count, onToggle, disabled }: LikeButtonProps) {
  const [animating, setAnimating] = useState(false);

  const handleClick = () => {
    if (disabled) return;
    setAnimating(true);
    onToggle();
    setTimeout(() => setAnimating(false), 300); // match duration-300
  };

  return (
    <button
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm transition-all duration-300",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "hover:bg-gray-100 dark:hover:bg-gray-800",
        liked ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10" : "text-gray-500 dark:text-gray-400"
      )}
      onClick={handleClick}
      disabled={disabled}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      <Heart
        size={18}
        className={cn(
          "transition-all duration-300",
          liked && "fill-current",
          animating && "scale-125"
        )}
      />
      <span>{count}</span>
    </button>
  );
}
