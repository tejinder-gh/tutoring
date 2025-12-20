"use client";

interface ProgressBarProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  size = "md",
  showLabel = true,
  className = "",
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`flex-1 bg-accent/50 rounded-full overflow-hidden ${heights[size]}`}
      >
        <div
          className={`h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-sm font-bold text-text-muted min-w-[3rem] text-right">
          {clampedValue}%
        </span>
      )}
    </div>
  );
}
