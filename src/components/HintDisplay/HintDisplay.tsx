import clsx from "clsx";
import { Hint } from "../../types/nonogram";
import "./HintDisplay.css";

interface HintDisplayProps {
  hints: Hint[] | undefined;
  isVertical?: boolean;
  puzzleSize?: number;
}

export default function HintDisplay({ hints, isVertical = true, puzzleSize = 5 }: HintDisplayProps) {
  return (
    <div className={clsx('hint-numbers', isVertical ? 'vertical' : 'horizontal', `puzzle-size-${String(puzzleSize)}`)}>
      {hints?.map((hint, i) => (
        <span key={i} className={clsx({ used: hint.used })}>
          {hint.hint}
        </span>
      ))}
    </div>
  );
} 