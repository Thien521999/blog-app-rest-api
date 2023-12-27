"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const blogCtrl_1 = __importDefault(require("../controllers/blogCtrl"));
const router = express_1.default.Router();
router.post("/blog", auth_1.auth, blogCtrl_1.default.createBlog);
router.get("/home/blogs", blogCtrl_1.default.getHomeBlogs);
router.get("/blogs/:category_id", blogCtrl_1.default.getBlogByCategoryId);
router.get("/blogs/user/:id", blogCtrl_1.default.getBlogByUser);
// router.get("/blog/:id", blogCtrl.getBlog);
// router.put("/blog/:id", auth, blogCtrl.updateBlog);
router
    .route("/blog/:id")
    .get(blogCtrl_1.default.getBlog)
    .put(auth_1.auth, blogCtrl_1.default.updateBlog)
    .delete(auth_1.auth, blogCtrl_1.default.deleteBlog);
router.get("/search/blogs", blogCtrl_1.default.searchBlogs);
exports.default = router;
