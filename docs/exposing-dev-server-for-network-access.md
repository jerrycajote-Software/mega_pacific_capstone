# Exposing Dev Server for Network Access

**Date:** June 23, 2026  
**Status:** Resolved

---

## Problem Encountered

The application could not be accessed or logged into from another device on the same Wi-Fi network. When navigating to the network URL (e.g., `http://192.168.1.54:5173`) from a second device, the frontend would not load and login requests to the backend API would fail.

### Root Causes Identified

There were **three** separate issues preventing cross-device access:

| # | Issue | Affected File | Description |
|---|-------|---------------|-------------|
| 1 | **Vite dev server bound to `localhost`** | `frontend/vite.config.js` | By default, Vite only binds to `127.0.0.1` (localhost), which is a loopback address accessible only from the same machine. |
| 2 | **Express backend bound to `localhost`** | `backend/server.js` | `app.listen(PORT)` without specifying a host defaults to `localhost`, making the API unreachable from other devices. |
| 3 | **Frontend API URL hardcoded to `localhost:5000`** | Multiple frontend files | All API calls used `http://localhost:5000` as the fallback URL. When accessed from another device, `localhost` refers to *that* device — not the server machine. |

---

## Implementation Plan

### Objective

Expose both the Vite frontend dev server and the Express backend server to the local network, and configure the frontend to use the machine's LAN IP for API calls.

### Scope of Changes

1. **`frontend/vite.config.js`** — Add `server.host: true` to bind Vite to all network interfaces (`0.0.0.0`).
2. **`backend/server.js`** — Update `app.listen()` to bind to `"0.0.0.0"` instead of the default `localhost`.
3. **`frontend/.env`** — Create/update this file to set `VITE_API_URL` to the machine's LAN IP address so all API calls route correctly from any device.

### Prerequisites

- Both devices must be connected to the **same Wi-Fi network** (same SSID, same subnet).
- Windows Firewall must allow incoming connections on ports `5173` (Vite) and `5000` (Express).

---

## Steps Taken to Resolve the Issue

### Step 1: Expose the Vite Frontend Dev Server

**File Modified:** `frontend/vite.config.js`

Added `server.host: true` to the Vite configuration so the dev server binds to `0.0.0.0` (all network interfaces) instead of just `localhost`.

**Before:**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**After:**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
})
```

---

### Step 2: Expose the Express Backend Server

**File Modified:** `backend/server.js`

Changed `app.listen(PORT)` to `app.listen(PORT, "0.0.0.0")` so the backend accepts connections from any device on the network.

**Before:**

```js
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

**After:**

```js
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
});
```

---

### Step 3: Find the Machine's Local IP Address

**Command Used:**

```powershell
ipconfig | Select-String -Pattern "IPv4"
```

**Output:**

```
IPv4 Address. . . . . . . . . . . : 192.168.1.54
```

---

### Step 4: Configure Frontend API URL

**File Created:** `frontend/.env`

Set the `VITE_API_URL` environment variable to the machine's LAN IP so that API requests from any device are directed to the correct backend server.

```env
VITE_API_URL=http://192.168.1.54:5000
```

> **Note:** All frontend files already use `import.meta.env.VITE_API_URL || 'http://localhost:5000'`, so setting this environment variable overrides the `localhost` fallback across the entire app without modifying any source code.

---

## Commands Used

| Command | Purpose |
|---------|---------|
| `ipconfig \| Select-String -Pattern "IPv4"` | Find the machine's local/network IP address |
| `npm run dev` | Start the Vite frontend dev server (restart required after config change) |
| `node server.js` | Start the Express backend server (restart required after code change) |
| `npm run dev -- --host` | Alternative: expose Vite to the network without modifying `vite.config.js` |

---

## Task List

- [x] Diagnose why the app is inaccessible from other devices on the same Wi-Fi
- [x] Identify that Vite dev server is bound to `localhost` only
- [x] Update `frontend/vite.config.js` — add `server.host: true`
- [x] Identify that Express backend is bound to `localhost` only
- [x] Update `backend/server.js` — bind to `"0.0.0.0"`
- [x] Identify that frontend API URL defaults to `localhost:5000`
- [x] Retrieve the machine's LAN IP address (`192.168.1.54`)
- [x] Create `frontend/.env` with `VITE_API_URL=http://192.168.1.54:5000`
- [x] Restart both the frontend and backend servers
- [ ] Verify login works from the other device at `http://192.168.1.54:5173`
- [ ] (Optional) Allow ports `5173` and `5000` through Windows Firewall if blocked

---

## Important Notes

- **Dynamic IP:** If the Wi-Fi router assigns a different IP address later (e.g., after restarting), you'll need to update the IP in `frontend/.env`.
- **Windows Firewall:** A firewall prompt may appear when first running the servers on `0.0.0.0`. Click **"Allow access"** to permit incoming connections.
- **Same Network Required:** Both devices must be on the exact same Wi-Fi network and subnet. Guest networks or different bands (2.4GHz vs 5GHz) with isolation enabled will not work.
- **Production Deployment:** These changes are for **local development only**. In production, the frontend and backend should be deployed to a proper hosting service (e.g., Vercel, Netlify, Railway) with proper domain names.
