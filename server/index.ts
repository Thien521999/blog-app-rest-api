import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import routes from "./routes/index";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import { SocketServer } from "./config/socket";
import path from "path";
// import { errorHandlingMiddleware } from "./middleware/errorHandlingMiddleware";
dotenv.config();

// Middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false })); // Sử dụng middleware để xử lý dữ liệu URL-encoded từ form
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());

// morgan:  là một công cụ ghi log tuyệt vời mà bất kỳ ai làm việc với server HTTP trong Node.js nên học cách sử dụng. morgan là một phần mềm trung gian cho phép ta dễ dàng ghi lại các yêu cầu, lỗi và hơn thế nữa vào console . Nó dễ sử dụng, nhưng vẫn mạnh mẽ và có thể tùy chỉnh.
// cookie-parser:  được sử dụng để phân tích cú pháp cookie
// Middleware xử lý loi tap trung. trong day se su ly nhieu thang nhu xu ly logic, push noification, ...
// app.use(errorHandlingMiddleware);

// Socket.io
const server = createServer(app);
const options: any = {
  cors: true,
  origins: "http://192.168.1.107:5000",
};
export const io = new Server(server, options);

// Routes
app.use("/api", routes);
// app.use("/api", routes.authRouter);
// app.use("/api", routes.userRouter);
// app.use("/api", routes.categoryRouter);
// app.use("/api", routes.blogRouter);
// app.use("/api", routes.commentRouter);

io.on("connection", (socket: Socket) => {
  SocketServer(socket);
});

// Database
import "./config/database";

// Production Deploy
// if (process.env.NODE_ENV === "production") {
//   app.use(express.static("index.html"));
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../index.html"));
//   });
// }

// test mt đang chay
// NODE_ENV: bien mt co san trong nodeJs
// let a = process.env.NODE_ENV;
// let b = app.get("env");
// console.log({ a, b });

console.log("process.env.NODE_ENV", process.env.NODE_ENV);
// server listening
if (process.env.NODE_ENV === "production") {
  console.log("tren");
  // moi truong production (cu the la dang support Render.com)
  const PORT = process.env.PORT;
  server.listen(PORT, () => {
    console.log("Production, Server is running on port", PORT);
  });
} else {
  console.log("duoi");
  // moi truong local dev
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log("Dev, Server is running on port", PORT);
  });
}
