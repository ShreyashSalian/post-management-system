import express from "express";
import {
  asyncHandler,
  CustomRequestWithFiles,
  sendError,
  sendSuccess,
} from "../utils/function";
import { CONSTANT_LIST } from "../constants/global.constants";
import { uploadFilesToCloudinary } from "../utils/cloudinaryMultipleFileUpload";
import { PostModel } from "../models/post.model";
import { SearchBody } from "../helpers/user.helper";
import mongoose from "mongoose";
import { CommentModel } from "../models/comment.model";
import { ReactionModel } from "../models/reaction.model";
import cloudinary from "../config/cloudinary.config";

/* =====================================================
  POST => ALLOW USER TO ADD POST
===================================================== */
export const addPost = asyncHandler(
  async (
    req: express.Request<{}, {}, { caption: string }>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const user = req.user?.userId;
      const caption = req.body.caption;
      const customReq = req as CustomRequestWithFiles;
      if (!customReq.files || !(customReq?.files instanceof Array)) {
        return sendError(
          res,
          CONSTANT_LIST.BAD_REQUEST,
          CONSTANT_LIST.BAD_REQUEST,
          "No file uploaded",
        );
      }
      // ✅ Upload all files at once
      const uploadedFiles = await uploadFilesToCloudinary(
        customReq.files,
        "posts",
      );

      // ✅ Format for DB
      const media = uploadedFiles.map((file) => ({
        url: file.url,
        publicId: file.publicId,
        resourceType: file.resourceType,
      }));

      const post = await PostModel.create({
        userId: user,
        caption,
        media,
      });
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_CREATED,
        "The post has been added successfully",
        post,
      );
    } catch (err: any) {
      console.log(`Error in the adding the post API : ${err}`);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
      );
    }
  },
);

/* =====================================================
  POST => LIST ALL POSTS
==================================================== */
export const listAllPost = asyncHandler(
  async (
    req: express.Request<{}, {}, SearchBody>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const page = Number(req.body.page) || 1;
      const limit = Number(req.body.limit) || 10;
      const skip = (page - 1) * limit;
      const sortBy = req.body.sortBy || "createdAt";
      const sortOrder = req.body.sortOrder === "asc" ? 1 : -1;
      const search = req.body.search?.trim();
      let matchStage: any = { isDeleted: false };

      if (search) {
        matchStage.$text = { $search: search };
      }

      const posts = await PostModel.aggregate([
        { $match: matchStage },

        // // 🏆 Sort by newest
        // { $sort: { createdAt: -1 } },

        // 👤 Lookup user details
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },

        // 💬 Lookup comments
        {
          $lookup: {
            from: "comments",
            let: { postId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$postId", "$$postId"] },
                  isDeleted: false,
                },
              },

              // 👤 Comment user
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "commentUser",
                },
              },
              { $unwind: "$commentUser" },

              // 🔁 Parent comment lookup
              {
                $lookup: {
                  from: "comments",
                  localField: "parentComment",
                  foreignField: "_id",
                  as: "parentCommentDetail",
                },
              },
              {
                $unwind: {
                  path: "$parentCommentDetail",
                  preserveNullAndEmptyArrays: true,
                },
              },

              {
                $project: {
                  description: 1,
                  createdAt: 1,
                  parentComment: 1,
                  "commentUser._id": 1,
                  "commentUser.userName": 1,
                  "commentUser.profileImage": 1,
                  "parentCommentDetail.description": 1,
                },
              },
            ],
            as: "comments",
          },
        },

        // 📦 Final projection
        {
          $project: {
            caption: 1,
            media: 1,
            likeCount: 1,
            disLikeCount: 1,
            commentCount: 1,
            createdAt: 1,
            "user._id": 1,
            "user.userName": 1,
            "user.profileImage": 1,
            comments: 1,
          },
        },
        {
          $sort: {
            [sortBy]: sortOrder,
          },
        },
        { $skip: skip },
        { $limit: limit },
      ]);
      const total = await PostModel.countDocuments(matchStage);
      if (posts.length === 0) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_DATA_FOUND,
          "Sorry, no post found.",
        );
      } else {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The Post list",
          {
            posts,
            pagination: {
              totalRecord: total,
              currentPage: page,
              totalPages: Math.ceil(total / limit),
              pageSize: limit,
            },
          },
        );
      }
    } catch (err: any) {
      console.log(`Error in the post listing api:${err}`);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
      );
    }
  },
);
/* =====================================================
  GET => GET POST
===================================================== */
export const getPost = asyncHandler(
  async (
    req: express.Request<{ postId: string }, {}, {}>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const postId = req.params.postId;
      const postObjectID = new mongoose.Types.ObjectId(postId);
      const post = await PostModel.findById(postObjectID);
      if (post) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_DATA_FOUND,
          "Sorry, no post found",
        );
      }
      const matchStage: any = {
        isDeleted: false,
        postId: postObjectID,
      };

      const postData = await PostModel.aggregate([
        { $match: matchStage },

        // 🏆 Sort by newest
        { $sort: { createdAt: -1 } },

        // 👤 Lookup user details
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },

        // 💬 Lookup comments
        {
          $lookup: {
            from: "comments",
            let: { postId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$postId", "$$postId"] },
                  isDeleted: false,
                },
              },

              // 👤 Comment user
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "commentUser",
                },
              },
              { $unwind: "$commentUser" },

              // 🔁 Parent comment lookup
              {
                $lookup: {
                  from: "comments",
                  localField: "parentComment",
                  foreignField: "_id",
                  as: "parentCommentDetail",
                },
              },
              {
                $unwind: {
                  path: "$parentCommentDetail",
                  preserveNullAndEmptyArrays: true,
                },
              },

              {
                $project: {
                  description: 1,
                  createdAt: 1,
                  parentComment: 1,
                  "commentUser._id": 1,
                  "commentUser.userName": 1,
                  "commentUser.profileImage": 1,
                  "parentCommentDetail.description": 1,
                },
              },
            ],
            as: "comments",
          },
        },

        // 📦 Final projection
        {
          $project: {
            caption: 1,
            media: 1,
            likeCount: 1,
            disLikeCount: 1,
            commentCount: 1,
            createdAt: 1,
            "user._id": 1,
            "user.userName": 1,
            "user.profileImage": 1,
            comments: 1,
          },
        },
      ]);

      if (!postData) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_DATA_FOUND,
          "Sorry, no post found.",
        );
      } else {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The Post list",
          {
            postData,
          },
        );
      }
    } catch (err: any) {
      console.log(`Error in the get post api:${err}`);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
      );
    }
  },
);

