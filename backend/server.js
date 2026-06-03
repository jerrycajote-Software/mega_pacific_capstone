const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
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
const customerProductRoutes = require("./routes/customer/productRoutes");
const customerOrderRoutes = require("./routes/customer/orderRoutes");
const customerReviewRoutes = require("./routes/customer/reviewRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/admin/products", productRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/admin/orders", orderRoutes);
app.use("/api/admin/users", userRoutes);
app.use("/api/admin/product-types", productTypeRoutes);

app.use("/api/customer/products", customerProductRoutes);
app.use("/api/customer/orders", customerOrderRoutes);
app.use("/api/customer/reviews", customerReviewRoutes);

app.get("/", (req, res) => {
  res.send("Mega Pacific Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
