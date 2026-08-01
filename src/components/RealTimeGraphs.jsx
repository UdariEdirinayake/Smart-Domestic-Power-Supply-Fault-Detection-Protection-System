import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function CustomTooltip({ active, payload, label, unit }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-2 text-left shadow-2xl backdrop-blur-md">
        <p className="text-[10px] text-gray-500 font-mono font-semibold">{label}</p>
        <p className="text-sm font-mono font-bold text-white mt-0.5">
          Value: <span className="text-green-400">{payload[0].value.toFixed(2)}</span> {unit}
        </p>
      </div>
    );
  }
  return null;
}

export default function RealTimeGraphs({ history }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      
      {/* Voltage Chart */}
      <div className="engineering-card rounded-2xl p-4 md:p-6 border border-gray-800 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-left">Voltage vs Time</h3>
            <p className="text-xs text-gray-500 text-left font-sans mt-0.5">Real-time AC mains voltage (60 second scroll)</p>
          </div>
          <span className="text-[10px] font-bold font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            LIVE (230V Nominal)
          </span>
        </div>

        <div className="w-full h-[250px] select-none font-mono text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={history}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="voltageAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#4b5563" 
                tickLine={false} 
                axisLine={false}
                interval={12} // show fewer labels to avoid crowded layout
              />
              <YAxis 
                stroke="#4b5563" 
                domain={[160, 280]} 
                tickLine={false} 
                axisLine={false} 
                allowDataOverflow={true}
              />
              <Tooltip content={<CustomTooltip unit="V" />} />
              <Area
                type="monotone"
                dataKey="voltage"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#voltageAreaGrad)"
                isAnimationActive={false} // Disable charts animation on each tick for high-performance scroll
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Current Chart */}
      <div className="engineering-card rounded-2xl p-4 md:p-6 border border-gray-800 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-left">Current vs Time</h3>
            <p className="text-xs text-gray-500 text-left font-sans mt-0.5">Real-time load current consumption (60 second scroll)</p>
          </div>
          <span className="text-[10px] font-bold font-mono text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
            LIVE (ACS712 Output)
          </span>
        </div>

        <div className="w-full h-[250px] select-none font-mono text-[10px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={history}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="currentAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#4b5563" 
                tickLine={false} 
                axisLine={false}
                interval={12}
              />
              <YAxis 
                stroke="#4b5563" 
                domain={[0, 'auto']} 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip unit="A" />} />
              <Area
                type="monotone"
                dataKey="current"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#currentAreaGrad)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
