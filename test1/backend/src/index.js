import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB  from "./lib/dbconnect.js";
import webhooksRoute from "./routes/webhooks.route.js";
// import reviewRoutes from "./routes/review.js";
// import authRoutes from "./routes/auth.js";
// import protectedRoutes from "./routes/protected.js";

dotenv.config();

const app = express();
app.use('/api/webhooks', webhooksRoute);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 5000;

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    endpoints: {
      // auth: "/api/auth",
      // protected: "/api/protected",
    }
  });
});

// app.use("/api/auth", authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!"
  });
});

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

app.listen(PORT, () => {
  // Connect to MongoDB
  connectDB();
  console.log(`Server running on port ${PORT}`);
});