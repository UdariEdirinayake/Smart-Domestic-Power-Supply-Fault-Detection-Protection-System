import { useState, useEffect } from 'react';
import { fetchPowerData, toggleRelay as apiToggleRelay, triggerSimulatedFault, resetSimulatedSystem } from '../services/api';

export const useRealTimeData = (initialMode = 'simulated', initialConnection = "https://domestic-wiring-project-default-rtdb.asia-southeast1.firebasedatabase.app/") => {
  const [mode, setMode] = useState(initialMode); // 'simulated' | 'local' | 'firebase'
  const [connectionString, setConnectionString] = useState(initialConnection);
  const [currentData, setCurrentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleToggleRelay = async (targetState) => {
    setIsConnecting(true);
    const result = await apiToggleRelay(mode, connectionString, targetState);
    setIsConnecting(false);
    
    if (result.success) {
      setCurrentData(prev => prev ? { ...prev, relay_status: targetState } : null);
    }
    return result.success;
  };

  const triggerFault = (type) => {
    if (mode !== 'simulated') return;
    triggerSimulatedFault(type);
  };

  const restoreSystem = async () => {
    if (mode === 'simulated') {
      resetSimulatedSystem();
      const data = await fetchPowerData('simulated', connectionString);
      setCurrentData(data);
    } else {
      await handleToggleRelay(true);
    }
  };

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const data = await fetchPowerData(mode, connectionString);
        if (!active) return;
        setCurrentData(data);
        setIsLoading(false);
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
  }, [mode, connectionString]);

  return {
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
  };
};
