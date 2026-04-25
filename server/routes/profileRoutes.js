import express from "express";
import { 
    getProfileStats, 
    getRecentActivity, 
    toggleSavePet, 
    getSavedPets 
} from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", protect, getProfileStats);
router.get("/activity", protect, getRecentActivity);
router.get("/saved", protect, getSavedPets);
router.post("/save/:id", protect, toggleSavePet);

export default router;
