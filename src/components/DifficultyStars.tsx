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
    stars.push(
      <span 
        key={i} 
        className={`star ${i <= difficulty ? 'filled' : 'empty'}`}
      >
        ★
      </span>
    );
  }
  
  return (
    <span className={`difficulty-stars difficulty-stars-${size}`} title={`Difficulty: ${difficulty}/${maxStars}`}>
      {stars}
    </span>
  );
}
