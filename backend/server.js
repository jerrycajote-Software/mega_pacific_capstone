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
const salesRoutes = require("./routes/admin/salesRoutes");
const adminSettingRoutes = require("./routes/admin/settingRoutes");
const adminReviewRoutes = require("./routes/admin/reviewRoutes");
const salesDashboardRoutes = require("./routes/sales/dashboardRoutes");
const salesReviewRoutes = require("./routes/sales/reviewRoutes");
const salesOrderRoutes = require("./routes/sales/orderRoutes");
const ownerRoutes = require("./routes/owner/ownerRoutes");
const customerProductRoutes = require("./routes/customer/productRoutes");
const customerOrderRoutes = require("./routes/customer/orderRoutes");
const customerReviewRoutes = require("./routes/customer/reviewRoutes");
const customerCartRoutes = require("./routes/customer/cartRoutes");
const inquiryRoutes = require("./routes/inquiryRoutes");
const systemRoutes = require("./routes/systemRoutes");
const superadminRoutes = require("./routes/superadminRoutes");
const financeRoutes = require("./routes/financeRoutes");
const logisticRoutes = require("./routes/logisticRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/owner", ownerRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/product-types", productTypeRoutes);
app.use("/api/admin/saless", salesRoutes);
app.use("/api/admin/settings", adminSettingRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/sales/dashboard", salesDashboardRoutes);
app.use("/api/sales/reviews", salesReviewRoutes);
app.use("/api/sales/orders", salesOrderRoutes);

app.use("/api/customer/products", customerProductRoutes);
app.use("/api/customer/orders", customerOrderRoutes);
app.use("/api/customer/reviews", customerReviewRoutes);
app.use("/api/customer/cart", customerCartRoutes);
app.use("/api/inquiries", inquiryRoutes);

app.use("/api/system", systemRoutes);
app.use("/api/superadmin", superadminRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/logistic", logisticRoutes);

app.get("/", (req, res) => {
  res.send("Mega Pacific Backend is running!");
});

const socketTrackingService = require("./services/socketTrackingService");

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  
  // Track active user if provided in auth payload
  const user = socket.handshake.auth?.user;
  if (user && user.id) {
    socketTrackingService.addUser(socket.id, user);
    io.to("superadmin").emit("active_users_update", socketTrackingService.getActiveUsers());
  }

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    const removedUserId = socketTrackingService.removeUser(socket.id);
    if (removedUserId) {
      io.to("superadmin").emit("active_users_update", socketTrackingService.getActiveUsers());
    }
  });
});

// Start Delivery Date Extension Scheduler
const { initDeliveryScheduler } = require("./services/deliveryScheduler");
initDeliveryScheduler();

// Start Automated Order Status Progression Scheduler
const { initOrderStatusScheduler } = require("./services/orderStatusScheduler");
initOrderStatusScheduler(io);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Network: http://0.0.0.0:${PORT}`);
});
