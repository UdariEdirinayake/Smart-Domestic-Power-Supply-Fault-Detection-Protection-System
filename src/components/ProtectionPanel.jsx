import React from 'react';
import { ShieldCheck, ShieldAlert, CheckCircle, Power, RefreshCw, AlertOctagon } from 'lucide-react';

export default function ProtectionPanel({
  relay,
  status,
  faultCount,
  lastFaultTime,
  onToggleRelay,
  isConnecting,
  isSimulated
}) {
  const isNormal = status === "NORMAL";
  const protectionActive = !relay || !isNormal;

  // Format the last fault time
  const formattedLastFault = lastFaultTime
    ? new Date(lastFaultTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + new Date(lastFaultTime).toLocaleDateString([], { month: '2-digit', day: '2-digit' })
    : "No Faults Recorded";

  return (
    <div className="engineering-card rounded-2xl p-4 md:p-6 border border-gray-800 flex flex-col h-full">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-left mb-4">
        Protection Panel
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-5">
        {/* Relay Status Card */}
        <div className={`p-4 rounded-xl border text-left flex flex-col justify-between ${
          relay
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Relay Status</span>
            <Power className="w-4 h-4" />
          </div>
          <div className="mt-4">
            <div className="text-2xl font-mono font-bold tracking-wider">
              {relay ? "CONNECTED" : "ISOLATED"}
            </div>
            <span className="text-[9px] text-gray-500 font-medium font-sans">
              {relay ? "Load actively powered" : "Fault isolation triggered"}
            </span>
          </div>
        </div>

        {/* Protection Active State Card */}
        <div className={`p-4 rounded-xl border text-left flex flex-col justify-between ${
          protectionActive
            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Protection Circuit</span>
            {protectionActive ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
          </div>
          <div className="mt-4">
            <div className="text-2xl font-mono font-bold tracking-wider">
              {protectionActive ? "ACTIVATED" : "STANDBY"}
            </div>
            <span className="text-[9px] text-gray-500 font-medium font-sans">
              {protectionActive ? "Tripping system engaged" : "Continuous monitoring active"}
            </span>
          </div>
        </div>
      </div>

      {/* Control Switch / Manual Trip button */}
      <div className="bg-gray-900/60 rounded-xl border border-gray-800 p-4 mb-4 text-left">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-3">
          Breaker Command Control
        </span>

        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="text-xs font-bold text-white">Manual Output Isolation</h4>
            <p className="text-[9px] text-gray-500 leading-normal mt-0.5">
              Directly disconnect or connect the domestic grid loads for routine maintenance.
            </p>
          </div>
          <button
            onClick={() => onToggleRelay(!relay)}
            disabled={isConnecting}
            className={`cursor-pointer px-4 py-2 rounded-lg font-mono text-xs font-bold border flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
              relay
                ? 'bg-red-950/40 hover:bg-red-900/40 text-red-400 border-red-500/30'
                : 'bg-green-950/40 hover:bg-green-900/40 text-green-400 border-green-500/30'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            {isConnecting ? "SENDING..." : relay ? "TRIP LOAD" : "RESTORE"}
          </button>
        </div>
      </div>

      {/* Numerical Stats */}
      <div className="grid grid-cols-2 gap-3 mt-auto pt-2 border-t border-gray-900">
        <div className="text-left">
          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider font-mono">Trip Count</span>
          <div className="text-xl font-mono font-bold text-white mt-0.5">{faultCount}</div>
        </div>
        <div className="text-left border-l border-gray-900 pl-3">
          <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider font-mono">Last Intercept</span>
          <div className="text-xs font-mono font-bold text-gray-300 mt-1 truncate" title={lastFaultTime || 'No record'}>
            {formattedLastFault}
          </div>
        </div>
      </div>

    </div>
  );
}
