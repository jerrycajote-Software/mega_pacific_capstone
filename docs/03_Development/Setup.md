# Local Development Setup Guide

This guide provides instructions to get the **Mega Pacific** full-stack application running on your local development machine.

---

## Prerequisites

Ensure you have the following installed on your system:
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: v14.x or higher running locally or accessible via network
- **Git**: For version control

---

## 1. Clone the Repository

```bash
git clone <repository-url>
cd mega_pacific
```

---

## 2. Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your actual local database connection string and secrets:
   ```env
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/megaroof_db"
   JWT_SECRET="your-secret-key-here"
   PORT=5000
   ```

4. **Run Database Migrations & Prisma Client Generation:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed the Database:**
   Creates the initial default Admin account:
   ```bash
   npm run seed
   ```
   *Default Admin credentials:* `admin@megapacific.com` / `megapacific@123` *(or configured via `.env`)*

6. **Start the Backend Server:**
   - **Development mode (with watch):**
     ```bash
     npm run dev
     ```
   - **Normal mode:**
     ```bash
     npm start
     ```
   The backend API will be available at `http://localhost:5000` (and `http://0.0.0.0:5000` for network access).

---

## 3. Frontend Setup

1. **Open a new terminal and navigate to the frontend directory:**
   ```bash
   cd mega_pacific/frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables (Optional):**
   Copy `.env.example` to `.env` if API URL customization is needed:
   ```env
   VITE_API_BASE_URL="http://localhost:5000/api"
   ```

4. **Start the Frontend Development Server:**
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

## Verification

1. Open `http://localhost:5173` in your browser to view the Customer portal.
2. Navigate to `http://localhost:5173/admin-1megapacific/login` to log in as Admin.
3. Check the backend terminal to ensure WebSocket connections (Socket.IO) are active.
