# 🏛️ SmartCampus OS — Smart Campus Command Center
> **Next-Generation Autonomous Incident Command, IoT Telemetry & AI Resource Dispatch Platform**  
> *Engineered for Modern Educational Institutions, Smart Campus Ecosystems & High-Reliability Operations.*

---

## 📑 Table of Contents
1. [Project Overview & Abstract](#-1-project-overview--abstract)
2. [Problem Statement & Motivation](#-2-problem-statement--motivation)
3. [Proposed Solution & Unique Value Proposition](#-3-proposed-solution--unique-value-proposition)
4. [System Architecture & Flow](#-4-system-architecture--flow)
5. [Key Modules & Feature Breakdown](#-5-key-modules--feature-breakdown)
6. [AI Algorithms & Calculation Logic](#-6-ai-algorithms--calculation-logic)
7. [Technology Stack](#-7-technology-stack)
8. [Live Demonstration & Presentation Storyline](#-8-live-demonstration--presentation-storyline)
9. [Demo Credentials & User Roles](#-9-demo-credentials--user-roles)
10. [Local Setup & Installation](#-10-local-setup--installation)
11. [Viva & Examiner Q&A Guide](#-11-viva--examiner-qa-guide)
12. [Future Enhancements & Roadmap](#-12-future-enhancements--roadmap)
13. [Project Credits](#-13-project-credits)

---

## 📌 1. Project Overview & Abstract

**SmartCampus OS** is a centralized, real-time smart campus operations command center designed to replace legacy, disjointed college management workflows. It unifies emergency incident triage, multi-building IoT sensor telemetry, automated staff workload balancing, topological 2D campus mapping, and encrypted tactical communications into a single responsive dashboard.

Powered by a deterministic **AI Incident Risk Engine** and **Weighted Staff Allocation Algorithm**, SmartCampus OS enables campus administrators and emergency personnel to detect, prioritize, and resolve campus anomalies with maximum speed, zero data ambiguity, and complete audit compliance.

---

## ⚡ 2. Problem Statement & Motivation

Modern educational institutions host thousands of students, faculty, and expensive infrastructure spanning large geographical acres. Typical operational bottlenecks include:

- ❌ **Siloed Incident Reporting**: Delayed reporting of electrical hazards, server crashes, water leaks, or medical distress via phone calls and paper logs.
- ❌ **Sub-Optimal Personnel Dispatch**: Manual, unweighted task assignments leading to staff burnout and poor response times.
- ❌ **Blind Telemetry**: Lack of centralized visibility into critical server room temperatures, power substation loads, and gate security.
- ❌ **No SLA & Audit Transparency**: Inability to track time-to-acknowledge, time-to-resolve, and regulatory compliance logs.

---

## 💡 3. Proposed Solution & Unique Value Proposition

| Traditional Campus Management | SmartCampus OS Command Center |
|---|---|
| Manual paper / WhatsApp complaints | Single centralized real-time digital registry |
| Guesswork staff dispatch | AI suitability matching & live workload balancing |
| No IoT telemetry monitoring | Live sensor simulation & automated threshold alarms |
| Static list views | Interactive 2D topological map with building health |
| Fragmented verbal communication | Encrypted tactical channels & campus emergency broadcast |
| Fixed basic interface | Executive Light Mode & 24/7 Command Dark Mode |

---

## 🏗️ 4. System Architecture & Flow

```
                                ┌────────────────────────────────────────────────────────┐
                                │                 SmartCampus OS Portal                  │
                                └──────────────────────────┬─────────────────────────────┘
                                                           │
                    ┌─────────────────────────────────────┴─────────────────────────────────────┐
                    ▼                                                                           ▼
     ┌──────────────────────────────┐                                            ┌──────────────────────────────┐
     │      System Admin Portal     │                                            │     Faculty & Staff Portal   │
     │   (Lead: Aman - Super Admin) │                                            │   (Operative: Vikram Das)    │
     └──────────────┬───────────────┘                                            └──────────────┬───────────────┘
                    │                                                                           │
  ┌─────────────────┴───────────────────────────────┐                         ┌─────────────────┴───────────────────────────┐
  ▼                                                 ▼                         ▼                                             ▼
• Command Center Single-Pane Dashboard            • Interactive Campus Map   • My Dispatched Queue                         • Workload Meter
• AI Prioritization Kanban (Drag & Drop)          • Real-Time IoT Telemetry  • Quick Acknowledge/Resolve                   • Incident Notes
• Smart Resource Allocation Engine                • Tactical Channel Comms   • Encrypted Team Transmissions                • Alert Feed
• Global Security, Lockdown & Emergency Alarms    • Immutable Audit Trail    • Incident Field Reporting                    • Profile Status
```

---

## 🚀 5. Key Modules & Feature Breakdown

### 🎯 A. Command Center Executive Dashboard
- **Live Database-Calculated KPIs**:
  - **Active Incidents**: Real-time hazard count segmented by urgency.
  - **Response Capacity**: Instant calculation of standby vs. busy personnel.
  - **Resolution Rate**: 24-hour throughput with average turnaround time.
  - **Campus Time Clock**: Real-time digital IST clock with uptime telemetry.
- **7-Day Trend Visualizer**: Recharts gradient area charts depicting incident influx vs. resolution velocity.
- **Campus Safety Index**: Real-time composite readiness score.

### 📋 B. AI Prioritization Kanban Queue
- **Interactive Drag & Drop**: Full HTML5 drag-and-drop support across 4 status columns: `Critical`, `High Priority`, `Medium`, and `Low`.
- **Instant Cloud Sync**: Moving cards instantly updates priority levels in the database and broadcasts changes to all connected peers via Socket.IO.

### 👥 C. Smart Resource Allocation Engine
- Scans all campus personnel upon hazard registration and computes an **AI Suitability Score**.
- Factors in skill tags, department matching, current workload index, and availability state.
- Highlights the **"Recommended Assignment"** for one-click deployment.

### 🗺️ D. Interactive 2D Topological Campus Map
- Visual layout mapping **9 university facilities**:
  - *Main Admin Block, Computer Center, Hostel A, Hostel B, Medical Center, Main Ground, Library Hub, Academic Complex, Transport & Parking Hub*.
- **Color-Coded Node Health**:
  - 🟢 **Operational**: Normal parameters.
  - 🟡 **Warning**: Minor alerts / network degradation.
  - 🔴 **Critical**: Active emergency hazard.
- Clickable building drawers showing real-time environmental metrics and active incidents.

### 📡 E. IoT Sensor Telemetry & Virtual CCTV
- Autonomous background telemetry generator with live fluctuation simulations:
  - *Server Room Temperature (°C)*
  - *Core Network Optical Switch Load (%)*
  - *Campus Substation Power Draw (kW)*
  - *ANPR Gate Access Camera Health (%)*
  - *Hostel Wi-Fi Backbone Signal (%)*
  - *Central Library Air Quality Index (AQI)*
- Virtual CCTV surveillance matrix with radar scanlines and live timestamps.

### 💬 F. Encrypted Tactical Communications & Emergency Alarms
- Department-specific channels: `#Command Center`, `#Security Team`, `#Medical`, `#Facilities`, `#IT Support`.
- **Emergency Broadcast Alarm**: Audio-visual campus-wide emergency siren mode.
- **Campus Lockdown Simulator**: Software-based security perimeter lockdown.

### ☀️/🌙 G. Dynamic Theme Engine (Light & Dark Mode)
- Seamless one-click switch between Daylight Presentation (Light Mode) and Tactical Command (Dark Mode).
- Persisted across browser sessions with zero UI flickering.

---

## 🧠 6. AI Algorithms & Calculation Logic

### 1. Multi-Factor AI Risk Prioritization Score
$$\text{Risk Score} = W_{\text{severity}} + W_{\text{category}} + W_{\text{headcount}} + W_{\text{location\_risk}} + W_{\text{sla\_urgency}}$$

- **Severity Impact ($W_{\text{sev}}$)**: Critical (+35), High (+25), Medium (+15), Low (+5).
- **Hazard Category ($W_{\text{cat}}$)**: Fire/Medical (+30), Electrical/Security (+18), Others (+10).
- **Population Impact ($W_{\text{headcount}}$)**: Scaled based on density of affected students/staff ($0 - 20\text{ pts}$).
- **Resulting Risk Score**: Displayed dynamically as a percentage badge (e.g., `⚡ 92% Critical Risk`).

### 2. Weighted Operative Suitability Matching Algorithm
$$\text{Suitability Score} = (0.40 \times \text{Skill Match}) + (0.25 \times \text{Dept Match}) + (0.20 \times \text{Availability}) + (0.15 \times \text{Workload Inverse})$$

- **Skill Overlap (40%)**: Compares incident tags with staff certifications.
- **Department Affinity (25%)**: Confirms alignment (e.g., IT vs. Medical).
- **Availability State (20%)**: `AVAILABLE` = 100%, `BUSY` = 40%, `OFF_DUTY` = 0%.
- **Workload Penalty (15%)**: Prevents overloading personnel with existing active tickets.

---

## 🛠️ 7. Technology Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend Framework** | React 19 + Vite | High-performance Single Page Application (SPA) |
| **Styling & Design** | Tailwind CSS v4 + Vanilla CSS | Modern glassmorphism, responsive UI, dual themes |
| **Data Visualization** | Recharts | Smooth area charts, bar graphs, and integrity gauges |
| **Icons & Assets** | Lucide React | Clean, modern SVG iconography |
| **Backend Server** | Node.js + Express.js | Robust RESTful API architecture |
| **Real-Time Communication**| Socket.IO | Full-duplex WebSocket event streaming |
| **Database & ORM** | MongoDB + Mongoose | Scalable document database with memory fallback |
| **Security & Auth** | JWT + bcryptjs | Role-based authorization & password encryption |
| **Cloud Deployment** | Netlify / Render | Edge CDN frontend with offline zero-fail fallback |

---

## 🎬 8. Live Demonstration & Presentation Storyline

Use this structured 5-step walkthrough during project viva and demonstrations:

```
[Step 1: Detection]
  └── IoT Sensor detects temperature anomaly (>78°C) in Computer Center
      OR Student logs Medical Emergency at Main Ground.
      ↓
[Step 2: AI Evaluation]
  └── SmartCampus AI computes Risk Score (92% - Critical).
      Card automatically appears in the "Critical" Kanban Queue column.
      ↓
[Step 3: Smart Allocation]
  └── Super Admin (Aman) opens Incident Dispatch.
      AI suggests Dr. Ananya Roy (94% Match) based on skills and low workload.
      Admin clicks "Dispatch Operative" → Live socket alert sent.
      ↓
[Step 4: Field Resolution]
  └── Staff Member (Vikram Das / Dr. Roy) logs into Staff Portal.
      Acknowledges ticket → Adds field notes → Marks as "Resolved".
      Campus Map status flips from Red (Critical) to Green (Operational).
      ↓
[Step 5: Executive Audit & Analytics]
  └── Resolution time is recorded in Executive Analytics and immutable Audit Logs.
```

---

## 🔑 9. Demo Credentials & User Roles

| Role | Name | Email | Password | Access Privileges |
|---|---|---|---|---|
| **Super Administrator** | **Aman** | `admin@campus.com` | `Admin@123` | Full Command Center, Staff Management, AI Settings, Emergency Alarms, Audit Logs |
| **Faculty & Staff** | **Vikram Das** | `staff@campus.com` | `Staff@123` | Staff Workspace, Assigned Incident Queue, Field Notes, Resolution Flow |
| **Medical Operative** | **Dr. Ananya Roy** | `ananya@campus.com` | `Staff@123` | Medical Triage, Ambulance Unit Dispatch |
| **Electrical Operative**| **Rahul Verma** | `rahul@campus.com` | `Staff@123` | Substation Maintenance, Power Draw Analytics |

---

## 💻 10. Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0 or above
- **npm**: v9.0 or above

### Installation Commands

```bash
# 1. Clone or navigate to the repository
cd 15-folder

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd server
npm install
cd ..
```

### Running the Application

In **Terminal 1** (Backend Server):
```bash
cd server
node src/server.js
```
*Backend runs on: `http://localhost:5000`*

In **Terminal 2** (Frontend Client):
```bash
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

---

## 🎓 11. Viva & Examiner Q&A Guide

**Q1: How does the system handle real-time synchronization across different users?**  
> *Ans:* The application uses **Socket.IO** bi-directional WebSockets. Whenever an incident is updated or dispatched, the server emits events (e.g., `incident:updated`, `sensor:alert`), which instantly update the React state on all connected clients without page reloads.

**Q2: What happens if the backend or database goes down?**  
> *Ans:* SmartCampus OS features a dual-resilience layer: (1) The backend includes an embedded `mongodb-memory-server` fallback if a live MongoDB instance is unavailable, and (2) The frontend features a zero-fail static interceptor that seamlessly loads mock telemetry data on static CDN deployments like Netlify.

**Q3: How does the AI risk calculation work?**  
> *Ans:* It uses a deterministic multi-variable scoring model evaluating severity weight, hazard domain, population density impact, and SLA deadlines to generate an objective 0–100% risk index.

**Q4: Is role-based access control (RBAC) implemented?**  
> *Ans:* Yes. Administrators (Aman) have full command, dispatch, and configuration rights, while Staff (Vikram Das) have dedicated portal views restricted to their assigned tasks and team communications.

---

## 🔮 12. Future Enhancements & Roadmap
- 📡 **Hardware IoT Integration**: Direct MQTT / LoRaWAN gateway support for physical ESP32 and Arduino sensors.
- 📱 **Mobile Native Apps**: React Native field application with GPS tracking for maintenance teams.
- 🤖 **Computer Vision AI**: Automated CCTV incident detection for fire and unauthorized perimeter access using YOLOv8.
- 📊 **Predictive Maintenance**: Machine learning models for forecasting HVAC and power grid failures.

---

## 👥 13. Project Credits
- **Project Lead & Super Admin:** **Aman**
- **Project Title:** Smart Campus Management System (*SmartCampus OS*)
- **Category:** Smart Campus Automation, IoT Telemetry, AI Incident Command & Resource Allocation
