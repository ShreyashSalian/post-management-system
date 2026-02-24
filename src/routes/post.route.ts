import express from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/multer.middleware";
import { postValidation } from "../validations/post.validation";
import { validateAPI } from "../middlewares/validation.middleware";
import { addPost } from "../controllers/post.controller";

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

export default postRouter;
