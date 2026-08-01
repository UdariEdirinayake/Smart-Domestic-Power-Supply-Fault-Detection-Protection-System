import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchPowerData, toggleRelay as apiToggleRelay, triggerSimulatedFault, resetSimulatedSystem } from '../services/api';

const HISTORY_LIMIT = 60; // 60 seconds of data

export const useRealTimeData = (initialMode = 'simulated', initialConnection = "https://domestic-wiring-project-default-rtdb.asia-southeast1.firebasedatabase.app/") => {
  const [mode, setMode] = useState(initialMode); // 'simulated' | 'local' | 'firebase'
  const [connectionString, setConnectionString] = useState(initialConnection);
  const [currentData, setCurrentData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [eventLogs, setEventLogs] = useState([]);

  // Running statistics state
  const [stats, setStats] = useState({
    maxVoltage: 0,
    minVoltage: 999.9,
    maxCurrent: 0,
    avgVoltage: 0,
    avgCurrent: 0
  });

  // Track totals for average calculation
  const statsTracker = useRef({
    sumVoltage: 0,
    sumCurrent: 0,
    count: 0
  });

  // Track transitions for logs
  const prevDataRef = useRef(null);

  // Clear statistics
  const resetStats = useCallback(() => {
    setStats({
      maxVoltage: 0,
      minVoltage: 999.9,
      maxCurrent: 0,
      avgVoltage: 0,
      avgCurrent: 0
    });
    statsTracker.current = {
      sumVoltage: 0,
      sumCurrent: 0,
      count: 0
    };
  }, []);

  // Add event log entry
  const addEvent = useCallback((timestamp, voltage, current, status, actionTaken) => {
    const newEvent = {
      id: `${timestamp}-${Math.random()}`,
      timestamp,
      voltage,
      current,
      status,
      actionTaken
    };
    setEventLogs(prev => [newEvent, ...prev].slice(0, 100));
  }, []);

  // Control relay state
  const handleToggleRelay = async (targetState) => {
    setIsConnecting(true);
    const result = await apiToggleRelay(mode, connectionString, targetState);
    setIsConnecting(false);
    
    if (result.success) {
      addEvent(
        new Date().toISOString(),
        currentData?.voltage || 0,
        currentData?.current || 0,
        targetState ? "NORMAL" : "FAULT",
        targetState ? "Relay Energized (Manual Override Command)" : "Relay De-energized (Manual Trip Command)"
      );
      setCurrentData(prev => prev ? { ...prev, relay: targetState } : null);
    }
    return result.success;
  };

  // Trigger simulated faults (only if in simulated mode)
  const triggerFault = (type) => {
    if (mode !== 'simulated') return;
    triggerSimulatedFault(type);
  };

  // Reset system helper
  const restoreSystem = async () => {
    if (mode === 'simulated') {
      resetSimulatedSystem();
      const data = await fetchPowerData('simulated', connectionString);
      setCurrentData(data);
      addEvent(
        new Date().toISOString(),
        data.voltage,
        data.current,
        data.status,
        "System manual reset. Relay restored."
      );
    } else {
      await handleToggleRelay(true);
    }
  };

  // Clear event logs
  const clearLogs = () => setEventLogs([]);

  // Fetch interval loop
  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const data = await fetchPowerData(mode, connectionString);
        if (!active) return;

        setCurrentData(data);
        setIsLoading(false);

        // Update rolling history charts data
        setHistory(prev => {
          const timeString = new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          const newPoint = {
            time: timeString,
            voltage: data.voltage,
            current: data.current,
            power: data.power,
            timestamp: data.timestamp
          };
          const nextHistory = [...prev, newPoint];
          if (nextHistory.length > HISTORY_LIMIT) {
            nextHistory.shift();
          }
          return nextHistory;
        });

        // Update session stats
        if (data.voltage > 0 || data.relay) {
          statsTracker.current.sumVoltage += data.voltage;
          statsTracker.current.sumCurrent += data.current;
          statsTracker.current.count += 1;

          setStats(prev => {
            const currentVoltage = data.voltage;
            const currentCurrent = data.current;
            
            const nextMaxV = Math.max(prev.maxVoltage, currentVoltage);
            let nextMinV = prev.minVoltage;
            if (currentVoltage > 50.0) {
              nextMinV = Math.min(prev.minVoltage, currentVoltage);
            }
            const nextMaxI = Math.max(prev.maxCurrent, currentCurrent);
            const nextAvgV = parseFloat((statsTracker.current.sumVoltage / statsTracker.current.count).toFixed(1));
            const nextAvgI = parseFloat((statsTracker.current.sumCurrent / statsTracker.current.count).toFixed(2));

            return {
              maxVoltage: nextMaxV,
              minVoltage: nextMinV === 999.9 ? currentVoltage : nextMinV,
              maxCurrent: nextMaxI,
              avgVoltage: nextAvgV,
              avgCurrent: nextAvgI
            };
          });
        }

        // Handle state changes inside event log
        const prevData = prevDataRef.current;
        if (prevData) {
          const timestamp = data.timestamp || new Date().toISOString();
          
          if (prevData.relay && !data.relay) {
            let cause = "Relay Tripped - Protection Active";
            if (data.status === "OVER_VOLTAGE") cause = "Relay Tripped - Over-Voltage Protection (OVP)";
            else if (data.status === "UNDER_VOLTAGE") cause = "Relay Tripped - Under-Voltage Protection (UVP)";
            else if (data.status === "OVER_CURRENT") cause = "Relay Tripped - Over-Current Protection (OCP)";
            else if (data.status === "FAULT") cause = "Relay Tripped - Overlimit Safety Trip";
            addEvent(timestamp, data.voltage, data.current, data.status, cause);
          } 
          else if (!prevData.relay && data.relay) {
            addEvent(timestamp, data.voltage, data.current, data.status, "Relay Restored - Mains Connected");
          }
          else if (prevData.status !== data.status) {
            let action = "Telemetry State Changed";
            if (data.status === "WARNING") action = "System approaching protection threshold limits";
            else if (data.status === "NORMAL") action = "System values returned to normal range";
            else if (data.status === "SENSOR_ERROR") action = "Telemetry error: Loss of signal";
            addEvent(timestamp, data.voltage, data.current, data.status, action);
          }
        } else {
          addEvent(data.timestamp, data.voltage, data.current, data.status, `Mains telemetry dashboard active. Mode: ${mode.toUpperCase()}`);
        }

        prevDataRef.current = data;
      } catch (err) {
        console.error("Hook update loop failure:", err);
      }
    };

    fetchData();
    const timer = setInterval(fetchData, 1000);

    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [mode, connectionString, addEvent]);

  return {
    mode,
    setMode,
    connectionString,
    setConnectionString,
    currentData,
    history,
    isLoading,
    isConnecting,
    stats,
    resetStats,
    eventLogs,
    clearLogs,
    handleToggleRelay,
    triggerFault,
    restoreSystem
  };
};
