import express from "express";
import crypto from "crypto";
import fs from "fs";
export function asyncHandler<
  P = {},
  ResBody = any,
  ReqBody = any,
  ReqQuery = any,
>(
  fn: (
    req: express.Request<P, ResBody, ReqBody, ReqQuery>,
    res: express.Response<ResBody>,
    next: express.NextFunction,
  ) => Promise<any>,
) {
  return (
    req: express.Request<P, ResBody, ReqBody, ReqQuery>,
    res: express.Response<ResBody>,
    next: express.NextFunction,
  ) => Promise.resolve(fn(req, res, next)).catch(next);
}

export const sendSuccess = (
  res: express.Response,
  status: number,
  statusCode: number,
  successMessage: string,
  data: any,
) => {
  return res.status(statusCode).json({
    status,
    statusCode,
    successMessage,
    errorMessage: null,
    data,
  });
};

export const sendError = (
  res: express.Response,
  status: number,
  statusCode: number,
  errorMessage: string,
) => {
  return res.status(statusCode).json({
    status,
    statusCode,
    successMessage: null,
    errorMessage,
    data: null,
  });
};

export const trimInput = (value: string) => {
  if (typeof value === "string") {
    return value.trim();
  }
  return value;
};

export const capitalizeFirstLetter = (name: string) => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase().trim();
};

export const allowedFieldByRole = {
  admin: ["title", "description", "priority", "status", "dueDate"],
  user: ["title", "description"],
};

export const filterFieldList = (data: any, allowedFields: string[]) => {
  let filterData: any = {};
  for (let key of allowedFields) {
    if (data[key] !== undefined) {
      filterData[key] = data[key];
    }
  }
  return filterData;
};

export interface CustomRequestWithFile extends express.Request {
  file: Express.Multer.File;
}
export interface CustomRequestWithFiles extends express.Request {
  files: Express.Multer.File[];
}

export const deleteFile = (file: Express.Multer.File | undefined) => {
  if (file) {
    fs.unlinkSync(file.path);
  }
};

// Allowed file types and maximum size
export const allowedMimeTypes = ["image/jpeg", "image/png"];
export const maxSize = 2 * 1024 * 1024; // 2MB

export function formatDateWithSuffix(dateString: string): string {
  const date = new Date(dateString);

  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  const month = date.toLocaleString("en-US", {
    month: "long",
    timeZone: "UTC",
  });

  const getSuffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${day}${getSuffix(day)} ${month} ${year}`;
}

export const rolePermission = {
  admin: ["create", "read", "update", "delete"],
  manager: ["read", "update"],
  user: ["read"],
};

// Used to generate the token for the email verification

export const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
