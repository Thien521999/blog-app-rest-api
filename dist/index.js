"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("./routes/index"));
const node_http_1 = require("node:http");
const socket_io_1 = require("socket.io");
const socket_1 = require("./config/socket");
// import { errorHandlingMiddleware } from "./middleware/errorHandlingMiddleware";
dotenv_1.default.config();
// Middleware
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false })); // Sử dụng middleware để xử lý dữ liệu URL-encoded từ form
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)("dev"));
app.use((0, cookie_parser_1.default)());
// morgan:  là một công cụ ghi log tuyệt vời mà bất kỳ ai làm việc với server HTTP trong Node.js nên học cách sử dụng. morgan là một phần mềm trung gian cho phép ta dễ dàng ghi lại các yêu cầu, lỗi và hơn thế nữa vào console . Nó dễ sử dụng, nhưng vẫn mạnh mẽ và có thể tùy chỉnh.
// cookie-parser:  được sử dụng để phân tích cú pháp cookie
// Middleware xử lý loi tap trung. trong day se su ly nhieu thang nhu xu ly logic, push noification, ...
// app.use(errorHandlingMiddleware);
// Socket.io
const server = (0, node_http_1.createServer)(app);
const options = {
  cors: true,
  origins: "http://192.168.1.107:5000",
};
exports.io = new socket_io_1.Server(server, options);
// Routes
app.use("/api", index_1.default);
// app.use("/api", routes.authRouter);
// app.use("/api", routes.userRouter);
// app.use("/api", routes.categoryRouter);
// app.use("/api", routes.blogRouter);
// app.use("/api", routes.commentRouter);
exports.io.on("connection", (socket) => {
  (0, socket_1.SocketServer)(socket);
});
// Database
require("./config/database");

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

// server listening
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
