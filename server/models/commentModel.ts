import mongoose from "mongoose";
import { IComment } from "../config/interface";

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    blog_id: mongoose.Types.ObjectId,
    blog_user_id: mongoose.Types.ObjectId,
    content: { type: String, required: true },
    replyCM: [
      {
        type: mongoose.Types.ObjectId,
        ref: "comment",
      },
    ],
    replyUser: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IComment>("comment", commentSchema);
