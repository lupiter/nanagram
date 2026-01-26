import clsx from 'clsx';
import { Icons } from '../Icons/Icons';
import './DifficultyStars.css';

interface DifficultyStarsProps {
  difficulty: number;
  maxStars?: number;
  size?: 'small' | 'medium' | 'large';
}

export default function DifficultyStars({ 
  difficulty, 
  maxStars = 5,
  size = 'medium' 
}: DifficultyStarsProps) {
  if (difficulty <= 0) return null;
  
  const stars = [];
  for (let i = 1; i <= maxStars; i++) {
    const isFilled = i <= difficulty;
    stars.push(
      <span key={i} className="star">
        {isFilled ? <Icons.StarFilled /> : <Icons.StarEmpty />}
      </span>
    );
  }
  
  return (
    <span className={clsx('difficulty-stars', `difficulty-stars-${size}`)} title={`Difficulty: ${String(difficulty)}/${String(maxStars)}`}>
      {stars}
    </span>
  );
}
