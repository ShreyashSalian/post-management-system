import express from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import {
  asyncHandler,
  CustomRequestWithFile,
  deleteFromCloudinary,
  generateEmailVerificationToken,
  generateOtp,
  rolePermission,
  sendError,
  sendSuccess,
} from "../utils/function";
import { UserModel } from "../models/user.model";

import { LoginModel } from "../models/login.model";
import { generateAccessAndRefreshToken } from "./auth.controller";
import { CONSTANT_LIST } from "../constants/global.constants";
import { USER_MESSAGES } from "../constants-messages/user.constants";
import { uploadSingleImage } from "../utils/cloudinarySingleFileUpload";
import { emailQueue } from "../utils/queue/email.queue";

/* =====================================================
   GET => LOGIN USER DETAIL
===================================================== */
export const getLoginUserDetail = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const user = req.user?.userId;
      const userDetail = await UserModel.findById(user).select("-password");
      if (userDetail) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          USER_MESSAGES.LOGIN_USER_DETAIL,
          userDetail,
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_DATA_FOUND,
          USER_MESSAGES.NO_USER_FOUND,
        );
      }
    } catch (err: any) {
      console.log(`Error in the login user detail api ${err}`);
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
  POST => REGISTER USER
===================================================== */
export const addNewUser = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const customRequest = req as CustomRequestWithFile;
      const {
        firstName,
        lastName,
        email,
        contactNumber,
        password,
        userName,
      }: {
        firstName: string;
        lastName: string;
        email: string;
        contactNumber: string;
        password: string;
        userName: string;
      } = customRequest.body;
      // const { firstName, lastName, email, contactNumber, password, userName } =
      //   req.body;
      const userAlreadyExist = await UserModel.findOne({
        $or: [
          {
            email: email,
          },
          {
            userName: userName,
          },
        ],
      });
      if (userAlreadyExist) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          USER_MESSAGES.USER_ALREADY_EXIST_WITH_EMAIL_USERNAME,
        );
      }
      const newrole = "user";
      let newPermission = [];
      if (newrole === "user") {
        newPermission = rolePermission.user;
      } else if (newrole === "manager") {
        newPermission = rolePermission.manager;
      } else {
        newPermission = rolePermission.admin;
      }
      let profileImage;
      if (customRequest.file) {
        profileImage = await uploadSingleImage(customRequest.file);
      }

      //Used to send the email code to user email and store the token in db
      const emailVerifyToken = await generateEmailVerificationToken();

      await emailQueue.add("VERIFY_EMAIL", {
        email,
        token: emailVerifyToken,
      });

      const userCreation = await UserModel.create({
        firstName,
        lastName,
        email,
        password,
        contactNumber,
        userName,
        role: "user",
        profileImage: profileImage,
        permission: newPermission,
        emailVerificationToken: emailVerifyToken,
      });

      if (userCreation) {
        const userDetail = await UserModel.findById(userCreation?._id).select(
          "-password",
        );
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          USER_MESSAGES.USER_ADDED,
          userDetail,
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          USER_MESSAGES.USER_NOT_ADDED,
        );
      }
    } catch (err: any) {
      console.log(`Error in the add user api ${err}`);
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
  GET => GENERATE ACCESS TOKEN
===================================================== */
export const generateAccessToken = asyncHandler(
  async (
    req: express.Request<{}, {}, { refreshToken: string }>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const incomingRefreshToken =
        req.body.refreshToken || req.cookies?.refreshToken;
      if (!incomingRefreshToken) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          USER_MESSAGES.ENTER_REFRESH_TOKEN,
        );
      }
      const secretKey: string | undefined = process.env.ACCESS_TOKEN;
      if (!secretKey) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          USER_MESSAGES.ENTER_REFRESH_TOKEN,
        );
      }
      const verifyRefreshToken = jwt.verify(
        incomingRefreshToken,
        secretKey,
      ) as JwtPayload;
      console.log(verifyRefreshToken);
      if (!verifyRefreshToken) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          CONSTANT_LIST.UNAUTHORIZED_ERROR_MESSAGE,
        );
      }
      const user = await LoginModel.findOne({
        userId: verifyRefreshToken?.userId,
      });
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          CONSTANT_LIST.UNAUTHORIZED_ERROR_MESSAGE,
        );
      }
      if (incomingRefreshToken !== user?.refreshToken) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          CONSTANT_LIST.UNAUTHORIZED_ERROR_MESSAGE,
        );
      }
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user?.userId,
      );
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        USER_MESSAGES.ACCESS_TOKEN_GENERATED,
        {
          accessToken,
          refreshToken,
        },
      );
    } catch (err: any) {
      console.log(`Error in the add user api ${err}`);
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
  POST => CHANGE PASSWORD 
===================================================== */
export const changePassword = asyncHandler(
  async (
    req: express.Request<{}, {}, { oldPassword: string; newPassword: string }>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await UserModel.findById(req.user?.userId);
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_DATA_FOUND,
          USER_MESSAGES.NO_USER_FOUND,
        );
      }
      const passwordCheck = await user.comparePassword(oldPassword);
      if (!passwordCheck) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          USER_MESSAGES.ENTER_VALID_PASSWORD,
        );
      }
      user.password = newPassword;
      await user.save({ validateBeforeSave: false });
      return sendError(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        USER_MESSAGES.PASSWORD_UPDATED_SUCCESSFULLY,
      );
    } catch (err: any) {
      console.log(`Error in the add user api ${err}`);
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
  POST => FORGOT PASSWORD
===================================================== */
export const forgotPassword = asyncHandler(
  async (
    req: express.Request<{}, {}, { email: string }>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const email = req.body.email;
      const user = await UserModel.findOne({ email: email });
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_DATA_FOUND,
          USER_MESSAGES.NO_USER_FOUND_WITH_GIVEN_EMAIL,
        );
      }
      //Generate 6 digit otp
      const otp = generateOtp();

      //Hash otp before saving
      const hashedOtp = await bcrypt.hash(otp, 10);

      //Expiry -> 30 minutes
      const expiry = new Date(Date.now() + 30 * 60 * 1000);
      user.resetPasswordOtp = hashedOtp;
      user.resetPasswordOtpExpiry = expiry;
      await user.save();
      // await forgotPasswordMail(token, user?.email);
      //Push job to queue

      await emailQueue.add("FORGOT_PASSWORD", {
        email: user.email,
        otp: otp,
      });
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        USER_MESSAGES.RESET_PASSWORD_MAIL_SENT,
        {},
      );
    } catch (err: any) {
      console.log(`Error in the add user api ${err}`);
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
  POST => RESET PASSWORD
===================================================== */
export const resetPassword = asyncHandler(
  async (
    req: express.Request<
      {},
      {},
      { otp: string; password: string; email: string }
    >,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const { otp, password, email } = req.body;

      //Check expiry
      const user = await UserModel.findOne({ email }).select(
        "+resetPasswordOtp",
      );
      if (!user || !user.resetPasswordOtp) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          "Invalid request.",
        );
      }

      //Check expiry
      if (
        !user?.resetPasswordOtpExpiry ||
        user?.resetPasswordOtpExpiry < new Date()
      ) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Otp expired.",
        );
      }
      //Comparted hashed otp---------------
      const isOtpVerified = bcrypt.compare(otp, user.resetPasswordOtp);
      if (!isOtpVerified) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Invalid otp.",
        );
      }
      //Update password
      user.password = password;
      user.resetPasswordOtp = undefined;
      user.resetPasswordOtpExpiry = undefined;
      await user.save();

      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        USER_MESSAGES.PASSWORD_RESET,
        {},
      );
    } catch (err: any) {
      console.log(`Error in the add user api ${err}`);
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
  POST => EMAIL VERIFICATION
===================================================== */
export const userEmailVerification = asyncHandler(
  async (
    req: express.Request<{}, {}, { token: string }>,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const token = req.body.token;
      const user = await UserModel.findOne({
        emailVerificationToken: token,
      });
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          USER_MESSAGES.ENTER_VALID_TOKEN,
        );
      }
      user.isEmailVerified = true;
      user.emailVerificationToken = null;
      await user.save({ validateBeforeSave: false });
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        USER_MESSAGES.EMAIL_VERIFIED,
        null,
      );
    } catch (err: any) {
      console.log(`Error in the login user detail api ${err}`);
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
  POST => ADD PROFILE IMAGE
===================================================== */
export const addProfileImage = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const customRequest = req as CustomRequestWithFile;
      const userId = req.user?.userId;
      if (!customRequest.file) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "Profile image is required",
        );
      }

      const user = await UserModel.findById(userId);

      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_DATA_FOUND,
          "User not found",
        );
      }
      // ✅ 1. Upload new image FIRST (important)
      const uploadedImage = await uploadSingleImage(customRequest.file);
      // Should return { url, publicId }

      // ✅ 2. Delete old image AFTER successful upload
      if (user.profileImage?.publicId) {
        await deleteFromCloudinary(user.profileImage.publicId);
      }
      user.profileImage = {
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
      };

      await user.save();
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "Profile image updated successfully",
        user,
      );
    } catch (err: any) {
      console.log(`Error in the add profile image api ${err}`);
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
  POST => DELETE THE PROFILE IMAGE
===================================================== */
export const deleteProfileImage = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const userId = req.user?.userId;

      const user = await UserModel.findById(userId);

      if (!user?.profileImage?.publicId) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          "No profile Image found to delete",
        );
      }

      await deleteFromCloudinary(user.profileImage.publicId);

      user.profileImage = {
        url: null,
        publicId: null,
      };
      await user.save();

      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        "The profile image has been deleted",
        user,
      );
    } catch (err: any) {
      console.log(`Error in the delete profile image api ${err}`);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
      );
    }
  },
);
