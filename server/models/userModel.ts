import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
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
      default:
        "https://res.cloudinary.com/dmj3asaf3/image/upload/v1658227110/ioana-ye-auZEhgtzF7o-unsplash_qo2xdh.jpg",
    },
    role: {
      type: String,
      default: "user", // admin
    },
    type: {
      type: String,
      default: "normal",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);
