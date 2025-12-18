"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  targetDate: Date;
}


const TimeBlock = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="bg-accent border border-border rounded-lg p-3 min-w-[60px]">
      <span className="text-2xl sm:text-3xl font-bold text-foreground">
        {value.toString().padStart(2, "0")}
      </span>
    </div>
    <span className="text-xs text-text-muted mt-1 uppercase tracking-wider">
      {label}
    </span>
  </div>
);

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);



  return (
    <div className="inline-flex items-center gap-2 sm:gap-3">
      <TimeBlock value={timeLeft.days} label="Days" />
      <span className="text-2xl text-text-muted">:</span>
      <TimeBlock value={timeLeft.hours} label="Hours" />
      <span className="text-2xl text-text-muted">:</span>
      <TimeBlock value={timeLeft.minutes} label="Mins" />
      <span className="text-2xl text-text-muted hidden sm:block">:</span>
      <div className="hidden sm:block">
        <TimeBlock value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  );
}
