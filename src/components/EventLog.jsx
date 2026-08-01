import React, { useState } from 'react';
import { Trash2, ShieldAlert, AlertCircle, CheckCircle, Info, Filter } from 'lucide-react';

const STATUS_BADGES = {
  NORMAL: "bg-green-500/10 text-green-400 border border-green-500/20",
  WARNING: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
  OVER_VOLTAGE: "bg-red-500/10 text-red-400 border border-red-500/20",
  UNDER_VOLTAGE: "bg-red-500/10 text-red-400 border border-red-500/20",
  OVER_CURRENT: "bg-red-500/10 text-red-400 border border-red-500/20",
  FAULT: "bg-red-600/15 text-red-400 border border-red-650/25 animate-pulse",
  SENSOR_ERROR: "bg-gray-800 text-gray-400 border border-gray-700"
};

export default function EventLog({ logs = [], onClearLogs }) {
  const [filter, setFilter] = useState("ALL"); // ALL, FAULTS, WARNINGS

  const filteredLogs = logs.filter(log => {
    if (filter === "ALL") return true;
    if (filter === "FAULTS") {
      return ["FAULT", "OVER_VOLTAGE", "UNDER_VOLTAGE", "OVER_CURRENT", "SENSOR_ERROR"].includes(log.status);
    }
    if (filter === "WARNINGS") return log.status === "WARNING";
    if (filter === "NORMAL") return log.status === "NORMAL";
    return true;
  });

  return (
    <div className="engineering-card rounded-2xl p-4 md:p-6 border border-gray-800 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-left">System Event Log</h3>
          <p className="text-xs text-gray-500 text-left font-sans mt-0.5">Audit log of grid states and trip protection events</p>
        </div>
        
        {/* Logs Filter Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="flex bg-gray-950 p-0.5 rounded-lg border border-gray-800 text-[10px] font-bold font-mono">
            {["ALL", "FAULTS", "WARNINGS", "NORMAL"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`cursor-pointer px-2 py-1 rounded transition-colors ${
                  filter === f
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="p-1.5 rounded-lg bg-gray-990 hover:bg-red-500/10 border border-gray-850 text-gray-500 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            title="Clear Event Logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Logs Table Container */}
      <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto border border-gray-800/80 rounded-xl bg-gray-950/40">
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 py-10">
            <Info className="w-8 h-8 stroke-1 mb-2" />
            <p className="text-xs font-mono">No events matching filter query.</p>
          </div>
        ) : (
          <table className="w-full text-left font-mono border-collapse">
            <thead>
              <tr className="bg-gray-900 border-b border-gray-800 text-[9px] font-bold uppercase tracking-wider text-gray-400 select-none">
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-3">Voltage</th>
                <th className="py-2.5 px-3">Current</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-4 w-1/3">Action Taken</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-gray-900">
              {filteredLogs.map((log) => {
                const badge = STATUS_BADGES[log.status] || STATUS_BADGES.NORMAL;
                const logTime = new Date(log.timestamp);
                const timeStr = logTime.toLocaleTimeString([], { hour12: false }) + '.' + String(logTime.getMilliseconds()).padStart(3, '0');

                return (
                  <tr key={log.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="py-2.5 px-4 text-gray-400 text-[11px] whitespace-nowrap">{timeStr}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {log.voltage.toFixed(1)} <span className="text-[9px] text-gray-500 font-normal">V</span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {log.current.toFixed(2)} <span className="text-[9px] text-gray-500 font-normal">A</span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${badge}`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-gray-300 leading-normal">{log.actionTaken}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
