import mongoose from "mongoose";

const URI = process.env.MONGODB_URL || "";

mongoose
  .connect(URI)
  .then(() => console.log("MongoDB Connected!"))
  .catch((e) => console.log(e));
