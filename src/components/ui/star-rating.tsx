import React, { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
  className,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: maxRating }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isPartial = starValue - 0.5 <= displayRating && starValue > displayRating;

          return (
            <div
              key={index}
              className={cn(
                "relative",
                interactive && "cursor-pointer transition-transform hover:scale-110"
              )}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors",
                  isFilled || isPartial
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
              {isPartial && !isFilled && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    "absolute inset-0 fill-yellow-400 text-yellow-400"
                  )}
                  style={{
                    clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={cn(
          "ml-2 font-medium text-gray-700",
          textSizeClasses[size]
        )}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

interface RatingDistributionProps {
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  totalReviews: number;
  className?: string;
}

export const RatingDistribution: React.FC<RatingDistributionProps> = ({
  distribution,
  totalReviews,
  className,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = distribution[stars as keyof typeof distribution];
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

        return (
          <div key={stars} className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 w-12">
              <span>{stars}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-gray-600 text-xs w-8 text-right">
              {count}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
