import express from "express";
import { auth } from "../middleware/auth";
import blogCtrl from "../controllers/blogCtrl";

const router = express.Router();

router.post("/blog", auth, blogCtrl.createBlog);
router.get("/home/blogs", blogCtrl.getHomeBlogs);
router.get("/blogs/:category_id", blogCtrl.getBlogByCategoryId);
router.get("/blogs/user/:id", blogCtrl.getBlogByUser);
router.get("/blog/:id", blogCtrl.getBlog);

export default router;
