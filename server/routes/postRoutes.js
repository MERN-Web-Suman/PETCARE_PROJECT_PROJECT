import express from "express";
import multer from "multer";
import path from "path";
import { getPosts, createPost, toggleLike, addComment } from "../controllers/postController.js";

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.get("/", getPosts);
router.post("/", upload.single("image"), createPost);
router.post("/:id/like", toggleLike);
router.post("/:id/comment", addComment);

export default router;
