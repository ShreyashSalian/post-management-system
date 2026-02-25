import express from "express";
import { asyncHandler, sendError, sendSuccess } from "../utils/function";
import { CONSTANT_LIST } from "../constants/global.constants";
import { CommentModel } from "../models/comment.model";
import mongoose from "mongoose";
import { PostModel } from "../models/post.model";
import { UserModel } from "../models/user.model";

/* =====================================================
   POST => ALLOW USER TO ADD COMMENT
===================================================== */
export const addComment = asyncHandler(
  async (
    req: express.Request<
      {},
      {},
      { postId: string; description: string; parentComment?: string }
    >,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const userId = req.user?.userId;
      const { postId, parentComment, description } = req.body;

      const postObjectId = new mongoose.Types.ObjectId(postId);

      // ✅ Check post exists
      const postExists = await PostModel.exists({ _id: postObjectId });
      if (!postExists) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Post not found",
        );
      }
      let parentObjectId: mongoose.Types.ObjectId | null = null;
      // ✅ Validate parent comment if provided
      if (parentComment) {
        parentObjectId = new mongoose.Types.ObjectId(parentComment);
        const parentExist = await CommentModel.findOne({
          _id: parentObjectId,
          postId: postObjectId,
          isDeleted: false,
        });
        if (!parentExist) {
          return sendError(
            res,
            CONSTANT_LIST.STATUS_ERROR,
            CONSTANT_LIST.BAD_REQUEST,
            "Invalid parent comment",
          );
        }
      }
      //Create Comment

      const commentCreation = await CommentModel.create({
        userId: new mongoose.Types.ObjectId(userId),
        postId: postObjectId,
        description,
        parentComment: parentObjectId,
      });
      // ✅ Atomic increment of comment counter
      await PostModel.findByIdAndUpdate(postObjectId, {
        $inc: { commentCount: 1 },
      });

      if (commentCreation) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_CREATED,
          "The comment has been added",
          commentCreation,
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the comment can not be added.",
        );
      }
    } catch (err: any) {
      console.log(`Error in the adding the comment API : ${err}`);
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
   PUT => ALLOW USER TO UPDATE COMMENT
===================================================== */
export const updateComment = asyncHandler(
  async (
    req: express.Request<{ commentId: string }, {}, { description: string }>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const commentId = req.params.commentId;
      const { description } = req.body;
      if (!description) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.VALIDATION_ERROR,
          "Description can not be empty.",
        );
      }
      const userId = req.user?.userId;
      const userDetail = await UserModel.findById(userId);
      const commentObjectId = new mongoose.Types.ObjectId(commentId);

      const comment = await CommentModel.findOne({
        _id: commentObjectId,
        userId,
        isDeleted: false,
      });
      if (!comment) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Comment not found or unauthorized",
        );
      }

      if (
        comment?.userId.toString() !== userId?.toString() &&
        userDetail?.role !== "admin"
      ) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Comment not found or unauthorized",
        );
      }

      const commentUpdation = await CommentModel.findOneAndUpdate(
        {
          _id: commentObjectId,
          userId: userId,
          isDeleted: false,
        },
        {
          $set: { description },
        },
        { new: true },
      );
      if (commentUpdation) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The comment has been updated.",
          commentUpdation,
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the comment can not be updated.",
        );
      }
    } catch (err: any) {
      console.log(`Error in the updating the comment API : ${err}`);
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
   DELETE => USER USER TO DELETE THE COMMENT
===================================================== */
export const deleteComment = asyncHandler(
  async (
    req: express.Request<{ commentId: string }, {}, {}>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const commentId = req.params.commentId;
      const userId = req.user?.userId;
      const userDetail = await UserModel.findById(userId);
      const commentObjectId = new mongoose.Types.ObjectId(commentId);

      const comment = await CommentModel.findOne({
        _id: commentObjectId,
        userId,
        isDeleted: false,
      });
      if (!comment) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Comment not found or unauthorized",
        );
      }
      if (
        comment?.userId.toString() !== userId?.toString() &&
        userDetail?.role !== "admin"
      ) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Comment not found or unauthorized",
        );
      }
      //Soft delete------------------

      const commentDeletion = await CommentModel.findByIdAndUpdate(
        {
          commentObjectId,
          $set: {
            isDeleted: true,
          },
        },
        { new: true },
      );

      //Atomic decrement post comment counter
      await PostModel.findByIdAndUpdate(comment.postId, {
        $inc: {
          commentCount: -1,
        },
      });

      if (commentDeletion) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          "The comment has been deleted.",
          null,
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Sorry, the comment can not be deleted.",
        );
      }
    } catch (err: any) {
      console.log(`Error in the deleting the comment API : ${err}`);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
      );
    }
  },
);
