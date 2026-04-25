import express from "express";
import { protect, isProvider } from "../middleware/authMiddleware.js";
import {
  getProviderAppointments,
  updateAppointmentStatus,
  replyToAppointment,
} from "../controllers/providerAppointmentController.js";
import { getProviderStats, getRecentActivity } from "../controllers/providerStatsController.js";
import { getProviderAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/appointments", protect, isProvider, getProviderAppointments);
router.put("/appointments/:id", protect, isProvider, updateAppointmentStatus);
router.put("/appointments/:id/reply", protect, isProvider, replyToAppointment);
router.get("/stats", protect, isProvider, getProviderStats);
router.get("/activity", protect, isProvider, getRecentActivity);
router.get("/analytics", protect, isProvider, getProviderAnalytics);

export default router;
