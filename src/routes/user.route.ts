import express from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import {
  addNewUser,
  changePassword,
  forgotPassword,
  generateAccessToken,
  getLoginUserDetail,
  resetPassword,
  userEmailVerification,
} from "../controllers/user.controller";
import { upload } from "../middlewares/multer.middleware";
import { userValidation } from "../validations/user.validation";
import { validateAPI } from "../middlewares/validation.middleware";
import { forgotPasswordValidation } from "../validations/forgotPassword.valiation";
import { resetPasswordValidation } from "../validations/resetPassword.validation";
import { emailVerificationValidation } from "../validations/emailVerification.validation";
import { changePasswordValidation } from "../validations/changePassword.validation";
const userRouter = express.Router();

userRouter.get("/", verifyUser, getLoginUserDetail);
userRouter.post(
  "/",
  upload.single("profileImage"),
  userValidation(),
  validateAPI,
  addNewUser,
);

userRouter.post("/access-token", generateAccessToken);
userRouter.post(
  "/forgot-password",
  forgotPasswordValidation(),
  validateAPI,
  forgotPassword,
);

userRouter.post(
  "/reset-password",
  resetPasswordValidation(),
  validateAPI,
  resetPassword,
);

userRouter.post(
  "/email-verification",
  emailVerificationValidation(),
  validateAPI,
  userEmailVerification,
);

userRouter.post(
  "/change-password",
  changePasswordValidation(),
  validateAPI,
  changePassword,
);

export default userRouter;
