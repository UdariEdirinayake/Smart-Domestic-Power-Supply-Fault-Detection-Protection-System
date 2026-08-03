import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, Power, Loader2 } from 'lucide-react';

const STATUS_CONFIGS = {
  NORMAL: {
    label: "NORMAL STATE",
    color: "bg-green-500/10 text-green-400 border-green-500/30",
    glow: "glow-green shadow-[0_0_20px_rgba(34,197,94,0.2)]",
    bullet: "bg-green-400 shadow-[0_0_8px_#22c55e] animate-pulse",
    icon: CheckCircle2,
    description: "Grid parameters are operating within safe limits."
  },
  OVER_VOLTAGE: {
    label: "OVER VOLTAGE FAULT",
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    glow: "glow-red shadow-[0_0_20px_rgba(239,68,68,0.35)]",
    bullet: "bg-red-500 shadow-[0_0_10px_#ef4444] animate-ping",
    icon: ShieldAlert,
    description: "Voltage has exceeded the 250V threshold. Breaker isolated."
  },
  UNDER_VOLTAGE: {
    label: "UNDER VOLTAGE FAULT",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    glow: "glow-amber shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    bullet: "bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse",
    icon: AlertTriangle,
    description: "Voltage has dropped below 200V safety limit."
  },
  OVER_CURRENT: {
    label: "OVER CURRENT FAULT",
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    glow: "glow-red shadow-[0_0_20px_rgba(239,68,68,0.35)]",
    bullet: "bg-red-500 shadow-[0_0_10px_#ef4444] animate-ping",
    icon: ShieldAlert,
    description: "Current load has exceeded the 2A safety capacity."
  },
  UNDER_CURRENT: {
    label: "UNDER CURRENT FAULT",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    glow: "glow-amber shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    bullet: "bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse",
    icon: AlertTriangle,
    description: "Current has fallen below the 0.1A minimal load threshold."
  },
  POWER_OFF: {
    label: "POWER OFF",
    color: "bg-gray-800/50 text-gray-400 border-gray-700/60",
    glow: "shadow-[0_0_10px_rgba(107,114,128,0.15)]",
    bullet: "bg-gray-500 shadow-[0_0_6px_#6b7280]",
    icon: Power,
    description: "Mains utility power grid is completely offline."
  }
};

export default function StatusPanel({
  status = "NORMAL",
  relayStatus = true,
  onToggleRelay,
  isConnecting = false
}) {
  let currentStatus = String(status).toUpperCase();
  
  if (currentStatus.includes("OVER") && currentStatus.includes("VOLT")) {
    currentStatus = "OVER_VOLTAGE";
  } else if (currentStatus.includes("UNDER") && currentStatus.includes("VOLT")) {
    currentStatus = "UNDER_VOLTAGE";
  } else if (currentStatus.includes("OVER") && currentStatus.includes("CURR")) {
    currentStatus = "OVER_CURRENT";
  } else if (currentStatus.includes("UNDER") && currentStatus.includes("CURR")) {
    currentStatus = "UNDER_CURRENT";
  } else if (currentStatus.includes("POWER") || currentStatus.includes("OFF")) {
    currentStatus = "POWER_OFF";
  } else {
    currentStatus = "NORMAL";
  }

  const activeConfig = STATUS_CONFIGS[currentStatus];
  const Icon = activeConfig.icon;

  return (
    <div className="flex flex-col gap-4 w-full text-left">
      
      {/* Top Card: Active 6-Stage System Status */}
      <div className={`engineering-card rounded-3xl border p-6 transition-all duration-500 ${activeConfig.color} ${activeConfig.glow} flex flex-col gap-3 w-full`}>
        <div className="flex items-center justify-between border-b border-current/15 pb-2.5">
          <div className="flex items-center gap-3">
            <span className={`w-3.5 h-3.5 rounded-full ${activeConfig.bullet}`}></span>
            <span className="text-xl font-mono font-bold tracking-wider uppercase select-all">
              {activeConfig.label}
            </span>
          </div>
          <Icon className="w-5 h-5 animate-pulse" />
        </div>
        
        {/* Render simplified status description text */}
        <p className="text-xs font-semibold text-gray-300">
          {activeConfig.description}
        </p>

        <div className="text-[9px] font-mono text-gray-500 uppercase tracking-widest pt-2 border-t border-current/10">
          TELEMETRY STATE: {currentStatus}
        </div>
      </div>

      {/* Bottom Card: Breaker Control Switch Panel */}
      <div className="engineering-card rounded-3xl border border-gray-800 p-6 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-950/30 w-full">
        
        {/* Left: Breaker Status */}
        <div className="font-mono text-sm tracking-wide flex items-center gap-2">
          <span className="text-gray-500 uppercase font-bold">BREAKER STATUS :</span>
          <span className={`font-bold ${relayStatus ? 'text-green-400' : 'text-red-400 animate-pulse'}`}>
            {relayStatus ? "CONNECTED" : "ISOLATED"}
          </span>
        </div>

        {/* Right: Interactive Toggle Switch Button */}
        <button
          onClick={() => onToggleRelay(!relayStatus)}
          disabled={isConnecting}
          className={`cursor-pointer min-w-[180px] py-2.5 px-6 rounded-xl font-mono text-xs font-bold border flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 ${
            relayStatus
              ? 'bg-red-950/20 hover:bg-red-900/20 text-red-400 border-red-500/20'
              : 'bg-green-950/20 hover:bg-green-900/20 text-green-400 border-green-500/20'
          }`}
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>SENDING...</span>
            </>
          ) : (
            <>
              <Power className="w-4 h-4" />
              <span>{relayStatus ? "TRIP BREAKER" : "ENGAGE BREAKER"}</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
