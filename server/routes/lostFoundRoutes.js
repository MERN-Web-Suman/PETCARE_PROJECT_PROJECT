import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { createLostFound, getLostFounds, updateLostFound, deleteLostFound } from "../controllers/lostFoundController.js";

const router = express.Router();
router.post("/", protect, upload.single("image"), createLostFound);
router.get("/", getLostFounds);
router.put("/:id", protect, upload.single("image"), updateLostFound);
router.delete("/:id", protect, deleteLostFound);

export default router;
