import { Request, Response } from "express";
import { IReqAuth } from "../config/interface";
import Categories from "../models/categoryModel";

const categoryCtrl = {
  createCategory: async (req: IReqAuth, res: Response) => {
    if (!req.user)
      res.status(400).json({
        msg: "Invalid Authentication!",
      });

    if (req?.user?.role !== "admin")
      return res.status(400).json({ msg: "Invalid Authentication!" });

    try {
      const { name } = req.body;

      await Categories.findOne({ name });

      const newCategory = new Categories({ name });
      await newCategory.save();
      res.json({ newCategory });
    } catch (err: any) {
      let errMsg;
      if (err?.code === 11000) {
        errMsg = Object.values(err?.keyValue)[0] + " already exists.";
      } else {
        let name = Object.keys(err?.errors)[0];
        errMsg = err?.errors[`${name}`]?.message;
      }

      return res.status(500).json({
        msg: errMsg,
      });
    }
  },
  getCategories: async (req: Request, res: Response) => {
    try {
      const categories = await Categories.find().sort("-createdAt");
      return res.status(200).json({
        categories,
      });
    } catch (err: any) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  },
  updateCategory: async (req: IReqAuth, res: Response) => {
    if (!req.user)
      res.status(400).json({
        msg: "Invalid Authentication!",
      });

    if (req?.user?.role !== "admin")
      return res.status(400).json({ msg: "Invalid Authentication!" });

    try {
      await Categories.findOneAndUpdate(
        {
          _id: req.params.id,
        },
        {
          name: req.body.name.toLowerCase(),
        }
      );

      return res.status(200).json({ msg: "Update Success!" });
    } catch (err: any) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  },
  deleteCategory: async (req: IReqAuth, res: Response) => {
    if (!req.user)
      res.status(400).json({
        msg: "Invalid Authentication!",
      });

    if (req?.user?.role !== "admin")
      return res.status(400).json({ msg: "Invalid Authentication!" });

    try {
      await Categories.findByIdAndDelete(req.params.id);

      return res.status(200).json({ msg: "Delete Success!" });
    } catch (err: any) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  },
};

export default categoryCtrl;