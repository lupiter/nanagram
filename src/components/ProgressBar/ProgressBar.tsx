import "./ProgressBar.css";

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="progress-container">
      {label && <span className="progress-label">{label}</span>}
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${String(clampedProgress)}%` }}
        />
      </div>
    </div>
  );
}
