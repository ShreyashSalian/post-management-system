import express from "express";

import userRouter from "./user.route";
import authRouter from "./auth.route";
import { CONSTANT_LIST } from "../constants/global.constants";
import postRouter from "./post.route";
import commentRouter from "./comment.route";
import reactionRouter from "./reaction.route";

const indexRouter = express.Router();
/* =====================================================
   USER ROUTER
===================================================== */
indexRouter.use("/api/v1/users", userRouter);
/* =====================================================
   AUTH ROUTER
===================================================== */
indexRouter.use("/api/v1/auth", authRouter);
/* =====================================================
   POST ROUTER
===================================================== */
indexRouter.use("/api/v1/posts", postRouter);
/* =====================================================
   COMMENT ROUTER
===================================================== */
indexRouter.use("/api/v1/comments", commentRouter);
/* =====================================================
   REACTION ROUTER
===================================================== */
indexRouter.use("/api/v1/reactions", reactionRouter);

/* =====================================================
   CHECK SERVER RUNNING
===================================================== */
indexRouter.get("/api/v1", (req: express.Request, res: express.Response) => {
  res
    .status(CONSTANT_LIST.STATUS_CODE_OK)
    .json({ message: "The server is running properly." });
});

export default indexRouter;
