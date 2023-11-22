"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: [true, "Please add your name"],
        trim: true,
        maxLength: [20, "Your name is up to chars long."],
    },
    account: {
        type: String,
        required: [true, "Please add your email"],
        trim: true,
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please add your password"],
    },
    avatar: {
        type: String,
        default: "https://res.cloudinary.com/dmj3asaf3/image/upload/v1658227110/ioana-ye-auZEhgtzF7o-unsplash_qo2xdh.jpg",
    },
    role: {
        type: String,
        default: "user", // admin
    },
    type: {
        type: String,
        default: "register",
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model("User", userSchema);
