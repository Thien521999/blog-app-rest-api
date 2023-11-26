import { Request, Response } from "express";
import mongoose from "mongoose";
import { IReqAuth } from "../config/interface";
import Comments from "../models/commentModel";

const Pagination = (req: IReqAuth) => {
  const page = Number(req.query.page) * 1 || 1;
  const limit = Number(req.query.limit) * 1 || 4;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const commentCtrl = {
  createComment: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      return res.status(400).json({ msg: "Invalid Authentication." });
    }

    try {
      const { content, blog_id, blog_user_id } = req.body;

      const newComment = new Comments({
        user: req.user._id,
        content,
        blog_id,
        blog_user_id,
      });

      await newComment.save();

      return res.json(newComment);
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
  getComment: async (req: Request, res: Response) => {
    const { limit, skip } = Pagination(req);
    try {
      const data = await Comments.aggregate([
        {
          // $facet: Đây là một giai đoạn tổng hợp dữ liệu cho phép bạn thực hiện nhiều giai đoạn truy vấn song song và độc lập trên cùng một bộ dữ liệu đầu vào.
          $facet: {
            totalData: [
              {
                // $match: Lọc bình luận dựa trên blog_id.
                $match: {
                  blog_id: new mongoose.Types.ObjectId(req.params.id),
                },
              },
              {
                $lookup: {
                  from: "users",
                  localField: "user",
                  foreignField: "_id",
                  as: "user",
                },
              },
              { $unwind: "$user" },
              { $sort: { createdAt: -1 } },
              {
                $skip: skip,
              },
              {
                $limit: limit,
              },
            ],
            totalCount: [
              {
                $match: {
                  blog_id: new mongoose.Types.ObjectId(req.params.id),
                },
              },
              {
                $count: "count",
              },
            ],
          },
        },
        {
          $project: {
            count: {
              $arrayElemAt: ["$totalCount.count", 0],
            },
            totalData: 1,
          },
        },
      ]);

      const comments = data[0].totalData;
      const count = data[0].count;

      let total = 0;

      if (count % limit === 0) {
        total = count / limit;
      } else {
        total = Math.floor(count / limit);
      }

      res.json({ comments, total });
    } catch (err: any) {
      return res.status(500).json({ msg: err.message });
    }
  },
};

export default commentCtrl;
