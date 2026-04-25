import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import { setIO } from "./utils/socket.js";
import connectDB from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from "./routes/authRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import adoptionRoutes from "./routes/adoptionRoutes.js";
import sosRoutes from "./routes/sosRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import lostFoundRoutes from "./routes/lostFoundRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import clinicRoutes from "./routes/clinicRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import petAppointmentRoutes from "./routes/petAppointmentRoutes.js";
import outingRequestRoutes from "./routes/outingRequestRoutes.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// expose io instance to controllers via helper
setIO(io);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/ping", (req, res) => res.send("pong"));

// Real-time Socket.io events
let activeUsers = [];

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);
  activeUsers.push(socket.id);

  // SOS Emergency Alert
  socket.on("sos-alert", (data) => {
    console.log("SOS Alert received:", data);
    io.emit("receive-sos", {
      ...data,
      timestamp: new Date(),
      socketId: socket.id
    });
  });

  // User room management for private notifications & chat
  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`📡 User ${userId} joined their private notification room`);
  });

  // Legacy event name for backward compatibility (in case some frontends still use it)
  socket.on("join-chat", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`📡 User ${userId} joined chat room (legacy join-chat)`);
  });

  socket.on("send-message", ({ to, message, from }) => {
    io.to(`user-${to}`).emit("receive-message", {
      message,
      from,
      timestamp: new Date()
    });
  });

  // Appointment updates
  socket.on("appointment-update", (data) => {
    io.emit("appointment-changed", data);
  });

  // Pet adoption notifications
  socket.on("adoption-notification", (data) => {
    io.emit("adoption-update", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
    activeUsers = activeUsers.filter(id => id !== socket.id);
  });
});

// REST API routes
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/sos", sosRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/products", productRoutes);
app.use("/api/lostfound", lostFoundRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/clinics", clinicRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/pet-appointments", petAppointmentRoutes);
app.use("/api/outing-requests", outingRequestRoutes);

// Global error handler — catches any unhandled errors from routes/controllers
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message || err);
  res.status(err.status || 500).json({ msg: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please stop the process using the port or set a different PORT in your .env`);
    process.exit(1);
  }
  console.error('Server error:', err);
});
