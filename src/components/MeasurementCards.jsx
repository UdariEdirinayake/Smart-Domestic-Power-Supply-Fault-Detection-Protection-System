import React, { useState, useEffect, useRef } from 'react';
import { Zap, Activity, Waves, TrendingUp, Compass, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

function MeasurementCard({ title, value, unit, icon: Icon, colorClass, glowClass }) {
  const prevValRef = useRef(value);
  const [trend, setTrend] = useState('stable'); // 'up' | 'down' | 'stable'
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const prev = prevValRef.current;
    if (value > prev) {
      setTrend('up');
      setPulse(true);
    } else if (value < prev) {
      setTrend('down');
      setPulse(true);
    } else {
      setTrend('stable');
    }
    
    // Clear pulsing state after animation completes
    const timer = setTimeout(() => setPulse(false), 400);
    prevValRef.current = value;
    
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className={`engineering-card rounded-2xl p-5 border border-gray-800 transition-all duration-300 relative overflow-hidden ${pulse ? glowClass : ''}`}>
      {/* Decorative vertical line */}
      <div className={`absolute top-0 left-0 w-1 h-full ${colorClass}`}></div>

      <div className="flex items-center justify-between mb-3 text-left">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{title}</span>
        <div className={`p-2 rounded-lg bg-gray-900 border border-gray-800 ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1 text-left">
          <span className="text-3xl font-mono font-bold tracking-tight text-white select-none">
            {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : value}
          </span>
          <span className="text-sm font-semibold text-gray-400 font-mono">{unit}</span>
        </div>

        {/* Dynamic Trend Indicator */}
        <div className="flex items-center">
          {trend === 'up' && (
            <span className="flex items-center text-xs font-bold text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20 font-mono gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> UP
            </span>
          )}
          {trend === 'down' && (
            <span className="flex items-center text-xs font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 font-mono gap-0.5">
              <ArrowDownRight className="w-3.5 h-3.5" /> DOWN
            </span>
          )}
          {trend === 'stable' && (
            <span className="flex items-center text-xs font-bold text-gray-500 bg-gray-900 px-1.5 py-0.5 rounded border border-gray-800 font-mono gap-0.5">
              <Minus className="w-3.5 h-3.5" /> STABLE
            </span>
          )}
        </div>
      </div>

      {/* Pulsing micro indicator */}
      <div className="absolute right-3 top-3">
        <span className={`flex h-1.5 w-1.5 relative ${pulse ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colorClass.replace('text-', 'bg-')}`}></span>
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${colorClass.replace('text-', 'bg-')}`}></span>
        </span>
      </div>
    </div>
  );
}

export default function MeasurementCards({ data }) {
  // Use fallbacks for mock data representation
  const voltage = data?.voltage ?? 0.0;
  const current = data?.current ?? 0.0;
  const power = data?.power ?? 0.0;
  const frequency = data?.frequency ?? 50.0;
  const powerFactor = voltage > 0 && current > 0 ? 0.95 : 0.00;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      <MeasurementCard
        title="Voltage"
        value={voltage}
        unit="V"
        icon={Zap}
        colorClass="text-blue-400"
        glowClass="glow-blue border-blue-500/50"
      />
      <MeasurementCard
        title="Current"
        value={current}
        unit="A"
        icon={Activity}
        colorClass="text-green-400"
        glowClass="glow-green border-green-500/50"
      />
      <MeasurementCard
        title="Active Power"
        value={power}
        unit="W"
        icon={TrendingUp}
        colorClass="text-red-400"
        glowClass="glow-red border-red-500/50"
      />
      <MeasurementCard
        title="Grid Frequency"
        value={frequency}
        unit="Hz"
        icon={Waves}
        colorClass="text-cyan-400"
        glowClass="glow-blue border-cyan-500/50"
      />
      <MeasurementCard
        title="Power Factor"
        value={powerFactor}
        unit="cos φ"
        icon={Compass}
        colorClass="text-amber-400"
        glowClass="glow-amber border-amber-500/50"
      />
    </div>
  );
}
