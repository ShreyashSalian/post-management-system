import express from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { postValidation } from "../validations/post.validation";
import { validateAPI } from "../middlewares/validation.middleware";
import {
  addPost,
  deletePost,
  deletePostImage,
  getPost,
  getUserPost,
  listAllPost,
  updatePost,
  uploadPostImages,
} from "../controllers/post.controller";
import { updatePostValidation } from "../validations/updatePost.validation";

const postRouter = express.Router();

/* =====================================================
   ADD POST API
===================================================== */
postRouter.post(
  "/",
  verifyUser,
  upload.array("media", 5),
  postValidation(),
  validateAPI,
  addPost,
);

/* =====================================================
   SEARCH WITH PAGINATION
===================================================== */
postRouter.post("/search", verifyUser, listAllPost);

/* =====================================================
   GET USER POST
===================================================== */
postRouter.get("/user", verifyUser, getUserPost);

/* =====================================================
   GET SINGLE POST
===================================================== */
postRouter.get("/:postId", verifyUser, getPost);

/* =====================================================
   DELETE THE POST
===================================================== */
postRouter.delete("/:postId", verifyUser, deletePost);

/* =====================================================
   UPDATE THE POST
===================================================== */
postRouter.delete(
  "/:postId",
  verifyUser,
  updatePostValidation(),
  validateAPI,
  updatePost,
);

/* =====================================================
   DELETE SINGLE OR MUTIPLE MEDIA
===================================================== */
postRouter.post("/delete-media/:postId", verifyUser, deletePostImage);

/* =====================================================
   UPDATE THE POST
===================================================== */
postRouter.post("/upload-media/:postId", verifyUser, uploadPostImages);
