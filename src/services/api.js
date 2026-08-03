/**
 * API Service for ESP32, Firebase, and Simulated Data
 */

// Keep simulation state persistent across requests
let simState = {
  voltage: 228.5,
  current: 1.20,
  relay_status: true,
  status: "NORMAL",
  timestamp: new Date().toISOString()
};

// Internal timer to simulate natural fluctuations
let ticks = 0;
let faultDuration = 0;
let currentFaultType = null; // 'OVER_VOLTAGE', 'UNDER_VOLTAGE', 'POWER_OFF', 'OVER_CURRENT', 'UNDER_CURRENT'

/**
 * Triggers a simulated fault for testing and demo purposes
 */
export const triggerSimulatedFault = (type) => {
  currentFaultType = type;
  faultDuration = 6; // Fault lasts for 6 seconds
};

/**
 * Reset faults and restore system
 */
export const resetSimulatedSystem = () => {
  simState.relay_status = true;
  simState.status = "NORMAL";
  currentFaultType = null;
  faultDuration = 0;
};

/**
 * Evaluates the system status based on threshold rules:
 * - Overvoltage: > 250 V
 * - Undervoltage: < 200 V (but >= 50 V)
 * - Power OFF: < 50 V
 * - Overcurrent: > 2 A
 * - Undercurrent: < 0.1 A
 * - Normal: 200V - 250V and 0.1A - 2A
 */
export const getSystemStatus = (voltage, current, relayStatus) => {
  if (!relayStatus) {
    if (voltage < 50) return "POWER_OFF";
    return "FAULT";
  }
  if (voltage < 50) return "POWER_OFF";
  if (voltage > 250) return "OVER_VOLTAGE";
  if (voltage < 200) return "UNDER_VOLTAGE";
  if (current > 2.0) return "OVER_CURRENT";
  if (current < 0.1) return "UNDER_CURRENT";
  return "NORMAL";
};

/**
 * Helper to update simulation values
 */
const updateSimulation = () => {
  ticks++;
  
  if (faultDuration > 0) {
    faultDuration--;
    
    if (currentFaultType === 'OVER_VOLTAGE') {
      simState.voltage = parseFloat((255.0 + Math.random() * 8).toFixed(1));
      simState.current = parseFloat((1.2 + Math.random() * 0.4).toFixed(2));
      if (faultDuration < 4) {
        simState.relay_status = false;
      }
    } else if (currentFaultType === 'UNDER_VOLTAGE') {
      simState.voltage = parseFloat((175.0 - Math.random() * 8).toFixed(1));
      simState.current = parseFloat((0.6 + Math.random() * 0.2).toFixed(2));
      if (faultDuration < 4) {
        simState.relay_status = false;
      }
    } else if (currentFaultType === 'POWER_OFF') {
      simState.voltage = parseFloat((15.0 + Math.random() * 5).toFixed(1));
      simState.current = 0.0;
      simState.relay_status = false;
    } else if (currentFaultType === 'OVER_CURRENT') {
      simState.voltage = parseFloat((222.0 + Math.random() * 3).toFixed(1));
      simState.current = parseFloat((2.5 + Math.random() * 0.8).toFixed(2));
      if (faultDuration < 4) {
        simState.relay_status = false;
      }
    } else if (currentFaultType === 'UNDER_CURRENT') {
      simState.voltage = parseFloat((228.0 + Math.random() * 2).toFixed(1));
      simState.current = parseFloat((0.02 + Math.random() * 0.03).toFixed(3));
    }
  } else {
    currentFaultType = null;
    // DO NOT override simState.relay_status here. Allow user toggles to persist.

    if (simState.relay_status) {
      const baseVoltage = 228.0;
      const wave = Math.sin(ticks * 0.1) * 4;
      const noise = (Math.random() - 0.5) * 1.5;
      simState.voltage = parseFloat((baseVoltage + wave + noise).toFixed(1));

      const baseCurrent = 0.9;
      const currentNoise = (Math.random() - 0.5) * 0.3;
      simState.current = parseFloat((baseCurrent + Math.sin(ticks * 0.05) * 0.4 + currentNoise).toFixed(2));
    } else {
      // Breaker is OFF: Voltage remains measurable on grid side, but current drops to 0.0A
      const baseVoltage = 228.0;
      const noise = (Math.random() - 0.5) * 1.5;
      simState.voltage = parseFloat((baseVoltage + noise).toFixed(1));
      simState.current = 0.0;
    }
  }

  simState.status = getSystemStatus(simState.voltage, simState.current, simState.relay_status);
  simState.timestamp = new Date().toISOString();
  
  return { ...simState };
};

