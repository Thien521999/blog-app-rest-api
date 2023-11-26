import express from "express";
import commentCtrl from "../controllers/commentCtrl";
import { auth } from "../middleware/auth";

const router = express.Router();

router.post("/comments", auth, commentCtrl.createComment);

router.get("/comments/blog/:id", commentCtrl.getComment);

export default router;
