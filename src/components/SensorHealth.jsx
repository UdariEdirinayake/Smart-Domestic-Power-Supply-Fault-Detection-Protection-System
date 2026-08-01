import React from 'react';
import { Cpu, Thermometer, Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const SENSOR_INFO = {
  ZMPT101B: {
    name: "ZMPT101B Voltage Sensor",
    type: "Active Transformer",
    desc: "Measures grid AC potential through galvanic isolation."
  },
  ACS712: {
    name: "ACS712 Current Sensor",
    type: "Hall-Effect Transducer",
    desc: "Measures circuit current load via magnetic field sensing."
  },
  ESP32: {
    name: "ESP32 Controller Gateway",
    type: "System Core Processor",
    desc: "Computes RMS values, manages trip signals and transmits telemetry."
  }
};

function SensorItem({ name, type, desc, status }) {
  // Map statuses
  let statusText = "No Data";
  let badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
  let ledColor = "bg-amber-400 shadow-[0_0_8px_#f59e0b]";
  let Icon = AlertCircle;

  const cleanStatus = String(status).toLowerCase();

  if (cleanStatus === "online") {
    statusText = "Online";
    badgeColor = "bg-green-500/10 text-green-400 border-green-500/20";
    ledColor = "bg-green-400 shadow-[0_0_8px_#22c55e] animate-pulse";
    Icon = CheckCircle;
  } else if (cleanStatus === "offline") {
    statusText = "Offline";
    badgeColor = "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse";
    ledColor = "bg-red-400 shadow-[0_0_8px_#ef4444]";
    Icon = XCircle;
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-gray-900/40 border border-gray-800/80 rounded-xl gap-3 text-left">
      <div className="flex items-start gap-3">
        <div className={`p-2 bg-gray-950 border border-gray-800 rounded-lg text-gray-400`}>
          {name.includes("ZMPT101B") ? <Database className="w-4 h-4 text-blue-400" /> : 
           name.includes("ACS712") ? <Thermometer className="w-4 h-4 text-green-400" /> : 
           <Cpu className="w-4 h-4 text-purple-400" />}
        </div>
        <div>
          <h4 className="text-xs font-bold text-white leading-snug">{name}</h4>
          <span className="text-[9px] font-mono text-gray-500 uppercase font-semibold">{type}</span>
          <p className="text-[10px] text-gray-400 leading-normal mt-0.5 max-w-xs">{desc}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-center">
        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-1 rounded border ${badgeColor} flex items-center gap-1.5`}>
          <span className={`w-1.5 h-1.5 rounded-full ${ledColor}`}></span>
          {statusText}
        </span>
      </div>
    </div>
  );
}

export default function SensorHealth({ sensorHealth }) {
  // Use fallbacks in case data isn't loaded
  const health = sensorHealth || {
    ZMPT101B: "no_data",
    ACS712: "no_data",
    ESP32: "no_data"
  };

  return (
    <div className="engineering-card rounded-2xl p-4 md:p-6 border border-gray-800 flex flex-col h-full">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider text-left mb-4">
        Sensor Health Monitor
      </h3>
      
      <div className="space-y-3 flex-1 flex flex-col justify-between">
        <SensorItem
          name={SENSOR_INFO.ZMPT101B.name}
          type={SENSOR_INFO.ZMPT101B.type}
          desc={SENSOR_INFO.ZMPT101B.desc}
          status={health.ZMPT101B}
        />
        <SensorItem
          name={SENSOR_INFO.ACS712.name}
          type={SENSOR_INFO.ACS712.type}
          desc={SENSOR_INFO.ACS712.desc}
          status={health.ACS712}
        />
        <SensorItem
          name={SENSOR_INFO.ESP32.name}
          type={SENSOR_INFO.ESP32.type}
          desc={SENSOR_INFO.ESP32.desc}
          status={health.ESP32}
        />
      </div>
    </div>
  );
}