/**
 * Fetches real-time power data from selected source.
 */
export const fetchPowerData = async (mode = 'simulated', connectionString = "") => {
  if (mode === 'simulated') {
    await new Promise(resolve => setTimeout(resolve, 80));
    return updateSimulation();
  }

  if (mode === 'firebase') {
    let dbUrl = connectionString.trim() || "https://domestic-wiring-project-default-rtdb.asia-southeast1.firebasedatabase.app/";
    if (!dbUrl.endsWith('/')) dbUrl += '/';
    const fetchUrl = `${dbUrl}esp32_test.json`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(fetchUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Firebase status code: ${response.status}`);
      }

      const parsed = await response.json();

      if (!parsed || typeof parsed !== 'object') {
        throw new Error("No data found under /esp32_test in Firebase RTDB.");
      }

      const voltageVal = parseFloat(parsed.voltage ?? 0.0);
      const currentVal = parseFloat(parsed.current ?? 0.0);
      const relayStatusVal = parsed.relay_status === undefined ? true : !!parsed.relay_status;

      return {
        voltage: voltageVal,
        current: currentVal,
        relay_status: relayStatusVal,
        status: getSystemStatus(voltageVal, currentVal, relayStatusVal),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error("Firebase Telemetry Fetch Failed:", error);
      return {
        voltage: 0.0,
        current: 0.0,
        relay_status: false,
        status: "POWER_OFF",
        timestamp: new Date().toISOString(),
        error: true
      };
    }
  }

  const targetIp = connectionString.trim() || "192.168.4.1";
  const url = `http://${targetIp}/api/data`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Local status code: ${response.status}`);
    }

    const data = await response.json();
    const v = parseFloat(data.voltage ?? 0.0);
    const i = parseFloat(data.current ?? 0.0);
    const r = data.relay_status === undefined ? !!data.relay : !!data.relay_status;

    return {
      voltage: v,
      current: i,
      relay_status: r,
      status: getSystemStatus(v, i, r),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error("Local ESP32 Fetch Failed:", error);
    return {
      voltage: 0.0,
      current: 0.0,
      relay_status: false,
      status: "POWER_OFF",
      timestamp: new Date().toISOString(),
      error: true
    };
  }
};

/**
 * Triggers ESP32 Relay or updates simulated state.
 */
export const toggleRelay = async (mode = 'simulated', connectionString = "", state) => {
  if (mode === 'simulated') {
    await new Promise(resolve => setTimeout(resolve, 200));
    simState.relay_status = state;
    simState.status = getSystemStatus(simState.voltage, simState.current, state);
    return { success: true, relay_status: simState.relay_status };
  }

  if (mode === 'firebase') {
    let dbUrl = connectionString.trim() || "https://domestic-wiring-project-default-rtdb.asia-southeast1.firebasedatabase.app/";
    if (!dbUrl.endsWith('/')) dbUrl += '/';
    const patchUrl = `${dbUrl}esp32_test.json`;
    const dataPatch = {
      relay_status: state
    };

    try {
      const response = await fetch(patchUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataPatch)
      });

      if (!response.ok) {
        throw new Error(`Firebase PATCH error: ${response.status}`);
      }

      return { success: true, relay_status: state };
    } catch (error) {
      console.error("Firebase Relay Control Failed:", error);
      return { success: false, error: error.message };
    }
  }

  const targetIp = connectionString.trim() || "192.168.4.1";
  const url = `http://${targetIp}/api/relay`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relay_status: state })
    });

    if (!response.ok) {
      throw new Error(`Relay status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, relay_status: result.relay_status ?? state };
  } catch (error) {
    console.error("Local Relay Control Failed:", error);
    return { success: false, error: error.message };
  }
};
