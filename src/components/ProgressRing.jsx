import React from 'react';

export default function ProgressRing({ percentage }) {
  const pct = Math.max(0, Math.min(100, percentage));
  const r = 38;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  
  const col = pct >= 100 ? "#10b981" : pct >= 50 ? "#818cf8" : "#eab308";

  return (
    <svg width="86" height="86" viewBox="0 0 90 90">
      <circle cx="45" cy="45" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
      <circle 
        cx="45" cy="45" r={r} 
        fill="none" 
        stroke={col} 
        strokeWidth="5" 
        strokeDasharray={c} 
        strokeDashoffset={off} 
        strokeLinecap="round" 
        transform="rotate(-90 45 45)" 
        style={{ transition: "stroke-dashoffset 0.6s ease" }} 
      />
      <text 
        x="45" y="43" 
        textAnchor="middle" 
        fill={col} 
        className="mono font-bold" 
        fontSize="18"
      >
        {Math.round(pct)}%
      </text>
      <text 
        x="45" y="56" 
        textAnchor="middle" 
        fill="var(--text-dim)" 
        className="font-semibold" 
        fontSize="8"
        letterSpacing="1px"
      >
        TODAY
      </text>
    </svg>
  );
}
