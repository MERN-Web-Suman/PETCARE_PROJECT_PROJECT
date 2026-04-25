import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  createPetAppointment, 
  getOwnerPetAppointments, 
  getRequesterPetAppointments,
  updatePetAppointmentStatus 
} from "../controllers/petAppointmentController.js";

const router = express.Router();

router.post("/", protect, createPetAppointment);
router.get("/owner", protect, getOwnerPetAppointments);
router.get("/my-requests", protect, getRequesterPetAppointments);
router.put("/:id/status", protect, updatePetAppointmentStatus);

export default router;
