const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend origins
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Make io accessible in controllers
app.set("io", io);

const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/admin/productRoutes");
const dashboardRoutes = require("./routes/admin/dashboardRoutes");
const orderRoutes = require("./routes/admin/orderRoutes");
const userRoutes = require("./routes/admin/userRoutes");
const productTypeRoutes = require("./routes/admin/productTypeRoutes");
const employeeRoutes = require("./routes/admin/employeeRoutes");
const adminReviewRoutes = require("./routes/admin/reviewRoutes");
const employeeDashboardRoutes = require("./routes/employee/dashboardRoutes");
const employeeReviewRoutes = require("./routes/employee/reviewRoutes");
const customerProductRoutes = require("./routes/customer/productRoutes");
const customerOrderRoutes = require("./routes/customer/orderRoutes");
const customerReviewRoutes = require("./routes/customer/reviewRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/product-types", productTypeRoutes);
app.use("/api/admin/employees", employeeRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/employee/dashboard", employeeDashboardRoutes);
app.use("/api/employee/reviews", employeeReviewRoutes);

app.use("/api/customer/products", customerProductRoutes);
app.use("/api/customer/orders", customerOrderRoutes);
app.use("/api/customer/reviews", customerReviewRoutes);
app.use("/api/inquiries", inquiryRoutes);

app.get("/", (req, res) => {
  res.send("Mega Pacific Backend is running!");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Start Delivery Date Extension Scheduler
const { initDeliveryScheduler } = require("./services/deliveryScheduler");
initDeliveryScheduler();

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
});
