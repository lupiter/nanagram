import clsx from "clsx";
import { PuzzleSolutionData } from "../../types/nonogram";
import SolutionPreview from "../SolutionPreview/SolutionPreview";
import DifficultyStars from "../DifficultyStars/DifficultyStars";
import "./PuzzleCard.css";

interface PuzzleCardProps {
  solution: PuzzleSolutionData;
  title: string;
  subtitle?: string;
  difficulty: number;
  onClick?: () => void;
  previewSize?: number;
  className?: string;
}

export default function PuzzleCard({
  solution,
  title,
  subtitle,
  difficulty,
  onClick,
  previewSize = 80,
  className,
}: PuzzleCardProps) {
  const cardClass = clsx('puzzle-card', { 'puzzle-card-clickable': onClick }, className);

  if (onClick) {
    return (
      <button className={cardClass} onClick={onClick} type="button">
        <SolutionPreview solution={solution} maxSize={previewSize} />
        <span className="puzzle-card-title">{title}</span>
        {subtitle && <span className="puzzle-card-subtitle">{subtitle}</span>}
        <DifficultyStars difficulty={difficulty} size="small" />
      </button>
    );
  }

  return (
    <div className={cardClass}>
      <SolutionPreview solution={solution} maxSize={previewSize} />
      <span className="puzzle-card-title">{title}</span>
      {subtitle && <span className="puzzle-card-subtitle">{subtitle}</span>}
      <DifficultyStars difficulty={difficulty} size="small" />
    </div>
  );
}
