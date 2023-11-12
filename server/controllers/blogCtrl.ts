import { Request, Response } from "express";
import { IReqAuth } from "../config/interface";
import Blog from "../models/blogModel";
import mongoose from "mongoose";

const Pagination = (req: IReqAuth) => {
  const page = Number(req.query.page) * 1 || 1;
  const limit = Number(req.query.limit) * 1 || 4;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

const blogCtrl = {
  createBlog: async (req: IReqAuth, res: Response) => {
    if (!req.user) {
      res.status(400).json({
        msg: "Invalid Authentication!",
      });
    }

    try {
      const { title, content, description, thumbnail, category } = req.body;
      const newBlog = new Blog({
        user: req?.user?._id,
        title: title.toLowerCase(),
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
  getHomeBlogs: async (req: Request, res: Response) => {
    try {
      const blogs = await Blog.aggregate([
        //Đây là một phần của pipeline trong truy vấn aggregate.
        //Bạn đang thực hiện một $lookup để nối dữ liệu từ collection "users" vào collection "Blog".
        //User
        {
          $lookup: {
            from: "users", //Đây là tên của collection mà bạn muốn nối vào "Blog"
            let: { user_id: "$user" }, //Điều này định nghĩa biến user_id và gán giá trị từ trường "user" trong collection "Blog".
            pipeline: [
              {
                $match: { $expr: { $eq: ["$_id", "$$user_id"] } }, //so sánh "_id" trong collection "users" với $$user_id (biến đã được định nghĩa trước đó) trong collection "Blog".
              },
              {
                $project: { password: 0 }, // loại bỏ trường "password" khi dữ liệu đã được nối vào
              },
            ],
            as: "user", //Kết quả của $lookup sẽ được lưu vào một trường mới có tên là "user" trong collection "Blog".
          },
        },
        // array => object
        {
          $unwind: "$user", // chuyển array về object
        },
        // Category
        {
          $lookup: {
            from: "categories",
            localField: "category", // Trong trường hợp này, bạn muốn sử dụng trường "category" trong collection "Blog" để so sánh với trường "_id" trong collection "categories".
            foreignField: "_id",
            as: "category", //Kết quả của $lookup sẽ được lưu vào một trường mới có tên là "category" trong collection "Blog".
          },
        },
        // array => object
        {
          $unwind: "$category",
        },
        // Sorting
        {
          $sort: { createdAt: -1 }, //giá trị -1 cho trường này, nó sẽ sắp xếp theo thứ tự giảm dần (tức là từ lớn đến nhỏ), nghĩa là bản ghi mới nhất sẽ được đặt lên trên cùng.
        }, // 1: tăng dần
        // Group by category
        {
          // Kết quả của phần $group này là tạo ra các nhóm dữ liệu dựa trên giá trị của trường "category._id" trong mỗi bản ghi. Mỗi nhóm sẽ bao gồm các trường _id, name, blogs, và count. name chứa giá trị đầu tiên của trường "category.name" trong mỗi nhóm, blogs chứa một mảng các bản ghi trong nhóm đó, và count chứa số lượng bản ghi trong mỗi nhóm.
          $group: {
            // Đây là giai đoạn trong truy vấn aggregate của MongoDB để nhóm và tổng hợp dữ liệu.
            _id: "$category._id", // Đây là trường được sử dụng để nhóm dữ liệu. Bạn đang nhóm các bản ghi dựa trên giá trị của trường "category._id". Mỗi giá trị duy nhất của trường này sẽ tạo ra một nhóm riêng biệt.
            name: { $first: "$category.name" }, // Bạn đang sử dụng phép tổng hợp $first để lấy giá trị đầu tiên của trường "category.name" trong mỗi nhóm. Nó sẽ trả về giá trị đầu tiền của "category.name" trong mỗi nhóm dữ liệu.
            blogs: {
              $push: "$$ROOT", // Bạn đang sử dụng phép tổng hợp $push để tạo một mảng chứa tất cả các bản ghi trong mỗi nhóm. $$ROOT đại diện cho toàn bộ bản ghi trong nhóm hiện tại. Vì vậy, $push: "$$ROOT" tạo ra một mảng gồm tất cả các bản ghi trong nhóm.
            },
            count: { $sum: 1 }, // Dòng này sử dụng phép tổng hợp $sum để tính tổng số bản ghi trong mỗi nhóm. 1 trong $sum: 1 đại diện cho việc tăng giá trị của biểu thức tổng hợp lên 1 cho mỗi bản ghi trong nhóm. Nó tính tổng số lượng bản ghi trong mỗi nhóm.
          },
        },
        // // Pagination for blogs
        {
          $project: {
            blogs: {
              $slice: ["$blogs", 0, 4], // Bạn đang sử dụng phép biến đổi $slice để chọn một phần của mảng "blogs". Phép biến đổi này lấy một mảng và trả về một phần của mảng đó. Trong trường hợp này, bạn đang lấy từ vị trí 0 đến vị trí 4 của mảng "blogs". Điều này có nghĩa là bạn chỉ chọn bốn phần tử đầu tiên của mảng "blogs".
            },
            count: 1,
            name: 1,
          },
        },
      ]);

      res.status(200).json(blogs);
    } catch (err: any) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  },
  getBlogByCategoryId: async (req: Request, res: Response) => {
    const { page, limit, skip } = Pagination(req);

    try {
      // console.log("---req----", req);
      const categoryId = req.params.category_id;
      console.log("---categoryId--------", categoryId);

      if (typeof categoryId !== "string") {
        throw new Error("Category ID must be a string");
      }
      const Data = await Blog.aggregate([
        {
          $facet: {
            totalData: [
              {
                $match: {
                  category: new mongoose.Types.ObjectId(categoryId),
                },
              },
              {
                $lookup: {
                  from: "categories",
                  localField: "category", // Trong trường hợp này, bạn muốn sử dụng trường "category" trong collection "Blog" để so sánh với trường "_id" trong collection "categories".
                  foreignField: "_id",
                  as: "category", //Kết quả của $lookup sẽ được lưu vào một trường mới có tên là "category" trong collection "Blog".
                },
              },
              // array => object
              {
                $unwind: "$category",
              },
              {
                $sort: { createdAt: -1 }, //giá trị -1 cho trường này, nó sẽ sắp xếp theo thứ tự giảm dần (tức là từ lớn đến nhỏ), nghĩa là bản ghi mới nhất sẽ được đặt lên trên cùng.
              }, // 1: tăng dần
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
                  category: new mongoose.Types.ObjectId(categoryId),
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

      console.log("Data", Data);

      const blogs = Data[0].totalData;
      const count = Data[0].count;

      // Pagination
      let total = 0;

      if (count % limit === 0) {
        total = count / limit;
      } else {
        total = Math.floor(count / limit) + 1;
      }

      res.status(200).json({ blogs, total });
    } catch (err: any) {
      return res.status(500).json({
        msg: err.message,
      });
    }
  },
};

export default blogCtrl;
