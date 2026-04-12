const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/admin/productRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/admin/products", productRoutes);

app.get("/", (req, res) => {
  res.send("Mega Pacific Backend is running!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
