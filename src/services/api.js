/**
 * API Service for ESP32, Firebase, and Simulated Data
 */

// Keep simulation state persistent across requests
let simState = {
  voltage: 228.5,
  current: 1.80,
  power: 397.4,
  frequency: 50.0,
  relay: true,
  status: "NORMAL",
  faultCount: 0,
  lastFaultTime: null,
  timestamp: new Date().toISOString(),
  sensorHealth: {
    ZMPT101B: "online",
    ACS712: "online",
    ESP32: "online"
  }
};

// Internal timer to simulate natural fluctuations
let ticks = 0;
let faultDuration = 0;
let currentFaultType = null; // 'OVER_VOLTAGE', 'UNDER_VOLTAGE', 'OVER_CURRENT', 'SENSOR_ERROR'

/**
 * Triggers a simulated fault for testing and demo purposes
 * @param {string} type - 'OVER_VOLTAGE' | 'UNDER_VOLTAGE' | 'OVER_CURRENT' | 'SENSOR_ERROR'
 */
export const triggerSimulatedFault = (type) => {
  currentFaultType = type;
  faultDuration = 5; // Fault lasts for 5 seconds
};

/**
 * Reset faults and reset relay back to ON
 */
export const resetSimulatedSystem = () => {
  simState.relay = true;
  simState.status = "NORMAL";
  currentFaultType = null;
  faultDuration = 0;
};

/**
 * Helper to update simulation values
 */
const updateSimulation = () => {
  ticks++;
  
  if (faultDuration > 0) {
    faultDuration--;
    
    if (currentFaultType === 'OVER_VOLTAGE') {
      simState.voltage = parseFloat((260.0 + Math.random() * 10).toFixed(1));
      simState.current = parseFloat((1.5 + Math.random() * 0.5).toFixed(2));
      simState.status = "OVER_VOLTAGE";
      if (faultDuration < 4) {
        simState.relay = false;
        simState.status = "FAULT";
      }
    } else if (currentFaultType === 'UNDER_VOLTAGE') {
      simState.voltage = parseFloat((170.0 - Math.random() * 10).toFixed(1));
      simState.current = parseFloat((0.8 + Math.random() * 0.3).toFixed(2));
      simState.status = "UNDER_VOLTAGE";
      if (faultDuration < 4) {
        simState.relay = false;
        simState.status = "FAULT";
      }
    } else if (currentFaultType === 'OVER_CURRENT') {
      simState.voltage = parseFloat((224.0 + Math.random() * 4).toFixed(1));
      simState.current = parseFloat((6.2 + Math.random() * 1.5).toFixed(2));
      simState.status = "OVER_CURRENT";
      if (faultDuration < 4) {
        simState.relay = false;
        simState.status = "FAULT";
      }
    } else if (currentFaultType === 'SENSOR_ERROR') {
      simState.voltage = 0.0;
      simState.current = 0.0;
      simState.status = "SENSOR_ERROR";
      simState.sensorHealth.ZMPT101B = Math.random() > 0.5 ? "offline" : "online";
      simState.sensorHealth.ACS712 = Math.random() > 0.5 ? "offline" : "online";
    }

    if (faultDuration === 3) {
      simState.faultCount += 1;
      simState.lastFaultTime = new Date().toISOString();
    }
  } else {
    currentFaultType = null;
    simState.sensorHealth.ZMPT101B = "online";
    simState.sensorHealth.ACS712 = "online";
    simState.sensorHealth.ESP32 = "online";

    if (simState.relay) {
      const baseVoltage = 230.0;
      const wave = Math.sin(ticks * 0.1) * 3;
      const noise = (Math.random() - 0.5) * 1.5;
      simState.voltage = parseFloat((baseVoltage + wave + noise).toFixed(1));

      const loadFactor = 1.0 + Math.sin(ticks * 0.05) * 0.5;
      const baseCurrent = 1.6;
      const currentNoise = (Math.random() - 0.5) * 0.2;
      simState.current = parseFloat((baseCurrent * loadFactor + currentNoise).toFixed(2));

      simState.frequency = parseFloat((50.0 + (Math.random() - 0.5) * 0.08).toFixed(2));

      const powerFactor = 0.95;
      simState.power = parseFloat((simState.voltage * simState.current * powerFactor).toFixed(1));

      if (simState.voltage > 240.0 || simState.voltage < 210.0 || simState.current > 4.0) {
        simState.status = "WARNING";
      } else {
        simState.status = "NORMAL";
      }
    } else {
      const baseVoltage = 230.0;
      simState.voltage = parseFloat((baseVoltage + (Math.random() - 0.5) * 1.5).toFixed(1));
      simState.current = 0.0;
      simState.power = 0.0;
      simState.frequency = parseFloat((50.0 + (Math.random() - 0.5) * 0.04).toFixed(2));
      simState.status = "FAULT";
    }
  }

  simState.timestamp = new Date().toISOString();
  return { ...simState };
};

/**
 * Parses raw Firebase database payload to extract telemetry fields
 */
const parseFirebaseData = (data) => {
  if (!data) return null;
  
  // 1. Check if root contains the required fields directly
  if ('voltage' in data && 'current' in data) {
    return data;
  }
  
  // 2. Check common nesting wrappers like "Data", "telemetry", "sensor", "ESP32"
  const potentialKeys = ['Data', 'data', 'telemetry', 'sensor', 'esp32', 'status_data'];
  for (const key of potentialKeys) {
    if (data[key] && typeof data[key] === 'object' && 'voltage' in data[key]) {
      return data[key];
    }
  }

  // 3. Fallback: check if we see "esp32_test" connectivity
  if (data.esp32_test) {
    const isOnline = data.esp32_test.status === "ONLINE";
    return {
      voltage: 230.0, // Default reference voltage for demo
      current: 0.0,
      power: 0.0,
      frequency: 50.0,
      relay: true,
      status: "NORMAL",
      faultCount: 0,
      timestamp: new Date().toISOString(),
      sensorHealth: {
        ZMPT101B: "online",
        ACS712: "online",
        ESP32: isOnline ? "online" : "offline"
      }
    };
  }

  return null;
};

