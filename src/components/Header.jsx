import React, { useState, useEffect } from 'react';
import { Wifi, Cpu, Settings, Database, RefreshCw, Radio } from 'lucide-react';

export default function Header({
  mode,
  setMode,
  connectionString,
  setConnectionString,
  currentData,
  restoreSystem
}) {
  const [time, setTime] = useState(new Date());
  const [showConfig, setShowConfig] = useState(false);
  const [tempConnection, setTempConnection] = useState(connectionString);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update tempConnection whenever connectionString shifts
  useEffect(() => {
    setTempConnection(connectionString);
  }, [connectionString]);

  const handleConnectionSubmit = (e) => {
    e.preventDefault();
    setConnectionString(tempConnection);
    setShowConfig(false);
  };

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const formattedDate = time.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  // Connect status details
  const isEsp32Connected = currentData?.sensorHealth?.ESP32 === "online";
  
  let statusText = "Offline";
  let statusStyle = "bg-red-500/20 text-red-400 border-red-500/30 glow-red";
  let wifiColor = "text-red-500";

  if (mode === 'simulated') {
    statusText = "Simulated";
    statusStyle = "bg-blue-500/20 text-blue-400 border-blue-500/30 glow-blue";
    wifiColor = "text-blue-400 animate-pulse-slow";
  } else {
    if (isEsp32Connected) {
      statusText = mode === 'firebase' ? "Firebase Online" : "Local ESP32 Online";
      statusStyle = "bg-green-500/20 text-green-400 border-green-500/30 glow-green";
      wifiColor = "text-green-400 animate-pulse";
    } else {
      statusText = mode === 'firebase' ? "Firebase Error" : "Local ESP32 Offline";
      statusStyle = "bg-red-505/20 text-red-400 border-red-505/30 glow-red animate-pulse";
      wifiColor = "text-red-500";
    }
  }

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (newMode === 'simulated') {
      setTempConnection("https://domestic-wiring-project-default-rtdb.asia-southeast1.firebasedatabase.app/");
    } else if (newMode === 'local') {
      setTempConnection("192.168.4.1");
    } else if (newMode === 'firebase') {
      setTempConnection("https://domestic-wiring-project-default-rtdb.asia-southeast1.firebasedatabase.app/");
    }
  };

  return (
    <header className="relative w-full z-30 mb-6">
      <div className="engineering-card rounded-2xl border border-gray-800/80 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Project Branding */}
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 flex items-center justify-center animate-pulse-slow">
            <Cpu className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-green-400 uppercase bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                EE6304 Project
              </span>
              <span className={`text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded border ${statusStyle}`}>
                {statusText}
              </span>
            </div>
            <h1 className="text-lg md:text-2xl font-bold tracking-tight text-white mt-1 leading-tight text-left">
              Smart Domestic Power Supply Fault Detection & Protection System
            </h1>
          </div>
        </div>

        {/* Live Metrics & Config Toggle */}
        <div className="flex items-center flex-wrap md:flex-nowrap gap-4 justify-between md:justify-end">
          
          {/* Live Date/Time Display */}
          <div className="bg-gray-900/60 rounded-xl border border-gray-800 px-4 py-2 text-right">
            <div className="text-xs text-gray-400 font-mono tracking-wide">{formattedDate}</div>
            <div className="text-xl md:text-2xl font-bold text-green-400 font-mono tracking-wider text-shadow-glow-green">
              {formattedTime}
            </div>
          </div>

          {/* Quick Connectivity Stats */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-900/60 border border-gray-800 w-12 h-12" title="WiFi Signal Status">
              <Wifi className={`w-5 h-5 ${wifiColor}`} />
              <span className="text-[9px] text-gray-500 mt-0.5 font-bold">WiFi</span>
            </div>

            {/* Manual Restore Button */}
            {currentData?.status !== "NORMAL" && (
              <button
                onClick={restoreSystem}
                className="flex flex-col items-center justify-center p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all text-amber-400 w-12 h-12 animate-pulse cursor-pointer"
                title="Reset Protection System"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="text-[9px] font-bold mt-0.5">Reset</span>
              </button>
            )}

            {/* Configuration Dialog Toggle */}
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-gray-900/60 hover:bg-gray-800 border border-gray-800 transition-all text-gray-400 hover:text-white w-12 h-12 cursor-pointer"
              title="Hardware Settings"
            >
              <Settings className={`w-5 h-5 ${showConfig ? 'rotate-45' : ''} transition-transform`} />
              <span className="text-[9px] text-gray-500 mt-0.5 font-bold">Config</span>
            </button>
          </div>
        </div>

      </div>

      {/* Settings Panel */}
      {showConfig && (
        <div className="absolute right-0 top-[102%] mt-2 w-full max-w-sm bg-gray-950/95 border border-gray-800 rounded-2xl p-5 shadow-2xl z-40 backdrop-blur-xl animate-fade-in">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-2 flex items-center gap-2">
            <Radio className="w-4 h-4 text-green-400" /> Connection Parameters
          </h3>
          
          <div className="space-y-4 font-sans text-left">
            {/* Mode Selector */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold text-gray-400">Data Source Mode</span>
              <div className="grid grid-cols-3 gap-1 bg-gray-900 p-0.5 rounded-lg border border-gray-800 text-[10px] font-bold font-mono">
                {[
                  { key: 'simulated', label: 'SIMULATION' },
                  { key: 'local', label: 'LOCAL IP' },
                  { key: 'firebase', label: 'FIREBASE' }
                ].map(item => (
                  <button
                    key={item.key}
                    onClick={() => handleModeChange(item.key)}
                    className={`cursor-pointer py-1.5 rounded transition-colors text-center ${
                      mode === item.key
                        ? 'bg-gray-800 text-white shadow-sm border border-gray-700/50'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* IP Address config for Hardware mode */}
            {mode !== 'simulated' && (
              <form onSubmit={handleConnectionSubmit} className="space-y-2.5 pt-2.5 border-t border-gray-900">
                <label className="block text-xs font-semibold text-gray-400">
                  {mode === 'firebase' ? "Firebase Realtime DB Endpoint" : "ESP32 Hostname / Local IP Address"}
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempConnection}
                    onChange={(e) => setTempConnection(e.target.value)}
                    placeholder={mode === 'firebase' ? "e.g. https://[app].firebasedatabase.app/" : "e.g. 192.168.4.1"}
                    className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-green-500"
                  />
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 leading-normal">
                  {mode === 'firebase'
                    ? "テレメトリ loads from the Firebase Realtime Database URL via JSON endpoint."
                    : "Connect your client device to the ESP32 server subnet."}
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
