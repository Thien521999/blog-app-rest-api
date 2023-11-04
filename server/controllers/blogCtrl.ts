import { Response } from "express";
import { IReqAuth } from "../config/interface";
import Blog from "../models/blogModel";

const blogCtrl = {
  createBlog: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      res.status(400).json({
        msg: "Invalid Authentication!",
      });
    }

    try {
      const { user, title, content, description, thumbnail, category } =
        req.body;

      const newBlog = new Blog({
        user: user._id,
        title,
        content,
        description,
        thumbnail,
        category,
      });

      await newBlog.save();
      res.json({ newBlog });
    } catch (err: any) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  },
};

export default blogCtrl;
