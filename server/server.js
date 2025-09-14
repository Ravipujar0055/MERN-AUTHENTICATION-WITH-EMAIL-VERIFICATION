import express from "express";
import cors from "cors";
import "dotenv/config.js";
import cookieParser from "cookie-parser";
import connectdb from "./config/mongodb.js";
import authroutes from "./routes/authroutes.js"; // ✅ default import
import userrouter from "./routes/userrouter.js";

const app = express();
const port = process.env.PORT || 4000;

// Connect MongoDB
connectdb();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173", // frontend
  credentials: true
}));

// Test route
app.get("/", (req, res) => {
  res.send("API is Working fine");
});

// Auth routes
app.use("/api/auth", authroutes);
//user routes
app.use("/api/user", userrouter);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
