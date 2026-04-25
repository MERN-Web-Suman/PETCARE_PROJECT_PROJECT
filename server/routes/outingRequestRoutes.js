import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { 
  createOutingRequest, 
  getOwnerOutingRequests, 
  getRequesterOutingRequests,
  updateOutingRequestStatus 
} from "../controllers/outingRequestController.js";

const router = express.Router();

router.post("/", protect, createOutingRequest);
router.get("/owner", protect, getOwnerOutingRequests);
router.get("/my-requests", protect, getRequesterOutingRequests);
router.put("/:id/status", protect, updateOutingRequestStatus);

export default router;
