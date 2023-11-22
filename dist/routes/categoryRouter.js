"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const categoryCtrl_1 = __importDefault(require("../controllers/categoryCtrl"));
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post("/category", auth_1.auth, categoryCtrl_1.default.createCategory);
router.get("/category", categoryCtrl_1.default.getCategories);
router.patch("/category/:id", auth_1.auth, categoryCtrl_1.default.updateCategory);
router.delete("/category/:id", auth_1.auth, categoryCtrl_1.default.deleteCategory);
exports.default = router;
