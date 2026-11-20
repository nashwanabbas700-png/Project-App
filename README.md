# EduNova – Smart Faculty Timetable Management System

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.88-61dafb.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2058-black.svg)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-green.svg)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-white.svg)](https://socket.io/)

EduNova is an enterprise-grade institutional mobile application and backend designed for university faculty members and academic administrators / timetable coordinators. It combines **constraint satisfaction algorithms**, **historical timetable pattern analysis**, and **real-time synchronization** to eliminate scheduling conflicts, optimize faculty workloads, and automate university timetable publishing.

---

## 🏛️ Project Objective & System Capabilities

1. **Intelligent Timetable Generation**: Replaces manual scheduling friction using a constraint solver that learns from previous semester records (Fall 2025, Spring 2025), faculty availability windows, and room capacities.
2. **Automated Conflict Detection**: Evaluates hard constraints (0 tolerance for room/faculty/section double-bookings) and soft constraints (fatigue prevention, preferred time windows, workload limits) with visual traffic-light indicators.
3. **Faculty Workload Balancing**: Real-time analytics tracking weekly teaching hours against contract ceilings, identifying overloaded, balanced, and underutilized faculty members.
4. **Real-Time Push Architecture**: Powered by Socket.IO to notify faculty members immediately when classrooms, timings, or schedules are updated or published.
5. **Dual Institutional Roles**: Custom dashboards and permission levels for Administrators/Timetable Coordinators and Faculty Members with instantaneous presentation switching.

---

## 🏗️ Architecture & Technology Stack

```
EduNova/
├── backend/                  # Node.js + Express + TypeScript + Socket.IO REST Gateway
│   ├── src/
│   │   ├── algorithms/       # Core constraint scheduling engine & conflict detector
│   │   │   ├── schedulingEngine.ts     # Constraint solver + historical weight matrix
│   │   │   ├── conflictDetector.ts     # Real-time multi-dimensional conflict auditor
│   │   │   └── workloadOptimizer.ts    # Workload parity & fatigue distributor
│   │   ├── config/           # Database & environment configurations
│   │   ├── controllers/      # REST API route controllers
│   │   ├── middleware/       # JWT auth & role-based access control
│   │   ├── models/           # Mongoose schemas (12 institutional models)
│   │   ├── routes/           # Express router endpoints
│   │   ├── seed/             # Realistic institutional seed dataset
│   │   ├── services/         # State store & Socket.IO real-time service
│   │   └── index.ts          # Express & Socket.IO server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── mobile/                   # React Native + Expo + TypeScript Mobile Application
│   ├── src/
│   │   ├── components/       # Modern design system (Cards, Badges, Daily/Weekly matrix)
│   │   ├── constants/        # Institutional colors, typography, theme & endpoints
│   │   ├── context/          # AuthContext (JWT session) & TimetableContext (Live sync)
│   │   ├── navigation/       # RootNavigator (Faculty tabs & Admin console)
│   │   ├── screens/
│   │   │   ├── auth/         # Login with university credentials & demo SSO assertion
│   │   │   ├── faculty/      # Faculty Home, Timetable (Daily/Weekly), Courses, Alerts, Profile
│   │   │   └── admin/        # Admin Dashboard, Faculty, Courses, Rooms, Generator, Analytics
│   │   ├── services/         # REST API & Socket.IO client
│   │   └── types/            # Strict TypeScript interfaces
│   ├── App.tsx
│   ├── app.json
│   └── package.json
└── README.md
```

### Frontend
- **Framework**: React Native with **Expo SDK 58**
- **Language**: TypeScript (Strict Mode)
- **Design System**: Linear/Apple inspired clean aesthetic with custom elevation, cards, and pills
- **Icons**: Lucide React Native
- **Storage**: AsyncStorage session tokens & user metadata
- **Real-Time**: Socket.IO Client for instant notifications and timetable refreshes
- **Cross-Platform**: Runs natively on Android, iOS, and Web (`npm run web`)

### Backend
- **Runtime**: Node.js v24+
- **Framework**: Express.js with TypeScript
- **Database**: MongoDB with Mongoose ODM (with automatic fallback to a resilient in-memory institutional store for presentation environments without local MongoDB daemons)
- **Authentication**: JWT-based session tokens with role claims (`admin` vs `faculty`)
- **Real-Time Gateway**: Socket.IO with per-faculty room broadcasting

---

## 🔑 Pre-Seeded Demo Accounts

The application includes two preconfigured institutional accounts ready for evaluation:

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@EduNova.edu` | `Admin123!` | University Registrar / Timetable Coordinator |
| **Faculty Member** | `faculty@EduNova.edu` | `Faculty123!` | Dr. Sarah Jenkins (Associate Professor, Computer Science) |

> **Presentation Tip**: The login screen features 1-tap demo pills that autofill these credentials. In addition, an institutional SSO demo button demonstrates the SAML 2.0 / OIDC identity assertion workflow. While logged in, use the top bar's role switcher pill to flip instantly between Faculty and Admin modes!

---

## 🧠 Intelligent Scheduling & Constraint Engine

### Constraint Satisfaction Rules
- **Hard Constraints (Zero Tolerance)**:
  1. **Faculty Overlap**: A faculty member cannot be scheduled for two classes at the same time.
  2. **Classroom Overlap**: A room cannot host two simultaneous sessions.
  3. **Section Overlap**: A student cohort section cannot attend concurrent lectures.
  4. **Working Hours**: Only schedules between 08:30 and 17:00, Monday through Friday.
  5. **Faculty Availability**: Strictly respects blocked days (e.g. research days) and unavailable meeting slots.
  6. **Room Type Matching**: Courses requiring computer or science laboratories are strictly assigned to rooms equipped with specialized workstations.
- **Soft Constraints (Optimization Heuristic)**:
  1. **Workload Balance**: Equalizes teaching hours to prevent faculty burnout.
  2. **Fatigue Mitigation**: Avoids excessive consecutive classes (>2 sessions in a row).
  3. **Preference Windows**: Honors preferred morning or afternoon teaching slots.
  4. **Historical Continuity**: Awards bonuses for room and time arrangements that achieved high satisfaction ratings in previous terms.

### 10-Step Generation Workflow
1. **Semester Selection**: Admin designates target term (e.g. `Spring 2027`).
2. **Domain Ingestion**: Loads active faculty, courses, classrooms, and constraints.
3. **Historical Retrieval**: Analyzes Fall 2025 and Spring 2025 performance records.
4. **Constraint Solver Execution**: Evaluates combinations using heuristic prioritization (Labs and restricted courses scheduled first).
5. **Quality Score Calculation**: Outputs composite 0-100% score broken down by Hard Constraints (100%), Soft Preferences, Workload Balance, and Historical Alignment.
6. **Workload Impact Review**: Assesses faculty allocation percentages.
7. **Simulation Preview**: Interactive inspection of generated sessions.
8. **Adjustment / Regeneration**: Option to re-run solver or adjust parameters.
9. **Final Validation**: Verifies zero critical conflicts exist.
10. **1-Click Publication**: Commits to active schedule, logs audit trail, and fires push notifications to all affected faculty via Socket.IO.

---

## 🚀 Installation & Execution Guide

### Prerequisites
- **Node.js**: v18 or higher (v24 recommended)
- **npm**: v9 or higher

### 1. Backend Setup & Startup

```bash
# Navigate to backend directory
cd backend

# Install dependencies (already installed if evaluating workspace)
npm install

# Optional: seed MongoDB (if MongoDB service is active on localhost:27017)
npm run seed

# Start backend server
npm run dev
# Or with tsx directly:
npx tsx src/index.ts
```

The backend server runs on `http://localhost:5000` and outputs:
```
🚀 EduNova Backend Server running on port 5000
📡 REST API: http://localhost:5000/api
⚡ Socket.IO Gateway active
🎓 Institutional Mode: University Faculty Timetable System
```

### 2. Mobile App Setup & Startup

Open a second terminal window:

```bash
# Navigate to mobile directory
cd mobile

# Start Expo development server
npx expo start
```

From the Expo CLI menu:
- Press **`w`** to open the mobile application directly in your web browser (runs on `http://localhost:8081`).
- Press **`a`** to launch on Android emulator.
- Press **`i`** to launch on iOS simulator.
- Scan the QR code with the **Expo Go** mobile app on your physical smartphone.

---

## 📡 REST API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate with university credentials | None |
| `POST` | `/api/auth/sso-login` | Demo institutional SSO identity assertion | None |
| `GET` | `/api/auth/me` | Retrieve current user profile and faculty details | `Bearer Token` |
| `GET` | `/api/faculty` | List faculty with department filter & search | None |
| `POST` | `/api/faculty` | Create new faculty member with availability | `Admin` |
| `PUT` | `/api/faculty/:id` | Update faculty details, office, phone | `Faculty / Admin` |
| `DELETE`| `/api/faculty/:id` | Remove faculty member | `Admin` |
| `GET` | `/api/courses` | List courses with department & credit specs | None |
| `POST` | `/api/courses` | Create new academic course | `Admin` |
| `GET` | `/api/classrooms` | List classrooms with type and capacity filters | None |
| `POST` | `/api/classrooms` | Add campus facility or laboratory | `Admin` |
| `GET` | `/api/timetable/master` | Master schedule with conflict detection audit | None |
| `GET` | `/api/timetable/faculty` | Faculty personal timetable (Daily / Weekly) | `Faculty` |
| `POST` | `/api/timetable/entries` | Add class session (validates conflicts) | `Admin` |
| `PUT` | `/api/timetable/entries/:id`| Modify session, log reason, notify faculty | `Admin` |
| `DELETE`| `/api/timetable/entries/:id`| Cancel session, log reason, notify faculty | `Admin` |
| `POST` | `/api/timetable/publish`| Officially publish timetable and notify all faculty | `Admin` |
| `GET` | `/api/timetable/history` | Chronological audit trail of schedule changes | None |
| `POST` | `/api/generate/simulate` | Run intelligent constraint solver simulation | `Admin` |
| `POST` | `/api/generate/apply` | Commit generated schedule and notify faculty | `Admin` |
| `GET` | `/api/generate/historical-insights` | Historical data analysis from past terms | None |
| `GET` | `/api/analytics/workload` | Faculty workload distribution analytics | None |
| `GET` | `/api/analytics/conflicts`| Real-time conflict audit report | None |
| `GET` | `/api/analytics/dashboard`| Institutional dashboard KPI statistics | None |
| `GET` | `/api/notifications` | Faculty notification center alerts | `Faculty` |

---

## 🎓 University Presentation Walkthrough

Follow these steps during your project evaluation to showcase all features:

1. **Authentication & SSO Demonstration**:
   - Open the app. Notice the EduNova university branding and quick demo pills.
   - Tap **"Faculty Member"** to autofill `faculty@EduNova.edu` and sign in.
   - Alternatively, tap **"Institutional SSO Login (Demo)"** to showcase SAML/OIDC identity assertion architecture.
2. **Faculty Experience Walkthrough**:
   - **Dashboard**: Review greeting for Dr. Sarah Jenkins, today's lecture count, weekly hours progress, next class countdown card, and today's schedule.
   - **Timetable Screen**: Toggle between **Daily View** (with day selector pills) and **Weekly View** (interactive 5-day matrix grid). Tap any class block to inspect details.
   - **Courses Screen**: Inspect assigned curriculum courses, credit values, weekly sessions, and laboratory specifications.
   - **Notification Center**: Review alerts regarding room upgrades, schedule publication, and department announcements.
   - **Profile Screen**: Review faculty ID, department, office location, contact extension, and the teaching workload meter. Tap "Edit Contact Details" to update information.
3. **Seamless Role Switching**:
   - Tap the top-right role switcher pill **"Faculty Mode"** to flip instantly to **"Admin Mode"** without manual logout!
4. **Administrator & Smart Scheduling Walkthrough**:
   - **Dashboard**: Point out real-time institutional metrics (10 faculty, 3 departments, 12 courses, 8 rooms, scheduled classes) and conflict indicators.
   - **Smart Scheduling (The Star Feature)**:
     - Navigate to "Smart Scheduler".
     - Select target semester (`Spring 2027`) and department scope.
     - Toggle the Historical Pattern Compatibility Engine and Workload Optimization flags.
     - Click **"Analyze Constraints & Generate Timetable"**.
     - Review the resulting **Quality Score Card (91-96%)**: 100% hard constraints satisfied, historical alignment, workload balance, and the generated classes list.
     - Click **"Accept & Publish Timetable"** to deploy the schedule.
   - **Master Timetable Management**:
     - Filter by department, switch to Daily or Weekly view.
     - Tap **"Add Class Entry"** or edit an existing class to show automatic conflict detection preventing room or faculty double-bookings.
     - Tap **"Publish Timetable"** to push updates campus-wide.
   - **Faculty Management & Facilities**:
     - Review faculty directory, availability restrictions, and add/edit faculty.
     - Review classrooms, room types (Computer Lab, Science Lab, Lecture Room, Seminar Hall), and capacities.
   - **Workload Analytics**:
     - Review the institutional balance parity score, overloaded/balanced/underutilized categorization, and AI optimization recommendations.
   - **Audit History**:
     - Open the audit trail to show the chronological record of who modified what, timestamp, previous schedule, new schedule, and modification reasons.
   - Switch back to Faculty Mode to demonstrate that Dr. Sarah Jenkins has received the new timetable updates and notifications in real-time!

