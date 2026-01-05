import React from 'react';

interface ClarityGaugeProps {
  score: number;
}

export const ClarityGauge: React.FC<ClarityGaugeProps> = ({ score }) => {
  const size = 220;
  const center = size / 2;
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 3) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  // Determine color based on PRD zones
  let colorClass = "text-emerald-500";
  let bgClass = "bg-emerald-50";
  let label = "Healthy Connection";
  
  if (score < 50) {
    colorClass = "text-rose-500";
    bgClass = "bg-rose-50";
    label = "Critical Zone";
  } else if (score < 80) {
    colorClass = "text-amber-500";
    bgClass = "bg-amber-50";
    label = "Yellow Zone";
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg 
          viewBox={`0 0 ${size} ${size}`} 
          className="transform -rotate-90 w-full h-full drop-shadow-sm"
        >
          {/* Background circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-slate-100"
          />
          {/* Progress circle */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={`transition-all duration-1000 ease-out ${colorClass}`}
          />
        </svg>
        
        {/* Inner Content */}
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Clarity Score</span>
          <span className={`text-6xl font-black tracking-tighter ${colorClass}`}>{score}</span>
        </div>
      </div>
      
      {/* Label Pill */}
      <div className={`mt-6 px-6 py-2 rounded-2xl text-sm font-bold shadow-sm border border-black/5 transition-colors duration-500 ${bgClass} ${colorClass}`}>
        {label}
      </div>
    </div>
  );
};