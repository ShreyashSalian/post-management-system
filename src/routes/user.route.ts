import express from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import {
  addNewUser,
  addProfileImage,
  changePassword,
  deleteProfileImage,
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
import { uploadProfileImageValidation } from "../validations/uploadProfileImage.validation";
const userRouter = express.Router();

/* =====================================================
   GET LOGIN USER DETAIL API
===================================================== */
userRouter.get("/", verifyUser, getLoginUserDetail);

/* =====================================================
   ADD USER API
===================================================== */
userRouter.post(
  "/",
  upload.single("profileImage"),
  userValidation(),
  validateAPI,
  addNewUser,
);

/* =====================================================
   GENERATE ACCESS TOKEN
===================================================== */
userRouter.post("/access-token", generateAccessToken);

/* =====================================================
   FORGOT PASSWORD API
===================================================== */
userRouter.post(
  "/forgot-password",
  forgotPasswordValidation(),
  validateAPI,
  forgotPassword,
);

/* =====================================================
   RESET PASSWORD API
===================================================== */
userRouter.post(
  "/reset-password",
  resetPasswordValidation(),
  validateAPI,
  resetPassword,
);

/* =====================================================
   EMAIL VERIFICATION API
===================================================== */
userRouter.post(
  "/email-verification",
  emailVerificationValidation(),
  validateAPI,
  userEmailVerification,
);

/* =====================================================
   CHANGE PASSWORD API
===================================================== */
userRouter.post(
  "/change-password",
  changePasswordValidation(),
  validateAPI,
  changePassword,
);

/* =====================================================
   UPDATE PROFILE IMAGE API
===================================================== */
userRouter.post(
  "/profile-image",
  verifyUser,
  uploadProfileImageValidation(),
  validateAPI,
  addProfileImage,
);

/* =====================================================
   DELETE PROFILE IMAGE API
===================================================== */
userRouter.post("/delete-profile-image", verifyUser, deleteProfileImage);
export default userRouter;
