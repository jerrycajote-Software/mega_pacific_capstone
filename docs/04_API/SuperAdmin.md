# Super Admin API Specification

Endpoints restricted to users with `superadmin` / `super_admin` role credentials.

---

## Base Path: `/api/superadmin`

Protected by middleware: `verifySuperAdmin`

### 1. Get Portal Statuses
- **Endpoint**: `GET /api/superadmin/status`
- **Response**:
```json
{
  "success": true,
  "data": {
    "admin_portal_status": "online",
    "sales_portal_status": "online",
    "customer_portal_status": "online"
  }
}
```

### 2. Update Portal Status
- **Endpoint**: `PUT /api/superadmin/status`
- **Body**:
```json
{
  "key": "customer_portal_status",
  "value": "offline"
}
```
- **Socket Event Broadcast**: Emits `system_status_updated` with `{ key, value }` to all connected clients and triggers system cache refresh.

### 3. Active Users
- **Endpoint**: `GET /api/superadmin/active-users`
- **Description**: Returns live connected user sockets tracked in-memory by `socketTrackingService`.
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "name": "Super Admin",
      "email": "superadmin@mega-pacific.com",
      "role": "superadmin",
      "sessionCount": 1,
      "connectedAt": "2026-10-04T12:00:00.000Z"
    }
  ]
}
```

### 4. Session Logs
- **Endpoint**: `GET /api/superadmin/session-logs`
- **Description**: Returns the 100 most recent user login sessions with user details, status, IP, and device info.
- **Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 2,
      "token": "...",
      "isActive": true,
      "deviceInfo": "Mozilla/5.0 ... Chrome/130 ...",
      "ipAddress": "127.0.0.1",
      "createdAt": "2026-10-04T12:00:00.000Z",
      "loggedOutAt": null,
      "user": {
        "id": 2,
        "email": "admin@mega-pacific.com",
        "role": "admin"
      }
    }
  ]
}
```

### 5. System Diagnostics Info
- **Endpoint**: `GET /api/superadmin/system-info`
- **Description**: Returns low-level Node runtime metrics, OS platform, memory allocation, uptime, and database connection status.
- **Response**:
```json
{
  "success": true,
  "data": {
    "nodeVersion": "v20.x",
    "platform": "win32",
    "arch": "x64",
    "uptimeSeconds": 1420,
    "memory": {
      "rssMB": 160,
      "heapUsedMB": 84,
      "heapTotalMB": 128
    },
    "dbStatus": "connected",
    "serverTime": "2026-10-04T13:30:00.000Z"
  }
}
```
