import express from "express";
import { asyncHandler, sendError, sendSuccess } from "../utils/function";
import { CONSTANT_LIST } from "../constants/global.constants";
import { ReactionModel } from "../models/reaction.model";
import mongoose from "mongoose";
import { PostModel } from "../models/post.model";

/* =====================================================
   POST=> LOGIN USER DETAIL
===================================================== */
export const addReaction = asyncHandler(
  async (
    req: express.Request<{}, {}, { postId: string; type: "LIKE" | "DISLIKE" }>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const userId = new mongoose.Types.ObjectId(req.user?.userId);
      const { postId, type } = req.body;
      const postObjectId = new mongoose.Types.ObjectId(postId);
      const post = await PostModel.findById(postObjectId);
      if (!post) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Post not found",
        );
      }

      const existingReaction = await ReactionModel.findOne({
        userId,
        postId: postObjectId,
      });

      // ==============================
      // CASE 1: No previous reaction
      // ==============================
      if (!existingReaction) {
        await ReactionModel.create({
          userId,
          postId,
          type,
        });
        //Check the type
        await PostModel.findByIdAndUpdate(postObjectId, {
          $inc: type === "LIKE" ? { likeCount: 1 } : { disLikeCount: 1 },
        });
      }

      // ===================================
      // CASE 2: Same reaction clicked again
      // ===================================
      else if (existingReaction.type === type) {
        // await existingReaction.deleteOne();
        // if (type === "LIKE") {
        //   post.likeCount -= 1;
        // } else {
        //   post.disLikeCount -= 1;
        // }
        // await PostModel.findByIdAndUpdate(postObjectId, {
        //   $inc: type === "LIKE" ? { likeCount: -1 } : { disLikeCount: -1 },
        // });
      }
      // =====================================
      // CASE 3: Switching reaction
      // =====================================
      else {
        // if (existingReaction.type === "LIKE") {
        //   post.likeCount -= 1;
        //   post.disLikeCount += 1;
        // } else {
        //   post.disLikeCount -= 1;
        //   post.likeCount += 1;
        // }
        // existingReaction.type = type;
        // await existingReaction.save();
        await ReactionModel.updateOne(
          {
            _id: existingReaction._id,
          },
          {
            $set: {
              type,
            },
          },
        );
        if (type === "LIKE") {
          await PostModel.findByIdAndUpdate(postObjectId, {
            $inc: {
              likeCount: 1,
              disLikeCount: -1,
            },
          });
        } else {
          await PostModel.findByIdAndUpdate(postObjectId, {
            $inc: {
              likeCount: -1,
              disLikeCount: 1,
            },
          });
        }
      }
      const updatedPost = await PostModel.findById(postObjectId).select(
        "likeCount disLikeCount",
      );
      //await post.save();
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_CREATED,
        "Reaction updated successfully",
        updatedPost,
      );
      // if (reactionCreation) {
      //   return sendSuccess(
      //     res,
      //     CONSTANT_LIST.STATUS_SUCCESS,
      //     CONSTANT_LIST.STATUS_CODE_CREATED,
      //     "The like or dislike has been added",
      //     null,
      //   );
      // } else {
      //   return sendError(
      //     res,
      //     CONSTANT_LIST.STATUS_ERROR,
      //     CONSTANT_LIST.BAD_REQUEST,
      //     "Sorry, the reaction can not be added",
      //   );
      // }
    } catch (err: any) {
      console.log(`Error in the adding the reaction api : ${err}`);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
      );
    }
  },
);
// export const updateReaction = asyncHandler(
//   async (
//     req: express.Request<{ reactionId: string }, {}, { type: "LIKE|DISLIKE" }>,
//     res: express.Response,
//   ): Promise<express.Response> => {
//     try {
//       const reactionId = req.params.reactionId;
//       const { type } = req.body;
//       const reactionUpdation = await ReactionModel.findByIdAndUpdate(
//         reactionId,
//         {
//           $set: {
//             type,
//           },
//         },
//         {
//           new: true,
//         },
//       );
//       if (reactionUpdation) {
//         return sendSuccess(
//           res,
//           CONSTANT_LIST.STATUS_SUCCESS,
//           CONSTANT_LIST.STATUS_CODE_CREATED,
//           "The like or dislike has been updated.",
//           null,
//         );
//       } else {
//         return sendError(
//           res,
//           CONSTANT_LIST.STATUS_ERROR,
//           CONSTANT_LIST.BAD_REQUEST,
//           "Sorry, the reaction can not be updated",
//         );
//       }
//     } catch (err: any) {
//       console.log(`Error in the updating the reaction api : ${err}`);
//       return sendError(
//         res,
//         CONSTANT_LIST.STATUS_ERROR,
//         CONSTANT_LIST.INTERNAL_SERVER_ERROR,
//         CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
//       );
//     }
//   },
// );
// export const deleteReaction = asyncHandler(
//   async (
//     req: express.Request<{ reactionId: string }, {}, {}>,
//     res: express.Response,
//   ): Promise<express.Response> => {
//     try {
//       const reactionId = req.params.reactionId;

//       const reactionUpdation =
//         await ReactionModel.findByIdAndDelete(reactionId);
//       if (reactionUpdation) {
//         return sendSuccess(
//           res,
//           CONSTANT_LIST.STATUS_SUCCESS,
//           CONSTANT_LIST.STATUS_CODE_CREATED,
//           "The like or dislike has been deleted.",
//           null,
//         );
//       } else {
//         return sendError(
//           res,
//           CONSTANT_LIST.STATUS_ERROR,
//           CONSTANT_LIST.BAD_REQUEST,
//           "Sorry, the reaction can not be deleted",
//         );
//       }
//     } catch (err: any) {
//       console.log(`Error in the deleting the reaction api : ${err}`);
//       return sendError(
//         res,
//         CONSTANT_LIST.STATUS_ERROR,
//         CONSTANT_LIST.INTERNAL_SERVER_ERROR,
//         CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
//       );
//     }
//   },
// );
