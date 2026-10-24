# Super Admin Mission Control Interface Specification

The Super Admin UI provides low-level system administration, real-time infrastructure gateway telemetry, staff clearance authorization, socket stream monitoring, and security session audit trails for Mega Pacific.

---

## Design System (UI/UX Pro Max)

- **Aesthetic**: Developer / Mission Control HUD (Dark Mode OLED + Cyber Frosted Glassmorphic Surfaces)
- **Primary Canvas**: `#060913` (Deep Obsidian Space) with ambient radial glows (`rgba(99, 102, 241, 0.12)` indigo and `rgba(56, 189, 248, 0.08)` cyan)
- **Surfaces**: `rgba(15, 23, 42, 0.65)` with `backdrop-filter: blur(16px)` and fine borders (`rgba(148, 163, 184, 0.15)`)
- **Typography**: Tabular figures / monospace (`ui-monospace`, `JetBrains Mono`) for IDs, timestamps, memory, and telemetry; modern sans (`Inter`) for interface body and headers.
- **Accents**: Cyber Indigo (`#6366F1`), Sky Cyan (`#38BDF8`), Emerald Operational (`#10B981`), Amber Warning (`#F59E0B`), Crimson Guard (`#EF4444`).

---

## Access & Authentication

- **Login URL**: `/superadmin-0megapacific/login`
- **File**: `frontend/src/pages/superadmin/LoginPage.jsx`
- **Protected Route**: `/superadmin/dashboard`
- **File**: `frontend/src/pages/superadmin/DashboardPage.jsx`
- **Role Requirement**: `superadmin` / `super_admin`

---

## Pages & Subsystems

### 1. Root Terminal Login (`/superadmin-0megapacific/login`)
- **Features**:
  - Root clearance Level 0 security badge
  - Email/password authentication restricted to `superadmin` role
  - Interactive password visibility toggle (Show/Hide)
  - Accessible focus states with cyber-indigo glow rings
  - Direct quick link back to standard login portal

### 2. Super Admin Mission Control HUD (`/superadmin/dashboard`)
- **Top Command HUD**:
  - Live node radar pulse indicator (`WEBSOCKET ACTIVE`)
  - Real-time Local and UTC clock ticker
  - Auto-synchronization countdown (10s interval) with manual refresh trigger
  - Root clearance profile badge and secure logout dialog

- **Telemetry KPI Metric Bar**:
  - **Fleet Operational**: Live status ratio of customer, admin, and sales portals
  - **Active Sockets**: Real-time connected clients stream counter
  - **Pending Authorizations**: Queue count of staff accounts awaiting approval
  - **Audit Trail (Recent)**: Count of active and historical session records

- **Navigation Tabs**:
  1. **Fleet & Portals**:
     - Operational cards for Customer Storefront (`/`), Admin Backoffice (`/admin`), and Sales Portal (`/sales`)
     - Guarded status switch: Requires confirmation modal before taking production traffic offline to prevent accidental downtime
  2. **Accounts & Provisioning**:
     - Complete management staff list with role filter (`Admin`, `Owner`, `Super Admin`, `Sales`, `Logistic`, `Finance`), status filter (`Active`, `Pending`, `Suspended`), and search
     - **Provision Account Modal**: Allows Super Admin to deploy new `Admin`, `Owner`, `Super Admin`, or staff accounts with custom full names, email, contact number, random secure password generator, and immediate activation
     - Candidate account clearance list with requested role tags
     - Cryptographic Super Admin password verification modal for approve (`active`) or reject (`delete`)
  3. **Live Sockets**:
     - Real-time connected client list with session count, role badges, and connection timestamps via Socket.IO
  4. **Session Audit Trail**:
     - Searchable, filterable security session log with pagination (10/25/50 per page)
     - Device & platform detection (OS and Browser parsing)
     - Export to CSV functionality
  5. **Diagnostics**:
     - Live client-to-server gateway latency ping measurement
     - Runtime environment stats (Node.js engine version, platform OS, server uptime)
     - Heap and RSS memory allocation metrics
     - Socket.IO cluster room verification
