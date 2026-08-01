# Smart Domestic Power Supply Fault Detection & Protection System

This repository contains the real-time web telemetry monitoring dashboard for the **Smart Domestic Power Supply Fault Detection and Protection System** (EE6304 Coursework - University of Ruhuna).

The system integrates an **ESP32 microcontroller** with high-fidelity mains sensors to monitor domestic grid power quality, identify hazardous thresholds, and activate auto-tripping circuit breakers (relay isolation) to protect household appliances from damage.

---

## 🛠️ Hardware Overview
- **Microcontroller**: ESP32 NodeMCU (Dual-Core, Integrated Wi-Fi Gateway)
- **Voltage Sensor**: ZMPT101B (Galvanically isolated active voltage transformer module)
- **Current Sensor**: ACS712 (Hall-effect current transducer module, 5A/20A/30A range)
- **Breaker Control**: 5V Relay module (configured as an isolated safety breaker)

---

## 🖥️ Web Telemetry Dashboard Features

Designed as a modern, high-performance, dark-theme engineering interface:

- **Circular SVG Gauges**: High-fidelity analog gauge meters rendering AC mains potential and current loads.
- **Dynamic Alert Cards**: Grid cards displaying Voltage, Current, and Frequency. Features dynamic outline flashing and icon changes when active faults are triggered (e.g., Over-Voltage red flashing, Under-Voltage amber flashing).
- **Active State Badge**: A central status card clearly displaying the exact telemetry state code (`NORMAL`, `WARNING`, `OVER_VOLTAGE`, `UNDER_VOLTAGE`, `OVER_CURRENT`, `FAULT`, `SENSOR_ERROR`).
- **Real-Time Area Graphs**: dual scrolling charts (Voltage vs Time, Current vs Time) rendering the last 60 seconds of grid fluctuations using Recharts.
- **Session aggregates**: Calculates running statistics (Today's Max Voltage, Min Voltage, Max Current, Average Voltage, Average Current) with an active reset command.
- **Data Configuration Popover**: Interactive options panel to toggle the dashboard between:
  1. **Simulation Mode** (Natural grid fluctuation modeling & manual fault injectors for presentations).
  2. **Local REST API Mode** (Direct polling from the ESP32 local server subnet).
  3. **Firebase Mode** (Fetches live telemetry via HTTP REST endpoints from your Firebase Realtime Database).

---

## 📂 Project Architecture

```
smart-power-dashboard/
├── src/
│   ├── components/      # Modular UI Widgets (Gauges, Charts, Header, Footer, Stats)
│   ├── hooks/           # useRealTimeData custom hook (polling, buffers, statistics)
│   ├── pages/           # DashboardPage (grid coordination & conditional injector panel)
│   ├── services/        # api.js (simulated data modeling & Firebase fetch queries)
│   ├── App.jsx          # Entry page router
│   ├── index.css        # Tailwind directives and custom animation styles
│   └── main.jsx
├── vite.config.js
└── package.json
```

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/UdariEdirinayake/Smart-Domestic-Power-Supply-Fault-Detection-Protection-System.git
   cd Smart-Domestic-Power-Supply-Fault-Detection-Protection-System
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:5173/` to view the running dashboard.

---

## 🔗 Database & ESP32 Integration

### Firebase Realtime Database Link
1. Click the **Config** gear icon in the top-right header of the dashboard.
2. Select **FIREBASE** mode.
3. Apply your database URL:
   `https://domestic-wiring-project-default-rtdb.asia-southeast1.firebasedatabase.app/`
4. The dashboard will instantly start pulling telemetry fields (`voltage`, `current`, `power`, `frequency`, `relay`, `status`, `faultCount`, `timestamp`) written by your ESP32.

---

## 🎓 Academic Credits
- **University**: University of Ruhuna, Sri Lanka
- **Department**: Department of Electrical and Information Engineering
- **Course**: EE6304 Embedded Systems Design
