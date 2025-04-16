
import { Star } from "lucide-react";
import { useEffect, useState } from "react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
}

const StarRating = ({ 
  value = 0, 
  onChange, 
  size = 24, 
  readOnly = false 
}: StarRatingProps) => {
  const [rating, setRating] = useState<number>(value);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    setRating(value);
  }, [value]);

  const handleClick = (newRating: number) => {
    if (readOnly) return;
    
    setRating(newRating);
    if (onChange) {
      onChange(newRating);
    }
  };

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={`cursor-${readOnly ? 'default' : 'pointer'} transition-colors ${
            (hover !== null ? hover >= star : rating >= star)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          }`}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(null)}
        />
      ))}
    </div>
  );
};

export default StarRating;
