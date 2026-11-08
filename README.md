# Mega Pacific Roofing System

A full-stack web application for managing roofing product catalogs, variant pricing, inventory audit logging, customer ordering, reviews, and real-time customer service inquiries.

---

## 🚀 Quick Links & Documentation

- [Project Overview](docs/01_Project/Overview.md)
- [System Architecture](docs/02_Architecture/System_Architecture.md)
- [Local Development Setup](docs/03_Development/Setup.md)
- [Documentation & Second Brain Workflow](docs/03_Development/Documentation_Workflow.md)
- [API Reference](docs/04_API/Authentication.md)
- [Database Schema & ERD](docs/05_Database/ERD.md)
- [UI Specifications](docs/06_UI/Admin.md)
- [Feature Status Tracker](docs/01_Project/Features.md)

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Material-UI, Tailwind CSS, Lucide React, Socket.IO Client, Three.js
- **Backend**: Node.js, Express.js (v5), Prisma ORM (v7), Socket.IO, Nodemailer, bcryptjs, JWT
- **Database**: PostgreSQL

---

## 💻 Getting Started

### Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

For detailed instructions, see the [Local Setup Guide](docs/03_Development/Setup.md).

---

## 📜 License

This project is developed as a Capstone Project for Mega Pacific. All rights reserved.
