import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import routes from "./routes/index";
import { errorHandlingMiddleware } from "./middleware/errorHandlingMiddleware";
dotenv.config();

// Middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());

// Middleware xử lý loi tap trung. trong day se su ly nhieu thang nhu xu ly logic, push noification, ...
app.use(errorHandlingMiddleware);

// Routes
app.use("/api", routes.authRouter);
app.use("/api", routes.userRouter);
app.use("/api", routes.categoryRouter);
app.use("/api", routes.blogRouter);

// Database
import "./config/database";

// server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});
