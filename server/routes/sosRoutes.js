import express from "express";
import { sendSOS, getSOSAlerts, getSOSById, deleteSOS } from "../controllers/sosController.js";

const router = express.Router();

router.post("/", sendSOS);
router.get("/", getSOSAlerts);
router.get("/:id", getSOSById);
router.delete("/:id", deleteSOS);

export default router;
