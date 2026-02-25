import express from "express";
import { v4 as uuidv4 } from "uuid";
import { asyncHandler, sendError, sendSuccess } from "../utils/function";

import { Types } from "mongoose";
import { UserModel } from "../models/user.model";
import { USER_MESSAGES } from "../constants-messages/user.constants";
import { LoginBody } from "../helpers/user.helper";
import { CONSTANT_LIST } from "../constants/global.constants";
import { LoginModel } from "../models/login.model";

/* =====================================================
   GENERATE ACCESS AND REFRESH TOKEN
===================================================== */
export const generateAccessAndRefreshToken = async (
  userId: Types.ObjectId,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error(USER_MESSAGES.NO_USER_FOUND);
  }
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  return { accessToken, refreshToken };
};

/* =====================================================
  POST => ALLOW USER TO LOGIN
===================================================== */
export const login = asyncHandler(
  async (
    req: express.Request<{}, {}, LoginBody>,
    res: express.Response,
  ): Promise<express.Response> => {
    try {
      const MAX_LOGIN_ATTEMPTS: number = 5;
      const LOCK_TIME = 5 * 60 * 1000; //5 MINUTES
      const MAX_DEVICES = 3;
      const { userNameOrEmail, password } = req.body;
      console.log(userNameOrEmail, "---------------------------", password);
      const user = await UserModel.findOne({
        $or: [
          {
            userName: userNameOrEmail,
          },
          {
            email: { $regex: userNameOrEmail, $options: "i" },
          },
        ],
      });
      if (!user) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.NO_DATA_FOUND,
          USER_MESSAGES.NO_USER_FOUND_WITH_GIVEN_EMAIL,
          //req.__("NO_USER_FOUND_WITH_GIVEN_EMAIL"),
        );
      }
      if (user?.lockUntil && user.lockUntil > new Date()) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          USER_MESSAGES.ACCOUNT_LOCKED,
          //req.__("ACCOUNT_LOCKED"),
        );
      }
      if (user?.isDeleted) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          USER_MESSAGES.ACCOUNT_DELETED,
          //req.__("ACCOUNT_DELETED"),
        );
      }
      if (!user.isEmailVerified) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          USER_MESSAGES.ACCOUNT_VERIFICATION,
          //req.__("ACCOUNT_VERIFICATION"),
        );
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        user.failedLoginAttempts += 1;
        if (user.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
          user.lockUntil = new Date(Date.now() + LOCK_TIME);
          user.failedLoginAttempts = 0;
        }
        await user.save();
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          USER_MESSAGES.INVALID_CREDENTIAL,
          //req.__("INVALID_CREDENTIAL"),
        );
      }
      // Reset failed attempts on success
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();

      //Device limit check
      const activeDevices = await LoginModel.countDocuments({
        userId: user?._id,
        isActive: true,
      });
      if (activeDevices >= MAX_DEVICES) {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.UNAUTHORIZED_REQUEST,
          USER_MESSAGES.MAXIMUM_LOGIN,
          //req.__("MAXIMUM_LOGIN"),
        );
      }
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user?._id,
      );
      //Save login session
      const deviceId = uuidv4();
      await LoginModel.create({
        userId: user?._id,
        deviceId: deviceId,
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        accessToken,
        refreshToken,
        email: user?.email,
        isActive: true,
      });
      const loginUser = await UserModel.findById(user?._id).select("-password");
      return sendSuccess(
        res,
        CONSTANT_LIST.STATUS_SUCCESS,
        CONSTANT_LIST.STATUS_CODE_OK,
        USER_MESSAGES.LOGIN_SUCCESSFUL,
        //req.__("LOGIN_SUCCESSFUL"),
        {
          loginUser,
          accessToken,
          refreshToken,
          deviceId,
        },
      );
    } catch (err: any) {
      console.log(`Error in the login api : ${err}`);
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
  GET => ALLOW USER TO LOGOUT
===================================================== */
export const logout = asyncHandler(
  async (
    req: express.Request<{}, {}, { deviceId: string }>,
    res: express.Response,
    next: express.NextFunction,
  ): Promise<express.Response> => {
    try {
      const user = req.user?.userId;
      const deviceId = req.body.deviceId;
      const logoutUser = await LoginModel.findOneAndUpdate(
        {
          userId: user,
          deviceId,
          isActive: true,
        },
        {
          $set: {
            isActive: false,
          },
        },
      );
      if (logoutUser) {
        return sendSuccess(
          res,
          CONSTANT_LIST.STATUS_SUCCESS,
          CONSTANT_LIST.STATUS_CODE_OK,
          USER_MESSAGES.USER_LOGOUT,
          {},
        );
      } else {
        return sendError(
          res,
          CONSTANT_LIST.STATUS_ERROR,
          CONSTANT_LIST.BAD_REQUEST,
          USER_MESSAGES.USER_NOT_LOGOUT,
        );
      }
    } catch (err: any) {
      console.log(`Error in the logout API : ${err}`);
      return sendError(
        res,
        CONSTANT_LIST.STATUS_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR,
        CONSTANT_LIST.INTERNAL_SERVER_ERROR_MESSAGE,
      );
    }
  },
);
