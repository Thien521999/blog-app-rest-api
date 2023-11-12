import express from "express";
import categoryCtrl from "../controllers/categoryCtrl";
import { auth } from "../middleware/auth";
const router = express.Router();

router.post("/category", auth, categoryCtrl.createCategory);
router.get("/category", categoryCtrl.getCategories);
router.patch("/category/:id", auth, categoryCtrl.updateCategory);
router.delete("/category/:id", auth, categoryCtrl.deleteCategory);

export default router;
