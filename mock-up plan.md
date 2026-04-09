# 🏠 3D Roofing Design and Inventory Management System

## 📌 Project Overview

This project is a **web-based 3D roofing design and inventory management system** that allows users to design roofing structures, estimate materials and costs, and place orders. It also provides an admin panel for managing inventory, products, and customer orders.

The system integrates **3D visualization**, **cost estimation**, and **inventory tracking** into a single platform.

---

## 🎯 Objectives

* Provide an interactive **3D roofing design tool**
* Automate **material and cost estimation**
* Enable **online ordering of roofing materials**
* Manage **inventory and product listings**
* Improve customer experience through visualization

---

## 🧱 System Architecture

### 🔹 Frontend

* React (UI development)
* Vite (build tool)
* Tailwind CSS (styling)
* Three.js (3D rendering)

### 🔹 Backend

* Node.js
* Express.js (API development)

### 🔹 Database

* PostgreSQL
* Prisma ORM

### 🔹 3D Design Pipeline

* Blender (3D modeling)
* Export format: `.glb / .gltf`
* Integrated into frontend using Three.js

---

## ⚙️ Features

### 👤 User Side

* Browse roofing products
* Interactive 3D roof design
* Customize:

  * Roof type (Spandrel, Rib, etc.)
  * Dimensions (length, width, slope)
  * Colors and materials
* Automatic material cost estimation
* Add to cart and place orders

---

### 🧑‍💼 Admin Side

* Dashboard overview
* Product management (Add/Edit/Delete)
* Inventory management
* Order tracking
* Sales monitoring

---

### 🧩 Core Feature: 3D Roofing Designer

* Load 3D roof models
* Real-time customization
* Dynamic resizing
* Live cost computation

---

## 🗂️ Project Structure

```
roofing-system/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── three/
│   │   ├── services/
│   │   └── assets/
│   └── public/models/
│
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── prisma/
│   └── server.js
│
├── database/
└── assets/
```

---

## 🚀 Getting Started

### 📌 Prerequisites

* Node.js (v18+)
* PostgreSQL installed
* Git
* Blender (for 3D models)

---

### 🔧 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### ⚙️ Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

---

### 🗄️ Database Setup

1. Create a PostgreSQL database
2. Update `.env` file:

```
DATABASE_URL="postgresql://user:password@localhost:5432/roofing_db"
```

3. Run migrations:

```bash
npx prisma migrate dev
```

---

## 🎨 3D Model Integration (Blender)

### Workflow:

1. Design models in Blender
2. Export as `.glb`
3. Place in:

```
/frontend/public/models/
```

4. Load using Three.js in the app

---

## 🔄 System Flow

### Data Flow

```
User → Frontend (React) → Backend API → Database → Response → UI
```

### 3D Flow

```
Blender → Export Model → Three.js → Display in Browser
```

---

## ☁️ Deployment

### Frontend

* Deploy using Vercel or Netlify

### Backend

* Deploy using Render or Railway

### Database

* Use Supabase or Neon (PostgreSQL hosting)

---

## 🧪 Future Enhancements

* AR-based roof visualization
* AI-powered material recommendations
* Mobile app version
* Payment gateway integration

---

## 👨‍💻 Developers

* Project Developer: *[Your Name]*

---

## 📄 License

This project is for academic purposes only.

---

## 📌 Notes

This system is designed as a capstone project to demonstrate integration of modern web technologies, 3D visualization, and database management in a real-world application.
