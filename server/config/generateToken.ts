import jwt from "jsonwebtoken";

export const generateActiveToken = (payload: object) => {
  return jwt.sign(payload, `${process.env.ACTIVE_TOKEN_SECRET}`, {
    expiresIn: "5m", //5 phút
  });
};

// Mục đích: Là một chuỗi mã thông báo (token) được cấp cho ứng dụng sau khi người dùng đã đăng nhập thành công hoặc đã cho phép ứng dụng truy cập thông tin của họ.
// Access token có thời gian sống ngắn, thường chỉ vài phút hoặc giờ.
export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, `${process.env.ACCESS_TOKEN_SECRET}`, {
    expiresIn: "15m", //15 phút
  });
};

// Mục đích: Refresh token được sử dụng để lấy lại access token mới mỗi khi access token hiện tại hết hạn.
// Thời gian sống: Thời gian sống của refresh token thường dài hơn so với access
export const generateRefreshToken = (payload: object) => {
  return jwt.sign(payload, `${process.env.REFRESH_TOKEN_SECRET}`, {
    expiresIn: "30d", // 30 ngày
  });
};
