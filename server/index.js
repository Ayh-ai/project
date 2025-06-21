import cors from "cors";
import express from "express";
import authRoutes from "./auth.js"; // Make sure this file exports a router
import uploadRoutes from "./upload.js";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api", authRoutes);
app.use("/api", uploadRoutes);

// Default root route to avoid "Cannot GET /"
app.get("/", (req, res) => {
  res.send("Express backend is running");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
