# Admin Interface Specification

The Admin UI serves as the **Technical Support & User Administration Portal**. Operational sales, product catalog, coil inventory, and payments are managed within their respective specialized department portals (Sales, Logistics, Finance).

---

## Access & Layout

- **Login URL**: `/admin-1megapacific/login`
- **Protected Layout**: `AdminLayout.jsx` (Sidebar + Top Bar + Responsive Content Area)
- **Role Requirement**: `admin`

---

## Pages & Components

### 1. Admin Dashboard (`/admin/dashboard`)
- **File**: `pages/admin/DashboardPage.jsx`
- **Features**: 
  - **Administrative KPI Cards**: Registered Customers (with weekly growth), Operational Staff Clearance (singleton 1:1 status), Email Verification Health (% verified vs pending OTP), and Security Flags / Suspended accounts count.
  - **Departmental Staff Clearance Directory**: Real-time table of departmental staff (Admin, Owner, Sales, Logistic, Finance) showing official email, contact number, and authorization state.
  - **Administrative Shortcuts**: Instant navigation cards for Customer Directory, Staff Clearance & Reset, and Security & Device Limits.
  - **System Policy & Controls Card**: Singleton rule enforcement status, active user sessions count, and maximum concurrent device allowance.
  - **Recent Customer Registrations**: Live feed of recent customer signups with name, email, Philippine contact number, CALABARZON location, verification state, and direct directory shortcut.

### 2. User Directory (`/admin/users`)
- **File**: `pages/admin/UserManagement.jsx`
- **Features**:
  - **KPI Metrics Bar**: Total Registered Users, Active Customers, Staff Clearance, Suspended Accounts.
  - **Search & Filtering**: Combined instant search query (by name, email, Philippine contact number) with Role selector (Customer, Sales, Logistics, Finance, Admin, Owner) and Status selector (Active, Suspended).
  - **Data Table**: User profile avatar with system ID, contact information (email with quick mail link, formatted Philippine contact number `09XXXXXXXXX`, location badge), role color badge, verification status badge, registration date.
  - **Direct Account Actions**: Instant status toggle button ("Suspend Account" or "Activate Account") with confirmation dialog modal and pagination controls.

### 3. Staff Management (`/admin/accounts`)
- **File**: `pages/admin/SalesManagement.jsx`
- **Features**:
  - **Operational Clearance Metrics**: Total Provisioned Staff, Sales Officers, Logistics Officers, Finance Officers.
  - **Singleton 1-Account-per-Role Policy Banner**: Transparent notice clarifying root staff provisioning in Super Admin Mission Control.
  - **Filter Toolbar**: Search by staff name or email, with department filter selector.
  - **Operational Staff Table**: Account avatar, email, department role badge, formatted Philippine contact number (`09XXXXXXXXX`) or `+ Add Mobile` button, status badge, created date.
  - **Management Modals**:
    - **Edit Staff Details Modal**: Full Name and Philippine contact number with real-time 11-digit clamping (`09XXXXXXXXX`).
    - **Credential Reset Modal**: Requires Admin master password validation to authorize password resets.
    - **Account Status Toggle Modal**: Confirmation dialog to suspend or reactivate staff accounts.

### 4. System Settings (`/admin/settings`)
- **File**: `pages/admin/SettingsPage.jsx`
- **Features**:
  - **Two-Column Enterprise Layout**:
    - **Security & Concurrency Controls**: Editable `max_sales_devices` input setting (PUT `/api/admin/settings/max_sales_devices`), session concurrency explanations, and password complexity requirements overview.
    - **Facility & Infrastructure Status**: Mega Pacific Imus Plant & CALABARZON logistics hub identity, alongside live platform safeguards (2FA SMS/Email OTP, Singleton 1:1 guard, session inactivity timeout, secure WebSocket).

