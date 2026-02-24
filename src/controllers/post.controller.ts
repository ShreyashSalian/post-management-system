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
