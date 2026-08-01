import React from 'react';
import { CheckCircle2, AlertTriangle, XOctagon, ShieldAlert, WifiOff } from 'lucide-react';

const STATUS_CONFIGS = {
  NORMAL: {
    label: "Normal Operation",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    glow: "glow-green",
    bullet: "bg-green-400 shadow-[0_0_8px_#22c55e]",
    icon: CheckCircle2,
    description: "Grid values are within standard operating specifications (210V - 240V). All outputs are active and monitored."
  },
  WARNING: {
    label: "System Warning",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    glow: "glow-amber",
    bullet: "bg-amber-400 shadow-[0_0_8px_#f59e0b]",
    icon: AlertTriangle,
    description: "Grid readings are nearing the safety margins. Take caution as auto-tripping limits are approaching."
  },
  OVER_VOLTAGE: {
    label: "Over Voltage Trip",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    glow: "glow-red",
    bullet: "bg-red-400 shadow-[0_0_8px_#ef4448]",
    icon: ShieldAlert,
    description: "Voltage has exceeded the maximum limit (>250V). Protection relay deactivated output load."
  },
  UNDER_VOLTAGE: {
    label: "Under Voltage Trip",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    glow: "glow-red",
    bullet: "bg-red-400 shadow-[0_0_8px_#ef4448]",
    icon: ShieldAlert,
    description: "Voltage has dropped below safe operational levels (<190V). Output isolated to prevent damage."
  },
  OVER_CURRENT: {
    label: "Over Current Trip",
    color: "bg-red-500/20 text-red-400 border-red-500/30",
    glow: "glow-red",
    bullet: "bg-red-400 shadow-[0_0_8px_#ef4448]",
    icon: ShieldAlert,
    description: "Current consumption has exceeded safety thresholds (>5.0A). Breaker tripped to protect domestic devices."
  },
  FAULT: {
    label: "Relay Fault State",
    color: "bg-red-600/20 text-red-400 border-red-600/30",
    glow: "glow-red",
    bullet: "bg-red-500 shadow-[0_0_10px_#ef4444]",
    icon: XOctagon,
    description: "Protection relay remains OPEN due to system fault. Manual intervention / reset command required to restore power."
  },
  SENSOR_ERROR: {
    label: "Sensor Failure",
    color: "bg-gray-800 text-gray-400 border-gray-700",
    glow: "shadow-[0_0_10px_rgba(107,114,128,0.2)]",
    bullet: "bg-gray-500 shadow-[0_0_6px_#6b7280]",
    icon: WifiOff,
    description: "Hardware telemetry lost. Error reading from ZMPT101B voltage transformer or ACS712 current sensor."
  }
};

export default function StatusPanel({ status = "NORMAL" }) {
  // Normalize status string from API format
  let currentStatus = String(status).toUpperCase();
  if (!STATUS_CONFIGS[currentStatus]) {
    currentStatus = "NORMAL";
  }

  const activeConfig = STATUS_CONFIGS[currentStatus];
  const Icon = activeConfig.icon;

  return (
    <div className="engineering-card rounded-2xl p-4 md:p-6 border border-gray-800 flex flex-col h-full">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-left mb-4">
        System Status Panel
      </h3>

      {/* Main Large Active Status Banner */}
      <div className={`rounded-xl border p-4 mb-5 transition-all duration-500 ${activeConfig.color} ${activeConfig.glow} flex items-start gap-4 text-left`}>
        <div className="p-2 rounded-lg bg-gray-950/40 border border-current/10">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${activeConfig.bullet}`}></span>
            <h4 className="font-bold text-base">{activeConfig.label}</h4>
          </div>
          <p className="text-xs mt-1 text-gray-300 leading-normal font-medium">
            {activeConfig.description}
          </p>
        </div>
      </div>

      {/* Grid List of Available System Operating Conditions */}
      <div className="space-y-2 mt-auto">
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider text-left block mb-2">
          System State Matrix
        </span>
        
        {Object.entries(STATUS_CONFIGS).map(([key, config]) => {
          const isActive = key === currentStatus;
          const BadgeIcon = config.icon;

          return (
            <div
              key={key}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-left transition-all ${
                isActive
                  ? `${config.color} border-current/30 font-bold scale-[1.01]`
                  : 'bg-gray-900/40 border-gray-800/60 opacity-40 hover:opacity-60 text-gray-500'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isActive ? config.bullet : 'bg-gray-700'}`}></span>
                <span className="text-xs font-mono tracking-wide">{key}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans">
                  {isActive ? "ACTIVE" : "STANDBY"}
                </span>
                <BadgeIcon className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
