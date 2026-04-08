"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  className?: string;
  isEditable?: boolean;
}

export function StarRating({
  rating,
  size = 20,
  onRatingChange,
  className,
  isEditable = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEditable) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const starWidth = rect.width / 5;
    const hoverIndex = Math.ceil((e.clientX - rect.left) / starWidth);
    setHoverRating(hoverIndex);
  };

  const handleMouseLeave = () => {
    if (!isEditable) return;
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (!isEditable || !onRatingChange) return;
    onRatingChange(index);
  };

  return (
    <div
      className={cn("flex items-center gap-1", isEditable && "cursor-pointer", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((index) => {
        const fillValue = isEditable ? hoverRating : rating;
        return (
          <Star
            key={index}
            size={size}
            className={cn(
              "transition-colors",
              fillValue >= index ? "text-yellow-400 fill-yellow-400" : "text-gray-600"
            )}
            onClick={() => handleClick(index)}
          />
        );
      })}
    </div>
  );
}
