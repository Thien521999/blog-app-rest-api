"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.generateAccessToken = exports.generateActiveToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateActiveToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, `${process.env.ACTIVE_TOKEN_SECRET}`, {
        expiresIn: "5m", //5 phút
    });
};
exports.generateActiveToken = generateActiveToken;
// Mục đích: Là một chuỗi mã thông báo (token) được cấp cho ứng dụng sau khi người dùng đã đăng nhập thành công hoặc đã cho phép ứng dụng truy cập thông tin của họ.
// Access token có thời gian sống ngắn, thường chỉ vài phút hoặc giờ.
const generateAccessToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, `${process.env.ACCESS_TOKEN_SECRET}`, {
        expiresIn: "15s", //15 phút
    });
};
exports.generateAccessToken = generateAccessToken;
// Mục đích: Refresh token được sử dụng để lấy lại access token mới mỗi khi access token hiện tại hết hạn.
// Thời gian sống: Thời gian sống của refresh token thường dài hơn so với access
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, `${process.env.REFRESH_TOKEN_SECRET}`, {
        expiresIn: "30d", // 30 ngày
    });
};
exports.generateRefreshToken = generateRefreshToken;
