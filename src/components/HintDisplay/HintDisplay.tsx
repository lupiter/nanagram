import clsx from "clsx";
import { Hint } from "../../types/nonogram";
import "./HintDisplay.css";

interface HintDisplayProps {
  hints: Hint[] | undefined;
  isVertical?: boolean;
}

export default function HintDisplay({ hints, isVertical = true }: HintDisplayProps) {
  return (
    <div className={clsx('hint-numbers', isVertical ? 'vertical' : 'horizontal')}>
      {hints?.map((hint, i) => 
        hint.used ? (
          <del key={i}>{hint.hint}</del>
        ) : (
          <span key={i}>{hint.hint}</span>
        )
      )}
    </div>
  );
} 