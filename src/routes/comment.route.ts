import express from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { commentValidation } from "../validations/comment.validation";
import { validateAPI } from "../middlewares/validation.middleware";
import {
  addComment,
  deleteComment,
  updateComment,
} from "../controllers/comment.controller";

const commentRouter = express.Router();
/* =====================================================
  ADD COMMENT
===================================================== */
commentRouter.post(
  "/",
  verifyUser,
  commentValidation(),
  validateAPI,
  addComment,
);

/* =====================================================
  UPDATE COMMENT
===================================================== */
commentRouter.put("/:commentId", verifyUser, updateComment);

/* =====================================================
  DELETE COMMENT
===================================================== */
commentRouter.delete("/:commentId", verifyUser, deleteComment);

export default commentRouter;
