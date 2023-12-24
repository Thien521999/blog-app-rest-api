import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { IReqAuth } from "../config/interface";
import Users from "../models/userModel";

const userCtrl = {
  updateUser: async (req: IReqAuth, res: Response) => {
    if (!req.user)
      return res.status(400).json({ msg: "Invalid Authentication" });

    try {
      const { avatar, name } = req.body;

      const user = await Users.findOneAndUpdate(
        { _id: req.user._id },
        {
          avatar,
          name,
        }
      );

      res.json({ msg: "Update success", user });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
  resetPassword: async (req: IReqAuth, res: Response) => {
    if (!req.user)
      return res.status(400).json({ msg: "Invalid Authentication" });

    console.log("req.user", req.user);

    if (req.user.type !== "register")
      return res.status(400).json({
        msg: `Quick login account with ${req.user.type} can't use this function`,
      });

    try {
      const { password } = req.body;
      const passwordHash = await bcrypt.hash(password, 12);
      const user = await Users.findOneAndUpdate(
        { _id: req.user._id },
        {
          password: passwordHash,
        }
      );
      res.json({ msg: "Reset password success!" });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getUser: async (req: Request, res: Response) => {
    try {
      const user = await Users.findById(req.params.id).select("-password");
      res.json(user);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default userCtrl;