/**
 * Fetches real-time power data from selected source.
 * @param {string} mode - 'simulated' | 'local' | 'firebase'
 * @param {string} connectionString - ESP32 IP (for local) or Firebase REST URL
 * @returns {Promise<Object>} Telemetry data payload.
 */
export const fetchPowerData = async (mode = 'simulated', connectionString = "") => {
  if (mode === 'simulated') {
    await new Promise(resolve => setTimeout(resolve, 100));
    return updateSimulation();
  }

  if (mode === 'firebase') {
    // Standard Firebase URL format: https://[db-name].firebasedatabase.app/
    let dbUrl = connectionString.trim() || "https://domestic-wiring-project-default-rtdb.asia-southeast1.firebasedatabase.app/";
    if (!dbUrl.endsWith('/')) dbUrl += '/';
    const fetchUrl = `${dbUrl}.json`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
      
      const response = await fetch(fetchUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Firebase status code: ${response.status}`);
      }

      const rawData = await response.json();
      const parsed = parseFirebaseData(rawData);

      if (!parsed) {
        throw new Error("No telemetry schema detected in Firebase payload.");
      }

      return {
        voltage: parseFloat(parsed.voltage ?? 0.0),
        current: parseFloat(parsed.current ?? 0.0),
        power: parseFloat(parsed.power ?? 0.0),
        frequency: parseFloat(parsed.frequency ?? 50.0),
        relay: parsed.relay === undefined ? true : !!parsed.relay,
        status: String(parsed.status ?? "NORMAL").toUpperCase(),
        faultCount: parseInt(parsed.faultCount ?? 0, 10),
        timestamp: parsed.timestamp ?? new Date().toISOString(),
        sensorHealth: parsed.sensorHealth ?? {
          ZMPT101B: "online",
          ACS712: "online",
          ESP32: "online"
        }
      };
    } catch (error) {
      console.error("Firebase Telemetry Fetch Failed:", error);
      return {
        ...simState,
        status: "SENSOR_ERROR",
        sensorHealth: {
          ZMPT101B: "no_data",
          ACS712: "no_data",
          ESP32: "offline"
        }
      };
    }
  }

  // Local ESP32 mode
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
    return {
      voltage: parseFloat(data.voltage ?? 0),
      current: parseFloat(data.current ?? 0),
      power: parseFloat(data.power ?? 0),
      frequency: parseFloat(data.frequency ?? 50),
      relay: !!data.relay,
      status: String(data.status ?? "NORMAL").toUpperCase(),
      faultCount: parseInt(data.faultCount ?? 0, 10),
      timestamp: data.timestamp ?? new Date().toISOString(),
      sensorHealth: data.sensorHealth ?? {
        ZMPT101B: "online",
        ACS712: "online",
        ESP32: "online"
      }
    };
  } catch (error) {
    console.error("Local ESP32 Fetch Failed:", error);
    return {
      ...simState,
      status: "SENSOR_ERROR",
      sensorHealth: {
        ZMPT101B: "no_data",
        ACS712: "no_data",
        ESP32: "offline"
      }
    };
  }
};

/**
 * Triggers ESP32 Relay or updates simulated state.
 * @param {string} mode - 'simulated' | 'local' | 'firebase'
 * @param {string} connectionString - Gateway URL / IP
 * @param {boolean} state - Target relay state (true = ON, false = OFF)
 */
export const toggleRelay = async (mode = 'simulated', connectionString = "", state) => {
  if (mode === 'simulated') {
    await new Promise(resolve => setTimeout(resolve, 200));
    simState.relay = state;
    simState.status = state ? "NORMAL" : "FAULT";
    return { success: true, relay: simState.relay };
  }

  if (mode === 'firebase') {
    let dbUrl = connectionString.trim() || "https://domestic-wiring-project-default-rtdb.asia-southeast1.firebasedatabase.app/";
    if (!dbUrl.endsWith('/')) dbUrl += '/';
    
    // We write to both the root and child paths to be safe
    // Since Firebase REST API PUT/PATCH edits state directly
    const patchUrl = `${dbUrl}.json`;
    const dataPatch = {
      // Patch at root
      relay: state,
      status: state ? "NORMAL" : "FAULT",
      // Patch under nested "Data" path
      Data: {
        relay: state,
        status: state ? "NORMAL" : "FAULT",
        timestamp: new Date().toISOString()
      }
    };

    try {
      const response = await fetch(patchUrl, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataPatch)
      });

      if (!response.ok) {
        throw new Error(`Firebase PUT/PATCH error: ${response.status}`);
      }

      return { success: true, relay: state };
    } catch (error) {
      console.error("Firebase Relay Control Failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Local ESP32 control
  const targetIp = connectionString.trim() || "192.168.4.1";
  const url = `http://${targetIp}/api/relay`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relay: state })
    });

    if (!response.ok) {
      throw new Error(`Relay control status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, relay: result.relay ?? state };
  } catch (error) {
    console.error("Local Relay Control Failed:", error);
    return { success: false, error: error.message };
  }
};
