import express from "express";
import { 
  createClinic, 
  getProviderClinics, 
  updateClinic, 
  deleteClinic, 
  getAllClinics,
  getClinicById
} from "../controllers/clinicController.js";
import { protect, isProvider } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllClinics);
router.get("/provider", protect, isProvider, getProviderClinics);
router.post("/", protect, isProvider, createClinic);
router.put("/:id", protect, isProvider, updateClinic);
router.get("/:id", getClinicById);
router.delete("/:id", protect, isProvider, deleteClinic);

export default router;
