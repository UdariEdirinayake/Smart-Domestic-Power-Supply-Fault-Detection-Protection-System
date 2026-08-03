import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldAlert, Power } from 'lucide-react';

const STATUS_CONFIGS = {
  NORMAL: {
    label: "NORMAL STATE",
    color: "bg-green-500/10 text-green-400 border-green-500/30",
    glow: "glow-green shadow-[0_0_20px_rgba(34,197,94,0.2)]",
    bullet: "bg-green-400 shadow-[0_0_8px_#22c55e] animate-pulse",
    icon: CheckCircle2,
    description: "Domestic power quality is normal. Electrical parameters are within nominal safety bounds (200V - 250V AC, load currents 0.1A - 2.0A)."
  },
  OVER_VOLTAGE: {
    label: "OVER VOLTAGE FAULT",
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    glow: "glow-red shadow-[0_0_20px_rgba(239,68,68,0.35)]",
    bullet: "bg-red-500 shadow-[0_0_10px_#ef4444] animate-ping",
    icon: ShieldAlert,
    description: "Grid potential has crossed the critical threshold (>250V). Auto-tripping isolated the domestic loads."
  },
  UNDER_VOLTAGE: {
    label: "UNDER VOLTAGE FAULT",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    glow: "glow-amber shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    bullet: "bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse",
    icon: AlertTriangle,
    description: "Grid voltage has dropped below safe operational levels (<200V). Isolated breaker lines to prevent inductive load damage."
  },
  OVER_CURRENT: {
    label: "OVER CURRENT FAULT",
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    glow: "glow-red shadow-[0_0_20px_rgba(239,68,68,0.35)]",
    bullet: "bg-red-500 shadow-[0_0_10px_#ef4444] animate-ping",
    icon: ShieldAlert,
    description: "Current draw exceeds safe capacity (>2.0A). breaker deactivated grid line output to prevent overload overheating."
  },
  UNDER_CURRENT: {
    label: "UNDER CURRENT FAULT",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    glow: "glow-amber shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    bullet: "bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse",
    icon: AlertTriangle,
    description: "Load current has dropped below nominal limits (<0.1A) while system is active. Potential open-circuit or no-load warning."
  },
  POWER_OFF: {
    label: "POWER OFF",
    color: "bg-gray-800/50 text-gray-400 border-gray-700/60",
    glow: "shadow-[0_0_10px_rgba(107,114,128,0.15)]",
    bullet: "bg-gray-500 shadow-[0_0_6px_#6b7280]",
    icon: Power,
    description: "Mains utility grid is completely down (<50V measured). Relay breaker is open. Standard blackout status."
  }
};

export default function StatusPanel({ status = "NORMAL" }) {
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
    <div className="engineering-card rounded-3xl p-6 border border-gray-800 flex flex-col h-full justify-between bg-gray-950/30">
      
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest text-left mb-3">
          System State Indicator
        </h3>
        <p className="text-[10px] text-gray-500 text-left leading-relaxed mb-6">
          Displays the active state derived from the ZMPT101B and ACS712 sensors.
        </p>
      </div>

      <div className={`rounded-2xl border p-6 transition-all duration-500 ${activeConfig.color} ${activeConfig.glow} flex flex-col gap-4 text-left`}>
        
        <div className="flex items-center justify-between border-b border-current/15 pb-3">
          <div className="flex items-center gap-2.5">
            <span className={`w-3 h-3 rounded-full ${activeConfig.bullet}`}></span>
            <span className="text-xl font-mono font-bold tracking-wider select-all uppercase">
              {activeConfig.label}
            </span>
          </div>
          <Icon className="w-6 h-6 animate-pulse" />
        </div>

        <div>
          <p className="text-xs text-gray-200 leading-relaxed font-semibold">
            {activeConfig.description}
          </p>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-900 flex items-center justify-between text-[10px] font-mono text-gray-500">
        <span>GRID MONITORING TELEMETRY STATE</span>
        <span className="font-bold text-gray-400">{currentStatus}</span>
      </div>
    </div>
  );
}
