import React from 'react';

function CircularGauge({
  value,
  min = 0,
  max = 100,
  title,
  unit,
  colorGradientId,
  normalRangeStart,
  normalRangeEnd,
  thresholds = []
}) {
  // SVG parameters
  const size = 200;
  const radius = 70;
  const strokeWidth = 14;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius; // ~439.82
  
  // We want a 270-degree gauge (3/4 of a circle)
  // 90 degrees gap at the bottom
  const arcLength = circumference * 0.75; // ~329.87
  const gapLength = circumference * 0.25; // ~109.95

  // Map value to percentage between min and max
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);
  
  // Calculate dash offset: when percentage is 0, offset is arcLength (empty). When 1, offset is 0 (full).
  const strokeDashoffset = arcLength * (1 - percentage);

  // Rotation to align the 270 degree arc symmetrically (gap at the bottom)
  // Circle starts at 3 o'clock (0 rad). A 270 arc starts at 135 deg and sweeps to 405 deg.
  // Transforming by rotating -225 deg (or 135 deg) puts the gap exactly at the bottom.
  const rotation = 135; 

  // Determine current zone color for value reading
  let textGlow = "text-white";
  if (value > normalRangeEnd) {
    textGlow = "text-red-400 text-shadow-glow-red";
  } else if (value < normalRangeStart && value > 50) {
    textGlow = "text-blue-400 text-shadow-glow-blue";
  } else if (value > 0) {
    textGlow = "text-green-400 text-shadow-glow-green";
  }

  // Calculate needle rotation angle (from -135 to +135 deg, totaling 270 deg)
  const needleAngle = (percentage * 270) - 135;

  return (
    <div className="engineering-card rounded-2xl p-6 border border-gray-800 flex flex-col items-center justify-center relative overflow-hidden">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 self-start">{title} Meter</h3>
      
      <div className="relative w-[180px] h-[180px] flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 select-none">
          <defs>
            {/* Voltage/Current Color Gradient */}
            <linearGradient id={colorGradientId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" /> {/* Blue - Low */}
              <stop offset="50%" stopColor="#22c55e" /> {/* Green - Normal */}
              <stop offset="85%" stopColor="#eab308" /> {/* Yellow - Warning */}
              <stop offset="100%" stopColor="#ef4444" /> {/* Red - Fault */}
            </linearGradient>

            {/* Glowing radial drop shadow filter */}
            <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke="#1f2937"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${center} ${center})`}
          />

          {/* Active Colored Measurement Value Arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={`url(#${colorGradientId})`}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${center} ${center})`}
            className="transition-all duration-500 ease-out"
          />

          {/* Subtle tick marks around the gauge */}
          {[0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1].map((tickPercent, idx) => {
            const tickAngle = (tickPercent * 270) - 135 - 90; // Align with -135deg starting angle
            const angleRad = (tickAngle * Math.PI) / 180;
            const rStart = radius - 8;
            const rEnd = radius - strokeWidth / 2;
            const x1 = center + rStart * Math.cos(angleRad);
            const y1 = center + rStart * Math.sin(angleRad);
            const x2 = center + rEnd * Math.cos(angleRad);
            const y2 = center + rEnd * Math.sin(angleRad);
            return (
              <line
                key={idx}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#4b5563"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>

        {/* Center Display Readings */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
          <span className={`text-3xl font-mono font-bold tracking-tight ${textGlow} transition-all duration-300`}>
            {value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs font-semibold text-gray-500 font-mono mt-0.5 tracking-wider uppercase">
            {unit}
          </span>
        </div>

        {/* High-tech Analog Needle Indicator */}
        <div 
          className="absolute w-2 h-20 bottom-1/2 left-[calc(50%-4px)] origin-bottom transition-all duration-500 ease-out pointer-events-none"
          style={{ transform: `rotate(${needleAngle}deg)` }}
        >
          {/* Needle Shaft */}
          <div className="w-[2px] h-[72px] bg-red-500 mx-auto rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
          {/* Needle Base Circle */}
          <div className="w-[10px] h-[10px] bg-red-500 rounded-full border border-gray-900 absolute bottom-[-5px] left-[-1px] shadow-[0_0_8px_rgba(239,68,68,0.8)]"></div>
        </div>
      </div>

      {/* Gauge Limits / Min-Max Labels */}
      <div className="w-full flex justify-between text-[10px] font-bold font-mono text-gray-500 px-4 mt-2">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}

export default function GaugeMeters({ data }) {
  const voltage = data?.voltage ?? 0.0;
  const current = data?.current ?? 0.0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <CircularGauge
        title="AC Line Voltage"
        value={voltage}
        min={0}
        max={300}
        unit="V"
        colorGradientId="voltageGrad"
        normalRangeStart={210}
        normalRangeEnd={245}
      />
      <CircularGauge
        title="Load Current"
        value={current}
        min={0}
        max={6}
        unit="A"
        colorGradientId="currentGrad"
        normalRangeStart={0.0}
        normalRangeEnd={4.5}
      />
    </div>
  );
}
