import express from "express";
import { auth } from "../middleware/auth";
import blogCtrl from "../controllers/blogCtrl";

const router = express.Router();

router.post("/blog", auth, blogCtrl.createBlog);
router.get("/home/blogs", blogCtrl.getHomeBlogs);
router.get("/blogs/:category_id", blogCtrl.getBlogByCategoryId);
router.get("/blogs/user/:id", blogCtrl.getBlogByUser);
// router.get("/blog/:id", blogCtrl.getBlog);
// router.put("/blog/:id", auth, blogCtrl.updateBlog);
router
  .route("/blog/:id")
  .get(blogCtrl.getBlog)
  .put(auth, blogCtrl.updateBlog)
  .delete(auth, blogCtrl.deleteBlog);

router.get("/search/blogs", blogCtrl.searchBlogs);

export default router;
