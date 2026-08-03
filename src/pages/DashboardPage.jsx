import React, { useState } from 'react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import Header from '../components/Header';
import GaugeMeters from '../components/GaugeMeters';
import StatusPanel from '../components/StatusPanel';
import Footer from '../components/Footer';
import { Sparkles, RefreshCw, Zap } from 'lucide-react';

export default function DashboardPage() {
  const {
    mode,
    setMode,
    connectionString,
    setConnectionString,
    currentData,
    isLoading,
    isConnecting,
    handleToggleRelay,
    triggerFault,
    restoreSystem
  } = useRealTimeData('simulated', "https://domestic-wiring-project-default-rtdb.asia-southeast1.firebasedatabase.app/");

  const [showInjector, setShowInjector] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center font-mono p-4 text-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 border border-green-500/30 rounded-full animate-ping"></div>
          <div className="absolute w-14 h-14 border-2 border-t-green-400 border-green-500/10 rounded-full animate-spin"></div>
          <Zap className="w-6 h-6 text-green-400 animate-pulse" />
        </div>
        <h2 className="text-white text-sm font-bold tracking-wider uppercase mt-8 animate-pulse">
          Initializing Telemetry Gateway...
        </h2>
        <p className="text-xs text-gray-500 mt-2">Connecting to sensors and loading visual metrics</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] p-4 md:p-6 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col justify-center">
        
        {/* Dashboard Header Banner */}
        <Header
          mode={mode}
          setMode={setMode}
          connectionString={connectionString}
          setConnectionString={setConnectionString}
          currentData={currentData}
          restoreSystem={restoreSystem}
        />

        {/* Conditional Simulation Fault Injection Control Board */}
        {mode === 'simulated' && showInjector && (
          <div className="engineering-card rounded-2xl p-4 border border-blue-500/20 bg-blue-500/5 mb-6 text-left animate-fade-in relative">
            <button 
              onClick={() => setShowInjector(false)}
              className="absolute right-4 top-4 text-xs font-mono font-bold text-blue-400/60 hover:text-blue-400 cursor-pointer"
            >
              Hide Control Panel
            </button>

            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                Simulated Fault Injection Console
              </h4>
            </div>
            
            <p className="text-[11px] text-blue-200/70 mb-3 max-w-2xl leading-normal">
              Simulate various electrical conditions to test the automatic threshold calculations and watch the gauges turn red automatically on active faults.
            </p>

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => triggerFault('OVER_VOLTAGE')}
                className="cursor-pointer bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors"
              >
                ⚡ OVERVOLTAGE (&gt;250V)
              </button>
              <button
                onClick={() => triggerFault('UNDER_VOLTAGE')}
                className="cursor-pointer bg-amber-950/40 hover:bg-amber-900/40 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors"
              >
                📉 UNDERVOLTAGE (&lt;200V)
              </button>
              <button
                onClick={() => triggerFault('POWER_OFF')}
                className="cursor-pointer bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors"
              >
                🔌 POWER OFF (&lt;50V)
              </button>
              <button
                onClick={() => triggerFault('OVER_CURRENT')}
                className="cursor-pointer bg-red-950/40 hover:bg-red-900/40 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors"
              >
                ⚠️ OVERCURRENT (&gt;2A)
              </button>
              <button
                onClick={() => triggerFault('UNDER_CURRENT')}
                className="cursor-pointer bg-amber-950/40 hover:bg-amber-900/40 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors"
              >
                📉 UNDERCURRENT (&lt;0.1A)
              </button>
              <button
                onClick={restoreSystem}
                className="cursor-pointer bg-green-950/40 hover:bg-green-900/40 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors flex items-center gap-1.5 ml-auto"
              >
                <RefreshCw className="w-3 h-3" /> RESET SYSTEM
              </button>
            </div>
          </div>
        )}

        {/* Hidden Panel trigger when closed */}
        {mode === 'simulated' && !showInjector && (
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setShowInjector(true)}
              className="text-[10px] font-bold font-mono text-blue-400 hover:underline flex items-center gap-1 bg-blue-500/5 border border-blue-500/20 px-2.5 py-1 rounded-lg cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" /> Show Fault Injector
            </button>
          </div>
        )}

        {/* Simplified Stacked Dashboard Layout */}
        <div className="flex flex-col gap-6 mb-6">
          
          {/* Voltage and Current Circular Gauges Meter (Full Width Row) */}
          <div className="w-full">
            <GaugeMeters data={currentData} status={currentData?.status} />
          </div>

          {/* Active 6-Stage Status & Breaker Control Panel (Full Width Row directly below meters) */}
          <div className="w-full">
            <StatusPanel
              status={currentData?.status}
              relayStatus={currentData?.relay_status}
              onToggleRelay={handleToggleRelay}
              isConnecting={isConnecting}
            />
          </div>

        </div>

        {/* Academic Coursework Footer */}
        <Footer />
        
      </div>
    </div>
  );
}
