"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const categoryModel_1 = __importDefault(require("../models/categoryModel"));
const blogModel_1 = __importDefault(require("../models/blogModel"));
const categoryCtrl = {
    createCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (!req.user)
            res.status(400).json({
                msg: "Invalid Authentication!",
            });
        if (((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role) !== "admin")
            return res.status(400).json({ msg: "Invalid Authentication!" });
        try {
            const { name } = req.body;
            yield categoryModel_1.default.findOne({ name });
            const newCategory = new categoryModel_1.default({ name });
            yield newCategory.save();
            res.json({ newCategory });
        }
        catch (err) {
            let errMsg;
            if ((err === null || err === void 0 ? void 0 : err.code) === 11000) {
                errMsg = Object.values(err === null || err === void 0 ? void 0 : err.keyValue)[0] + " already exists.";
            }
            else {
                let name = Object.keys(err === null || err === void 0 ? void 0 : err.errors)[0];
                errMsg = (_b = err === null || err === void 0 ? void 0 : err.errors[`${name}`]) === null || _b === void 0 ? void 0 : _b.message;
            }
            return res.status(500).json({
                msg: errMsg,
            });
        }
    }),
    getCategories: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const categories = yield categoryModel_1.default.find().sort("-createdAt");
            return res.status(200).json({
                categories,
            });
        }
        catch (err) {
            return res.status(500).json({
                msg: err.message,
            });
        }
    }),
    updateCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _c;
        if (!req.user)
            res.status(400).json({
                msg: "Invalid Authentication!",
            });
        if (((_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.role) !== "admin")
            return res.status(400).json({ msg: "Invalid Authentication!" });
        try {
            yield categoryModel_1.default.findOneAndUpdate({
                _id: req.params.id,
            }, {
                name: req.body.name.toLowerCase(),
            });
            return res.status(200).json({ msg: "Update Success!" });
        }
        catch (err) {
            return res.status(500).json({
                msg: err.message,
            });
        }
    }),
    deleteCategory: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _d;
        if (!req.user)
            res.status(400).json({
                msg: "Invalid Authentication!",
            });
        if (((_d = req === null || req === void 0 ? void 0 : req.user) === null || _d === void 0 ? void 0 : _d.role) !== "admin")
            return res.status(400).json({ msg: "Invalid Authentication!" });
        try {
            const blog = yield blogModel_1.default.findOne({ category: req.params.id });
            if (blog)
                return res.status(400).json({
                    msg: "Can not delete! In this category also exist blogs.",
                });
            const category = yield categoryModel_1.default.findByIdAndDelete(req.params.id);
            if (!category)
                return res.status(400).json({ msg: "Category does not exists!" });
            return res.status(200).json({ msg: "Delete Success!" });
        }
        catch (err) {
            return res.status(500).json({
                msg: err.message,
            });
        }
    }),
};
exports.default = categoryCtrl;
