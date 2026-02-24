import express from "express";

import userRouter from "./user.route";
import authRouter from "./auth.route";
import { CONSTANT_LIST } from "../constants/global.constants";

const indexRouter = express.Router();
indexRouter.use("/api/v1/users", userRouter);
indexRouter.use("/api/v1/auth", authRouter);

indexRouter.get("/api/v1", (req: express.Request, res: express.Response) => {
  res
    .status(CONSTANT_LIST.STATUS_CODE_OK)
    .json({ message: "The server is running properly." });
});

export default indexRouter;
