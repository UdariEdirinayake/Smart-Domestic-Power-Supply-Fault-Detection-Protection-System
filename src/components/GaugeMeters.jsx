import React from 'react';
import { ShieldAlert } from 'lucide-react';

function DesignGauge({
  value,
  min = 0,
  max = 100,
  title,
  unit,
  normalColor = "#10b981", 
  glowClass = "glow-green",
  alertState = "none",
  thresholdText = ""
}) {
  const size = 220;
  const radius = 80;
  const strokeWidth = 16;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius; 
  const arcLength = circumference * 0.75; 
  
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);
  const strokeDashoffset = arcLength * (1 - percentage);
  
  const rotation = 135; 
  const needleAngle = (percentage * 270) - 135;

  let trackColor = "#1e293b";
  let activeStroke = normalColor;
  let textClass = "text-white";
  let glowStyle = glowClass;
  let isAlertActive = alertState !== "none";

  if (alertState === "danger") {
    activeStroke = "#ef4444"; 
    textClass = "text-shadow-glow-red text-red-400";
    glowStyle = "glow-red border-red-500/40 bg-red-950/5";
  } else if (alertState === "warning") {
    activeStroke = "#f59e0b"; 
    textClass = "text-shadow-glow-amber text-amber-400";
    glowStyle = "glow-amber border-amber-500/40 bg-amber-950/5";
  } else if (alertState === "off") {
    activeStroke = "#6b7280"; 
    textClass = "text-gray-400";
    glowStyle = "border-gray-800 bg-gray-950/10";
  }

  return (
    <div className={`engineering-card rounded-3xl p-6 border transition-all duration-500 flex flex-col items-center justify-center relative overflow-hidden ${isAlertActive ? glowStyle : 'border-gray-800 bg-gray-950/40'}`}>
      
      {isAlertActive && (
        <div className={`absolute top-0 inset-x-0 py-1 text-[10px] font-bold font-mono tracking-widest text-center flex items-center justify-center gap-1.5 ${
          alertState === "danger" ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
        }`}>
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          <span>{alertState === "danger" ? "SAFETY FAULT ENGAGED" : "LIMIT WARNING"}</span>
        </div>
      )}

      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-2 mb-4">{title}</h3>
      
      <div className="relative w-[200px] h-[200px] flex items-center justify-center select-none">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90">
          <defs>
            <radialGradient id="alertGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </radialGradient>
          </defs>

          {alertState === "danger" && (
            <circle cx={center} cy={center} r={radius} fill="url(#alertGlow)" />
          )}

          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${center} ${center})`}
          />

          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="transparent"
            stroke={activeStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(${rotation} ${center} ${center})`}
            className="transition-all duration-500 ease-out"
          />

          {[0, 0.25, 0.5, 0.75, 1].map((tickPercent, idx) => {
            const tickAngle = (tickPercent * 270) - 135 - 90;
            const angleRad = (tickAngle * Math.PI) / 180;
            const rStart = radius - 10;
            const rEnd = radius - 2;
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
                stroke={isAlertActive ? activeStroke : "#4b5563"}
                strokeWidth={idx % 2 === 0 ? "2.5" : "1.5"}
              />
            );
          })}
        </svg>

        <div 
          className="absolute w-2 h-24 bottom-1/2 left-[calc(50%-4px)] origin-bottom transition-all duration-500 ease-out pointer-events-none"
          style={{ transform: `rotate(${needleAngle}deg)` }}
        >
          <div className={`w-[2.5px] h-[84px] mx-auto rounded-full ${
            alertState === "danger" ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : alertState === "warning" ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-gray-300'
          }`}></div>
          <div className={`w-3.5 h-3.5 rounded-full absolute bottom-[-7px] left-[-3px] border border-gray-900 ${
            alertState === "danger" ? 'bg-red-500' : alertState === "warning" ? 'bg-amber-500' : 'bg-gray-700'
          }`}></div>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center">
        <div className="flex items-baseline justify-center gap-1.5">
          <span className={`text-4xl font-mono font-bold tracking-tight ${textClass} transition-all duration-300`}>
            {value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
          </span>
          <span className="text-base font-bold text-gray-400 font-mono tracking-wider">{unit}</span>
        </div>
        
        <span className="text-[10px] font-mono text-gray-500 uppercase mt-2 tracking-widest">
          {thresholdText}
        </span>
      </div>

    </div>
  );
}

export default function GaugeMeters({ data, status }) {
  const voltage = data?.voltage ?? 0.0;
  const current = data?.current ?? 0.0;

  const upperStatus = String(status || "").toUpperCase();

  let voltageAlert = "none";
  let currentAlert = "none";

  if (upperStatus === "POWER_OFF") {
    voltageAlert = "off";
    currentAlert = "off";
  } else {
    if (upperStatus === "OVER_VOLTAGE") {
      voltageAlert = "danger";
    } else if (upperStatus === "UNDER_VOLTAGE") {
      voltageAlert = "warning";
    }

    if (upperStatus === "OVER_CURRENT") {
      currentAlert = "danger";
    } else if (upperStatus === "UNDER_CURRENT") {
      currentAlert = "warning";
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <DesignGauge
        title="AC Mains Voltage"
        value={voltage}
        min={0}
        max={300}
        unit="V"
        normalColor="#3b82f6" 
        glowClass="glow-blue border-blue-500/50"
        alertState={voltageAlert}
        thresholdText="Limit: 200V - 250V"
      />
      <DesignGauge
        title="Load Current"
        value={current}
        min={0.0}
        max={4.0} 
        unit="A"
        normalColor="#10b981" 
        glowClass="glow-green border-green-500/50"
        alertState={currentAlert}
        thresholdText="Limit: 0.1A - 2.0A"
      />
    </div>
  );
}