/* =====================================================
  GET => GET POST
===================================================== */
export const getUserPost = asyncHandler(
  async (
    req: express.Request<{ postId: string }, {}, {}>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const userId = req.user?.userId;
      const user = new mongoose.Types.ObjectId(userId);
      const matchStage: any = {
        isDeleted: false,
        userId: user,
      };

      const postData = await PostModel.aggregate([
        { $match: matchStage },

        // 🏆 Sort by newest
        { $sort: { createdAt: -1 } },

        // 👤 Lookup user details
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },

        // 💬 Lookup comments
        {
          $lookup: {
            from: "comments",
            let: { postId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$postId", "$$postId"] },
                  isDeleted: false,
                },
              },

              // 👤 Comment user
              {
                $lookup: {
                  from: "users",
                  localField: "userId",
                  foreignField: "_id",
                  as: "commentUser",
                },
              },
              { $unwind: "$commentUser" },

              // 🔁 Parent comment lookup
              {
                $lookup: {
                  from: "comments",
                  localField: "parentComment",
                  foreignField: "_id",
                  as: "parentCommentDetail",
                },
              },
              {
                $unwind: {
                  path: "$parentCommentDetail",
                  preserveNullAndEmptyArrays: true,
                },
              },

              {
                $project: {
                  description: 1,
                  createdAt: 1,
                  parentComment: 1,
                  "commentUser._id": 1,
                  "commentUser.userName": 1,
                  "commentUser.profileImage": 1,
                  "parentCommentDetail.description": 1,
                },
              },
            ],
            as: "comments",
          },
        },

        // 📦 Final projection
        {
          $project: {
            caption: 1,
            media: 1,
            likeCount: 1,
            disLikeCount: 1,
            commentCount: 1,
            createdAt: 1,
            "user._id": 1,
            "user.userName": 1,
            "user.profileImage": 1,
            comments: 1,
          },
        },
      ]);

      if (!postData) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_DATA_FOUND,
          "Sorry, no post found.",
        );
      } else {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The Post list",
          {
            postData,
          },
        );
      }
    } catch (err: any) {
      console.log(`Error in the user post listing api:${err}`);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
      );
    }
  },
);

