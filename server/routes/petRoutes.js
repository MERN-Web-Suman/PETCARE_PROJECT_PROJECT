import express from "express";
import multer from "multer";
import path from "path";
import { addPet, getPets, getPetById, updatePet, deletePet, updatePetStatus } from "../controllers/petController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.post("/", protect, upload.single("image"), addPet);
router.get("/", getPets);
router.get("/:id", getPetById);
router.put("/:id", protect, upload.single("image"), updatePet);
router.put("/:id/status", protect, updatePetStatus);
router.delete("/:id", protect, deletePet);

export default router;
