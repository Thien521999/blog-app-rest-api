"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const __1 = require("..");
const commentModel_1 = __importDefault(require("../models/commentModel"));
const Pagination = (req) => {
    const page = Number(req.query.page) * 1 || 1;
    const limit = Number(req.query.limit) * 1 || 4;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
const commentCtrl = {
    createComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res.status(400).json({ msg: "Invalid Authentication." });
        }
        try {
            const { content, blog_id, blog_user_id } = req.body;
            const newComment = new commentModel_1.default({
                user: req.user._id,
                content,
                blog_id,
                blog_user_id,
            });
            const data = Object.assign(Object.assign({}, newComment._doc), { user: req.user, createdAt: new Date().toISOString() });
            __1.io.to(`${blog_id}`).emit("createComment", data);
            yield newComment.save();
            return res.json(newComment);
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    getComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { limit, skip } = Pagination(req);
        try {
            const data = yield commentModel_1.default.aggregate([
                {
                    // $facet: Đây là một giai đoạn tổng hợp dữ liệu cho phép bạn thực hiện nhiều giai đoạn truy vấn song song và độc lập trên cùng một bộ dữ liệu đầu vào.
                    $facet: {
                        totalData: [
                            {
                                // $match: Lọc bình luận dựa trên blog_id.
                                $match: {
                                    blog_id: new mongoose_1.default.Types.ObjectId(req.params.id),
                                    comment_root: { $exists: false },
                                    reply_user: { $exists: false },
                                },
                            },
                            {
                                $lookup: {
                                    from: "users",
                                    let: { user_id: "$user" },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ["$_id", "$$user_id"],
                                                },
                                            },
                                        },
                                        {
                                            $project: {
                                                name: 1,
                                                avatar: 1,
                                            },
                                        },
                                    ],
                                    as: "user",
                                },
                            },
                            { $unwind: "$user" },
                            {
                                $lookup: {
                                    from: "comments",
                                    let: { cm_id: "$replyCM" },
                                    pipeline: [
                                        {
                                            $match: { $expr: { $in: ["$_id", "$$cm_id"] } },
                                        },
                                        {
                                            $lookup: {
                                                from: "users",
                                                let: { user_id: "$user" },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $eq: ["$_id", "$$user_id"],
                                                            },
                                                        },
                                                    },
                                                    {
                                                        $project: {
                                                            name: 1,
                                                            avatar: 1,
                                                        },
                                                    },
                                                ],
                                                as: "user",
                                            },
                                        },
                                        { $unwind: "$user" },
                                        {
                                            $lookup: {
                                                from: "users",
                                                let: { user_id: "$reply_user" },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: {
                                                                $eq: ["$_id", "$$user_id"],
                                                            },
                                                        },
                                                    },
                                                    {
                                                        $project: {
                                                            name: 1,
                                                            avatar: 1,
                                                        },
                                                    },
                                                ],
                                                as: "reply_user",
                                            },
                                        },
                                        { $unwind: "$reply_user" },
                                    ],
                                    as: "replyCM",
                                },
                            },
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
                                    blog_id: new mongoose_1.default.Types.ObjectId(req.params.id),
                                    comment_root: { $exists: false },
                                    reply_user: { $exists: false },
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
            }
            else {
                total = Math.floor(count / limit) + 1;
            }
            res.json({ comments, total });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    replyComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res.status(400).json({ msg: "Invalid Authentication." });
        }
        try {
            const { content, blog_id, blog_user_id, comment_root, reply_user } = req.body;
            const newComment = new commentModel_1.default({
                user: req.user._id,
                content,
                blog_id,
                blog_user_id,
                comment_root,
                reply_user: reply_user._id,
            });
            yield commentModel_1.default.findOneAndUpdate({ _id: comment_root }, {
                $push: { replyCM: newComment._id },
            });
            const data = Object.assign(Object.assign({}, newComment._doc), { user: req.user, reply_user: reply_user, createdAt: new Date().toISOString() });
            __1.io.to(`${blog_id}`).emit("replyComment", data);
            yield newComment.save();
            return res.json(newComment);
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    updateComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        if (!req.user) {
            return res.status(400).json({ msg: "Invalid Authentication." });
        }
        try {
            const { data } = req.body;
            const comment = yield commentModel_1.default.findOneAndUpdate({
                _id: req.params.id,
                user: req.user._id,
            }, { content: data.content });
            if (!comment) {
                return res.status(400).json({ msg: "Comment does not exits." });
            }
            __1.io.to(`${data.blog_id}`).emit("updateComment", data);
            return res.json({ msg: "Update Success!" });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
    deleteComment: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (!req.user) {
            return res.status(400).json({ msg: "Invalid Authentication." });
        }
        try {
            const comment = yield commentModel_1.default.findOneAndDelete({
                _id: req.params.id,
                $or: [
                    {
                        user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
                    },
                    {
                        blog_user_id: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id,
                    },
                ],
            });
            if (!comment) {
                return res.status(400).json({ msg: "Comment does not exits." });
            }
            if (comment.comment_root) {
                // delete id comment in replyCM
                yield commentModel_1.default.findOneAndUpdate({
                    _id: comment.comment_root,
                }, {
                    $pull: { replyCM: comment._id },
                });
            }
            else {
                // delete all comments in replyCM
                yield commentModel_1.default.deleteMany({ _id: { $in: comment.replyCM } });
            }
            __1.io.to(`${comment.blog_id}`).emit("deleteComment", comment);
            return res.json({ msg: "Delete Success!" });
        }
        catch (err) {
            return res.status(500).json({ msg: err.message });
        }
    }),
};
exports.default = commentCtrl;