/* =====================================================
  DELETE => DELETE THE POST
==========================-========================== */
export const deletePost = asyncHandler(
  async (
    req: express.Request<{ postId: string }, {}, {}>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const userId = req.user?.userId;
      const postId = req.params.postId;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Invalid postId",
        );
      }
      const post = await PostModel.findOne({
        _id: postId,
        userId,
        isDeleted: false,
      });
      if (!post) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Invalid postId",
        );
      }
      //Soft delete the post
      await PostModel.updateOne(
        {
          _id: postId,
        },
        {
          $set: {
            isDeleted: true,
          },
        },
      );

      //Soft delete comments
      await CommentModel.updateMany(
        {
          postId,
        },
        {
          $set: {
            isDeleted: true,
          },
        },
      );
      //soft delete reactions
      await ReactionModel.updateMany(
        {
          postId,
        },
        {
          $set: {
            isDeleted: true,
          },
        },
      );
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "The post deleted succesfully.",
        null,
      );
    } catch (err: any) {
      console.log(`Error in the delete post API : ${err}`);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
      );
    }
  },
);
/* =====================================================
  DELETE => UPDATE THE POST
==========================-========================== */
export const updatePost = asyncHandler(
  async (
    req: express.Request<{ postId: string }, {}, { caption: string }>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const userId = req.user?.userId;
      const postId = req.params.postId;
      const caption = req.body.caption;
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Invalid postId",
        );
      }

      const post = await PostModel.findOne({
        _id: postId,
        userId,
        isDeleted: false,
      });
      if (!post) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Invalid postId",
        );
      }
      //Soft delete the post
      const updatePostDetail = await PostModel.findByIdAndUpdate(
        postId,
        {
          $set: {
            caption: caption,
          },
        },
        {
          new: true,
        },
      );
      if (updatePostDetail) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The post updated",
          updatePostDetail,
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the post can not updated",
        );
      }
    } catch (err: any) {
      console.log(`Error in the delete post API : ${err}`);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
      );
    }
  },
);

/* =====================================================
  POST => DELETE SINGLE OR MULTIPLE POST IMAGE
==========================-========================== */
export const deletePostImage = asyncHandler(
  async (
    req: express.Request<{ postId: string }, {}, { publicIds: string }>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const userId = req.user?.userId;
      const postId = req.params.postId;
      const publiIds = req.body.publicIds;
      if (!Array.isArray(publiIds) || publiIds.length === 0) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Please select the image or video to delete.",
        );
      }
      //Find the post
      const post = await PostModel.findOne({
        _id: postId,
        userId: userId,
        isDeleted: false,
      });
      if (!post) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Post not found.",
        );
      }
      //Filter media that need to be deleted.
      const mediaToDelete = post.media.filter((m: any) => {
        publiIds.includes(m.publicId);
      });
      if (mediaToDelete.length === 0) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Please select the image or video to delete.",
        );
      }
      //Delete from cloudinary
      await Promise.all(
        mediaToDelete.map((m: any) => {
          cloudinary.uploader.destroy(m.publicId, {
            resource_type: m.type === "video" ? "video" : "image",
          });
        }),
      );
      //Remove from database
      post.media = post.media.filter((m: any) => {
        !publiIds.includes(m.publicId);
      });
      await post.save();
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "The image or the video of the page has been deleted.",
        post,
      );
    } catch (err: any) {
      console.log(`Error in the delete post images API : ${err}`);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
      );
    }
  },
);

/* =====================================================
  POST => ADD SINGLE OR MULTIPLE POST IMAGE
==========================-========================== */
export const uploadPostImages = asyncHandler(
  async (
    req: express.Request<{ postId: string }, {}, {}>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const userId = req.user?.userId;
      const postId = req.params.postId;
      const post = await PostModel.findOne({
        _id: postId,
        userId: userId,
        isDeleted: false,
      });
      if (!post) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Post not found.",
        );
      }
      const customReq = req as CustomRequestWithFiles;
      if (!customReq.files || !(customReq?.files instanceof Array)) {
        return sendError(
          res,
          CONSTANT_LIST.BAD_REQUEST,
          CONSTANT_LIST.BAD_REQUEST,
          "No file uploaded",
        );
      }
      //Upload to cloudinary
      const uploadResults = await Promise.all(
        customReq.files.map((file) =>
          cloudinary.uploader.upload(file.path, {
            folder: "posts",
            resource_type: "auto",
          }),
        ),
      );
      // 2 Push into media array
      const newMedia = uploadResults.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
      }));
      post.media.push(...newMedia);
      await post.save();
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "The media added successfully",
        post,
      );
    } catch (err: any) {
      console.log(`Error in uploading video or images for post api : ${err}`);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
      );
    }
  },
);
