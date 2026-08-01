import React from 'react';
import { ArrowUp, ArrowDown, ShieldAlert, Cpu, RefreshCw, BarChart2 } from 'lucide-react';

function StatRow({ label, value, unit, icon: Icon, colorClass }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-900/30 border border-gray-800/40 rounded-xl">
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded bg-gray-950 border border-gray-800 ${colorClass}`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold text-gray-400">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-mono font-bold text-white">
          {typeof value === 'number' && !isNaN(value) && value !== 999.9
            ? value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })
            : '0.0'}
        </span>
        <span className="text-[10px] text-gray-500 font-mono font-semibold">{unit}</span>
      </div>
    </div>
  );
}

export default function StatisticsPanel({ stats, onResetStats }) {
  const minV = stats?.minVoltage === 999.9 ? 0.0 : (stats?.minVoltage ?? 0.0);

  return (
    <div className="engineering-card rounded-2xl p-4 md:p-6 border border-gray-800 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-left flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-green-400" /> Session Aggregates
        </h3>
        <button
          onClick={onResetStats}
          className="p-1.5 rounded-lg bg-gray-900 hover:bg-gray-850 border border-gray-800 text-gray-400 hover:text-white cursor-pointer transition-colors"
          title="Reset Aggregates"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="space-y-2.5 flex-1 flex flex-col justify-between">
        <StatRow
          label="Today's Max Voltage"
          value={stats?.maxVoltage ?? 0.0}
          unit="V"
          icon={ArrowUp}
          colorClass="text-blue-400"
        />
        <StatRow
          label="Today's Min Voltage"
          value={minV}
          unit="V"
          icon={ArrowDown}
          colorClass="text-cyan-400"
        />
        <StatRow
          label="Maximum Load Current"
          value={stats?.maxCurrent ?? 0.00}
          unit="A"
          icon={ShieldAlert}
          colorClass="text-red-400"
        />
        <StatRow
          label="Average Voltage"
          value={stats?.avgVoltage ?? 0.0}
          unit="V"
          icon={Cpu}
          colorClass="text-indigo-400"
        />
        <StatRow
          label="Average Current"
          value={stats?.avgCurrent ?? 0.00}
          unit="A"
          icon={Cpu}
          colorClass="text-green-400"
        />
      </div>
    </div>
  );
}
