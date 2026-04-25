import express from "express";
import { addPetForAdoption, getAdoptions, updateAdoption } from "../controllers/adoptionController.js";
import { protect, isProvider } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/", addPetForAdoption);
router.get("/", getAdoptions);
router.put("/:id", protect, isProvider, updateAdoption);

export default router;
