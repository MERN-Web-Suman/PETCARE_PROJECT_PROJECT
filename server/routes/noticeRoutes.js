import express from "express";
import { createNotice, getNotices, getProviderNotices, updateNotice, deleteNotice, toggleLike, rateNotice } from "../controllers/noticeController.js";
import { protect, isProvider } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getNotices);
router.get("/provider", protect, isProvider, getProviderNotices);
router.post("/", protect, isProvider, createNotice);
router.patch("/like/:id", protect, toggleLike);
router.post("/rate/:id", protect, rateNotice);
router.put("/:id", protect, isProvider, updateNotice);
router.delete("/:id", protect, isProvider, deleteNotice);

export default router;
