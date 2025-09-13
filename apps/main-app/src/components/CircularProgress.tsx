import React from 'react';

interface CircularProgressProps {
  progress: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ progress }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      {/* Background Circle */}
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(226, 232, 240, 0.2)"
          strokeWidth="8"
        />
        
        {/* Progress Circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(226, 232, 240, 0.8)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
        />
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-inter font-semibold text-xl text-mystical-moonlight">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  );
};

export default CircularProgress;