import { validationResult } from "express-validator";
import express from "express";
import { CONSTANT_LIST } from "../constants/global.constants";

export const validateAPI = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
): void | Promise<void> => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedError: { [key: string]: string } = {};

  errors
    .array({ onlyFirstError: true })
    .map((err: any) => (extractedError[err.path] = err.msg));

  const responsePayload = {
    status: 0,
    statusCode: CONSTANT_LIST.VALIDATION_ERROR,
    successMessage: null,
    errorMessage: extractedError,
    data: null,
  };
  res.status(CONSTANT_LIST.VALIDATION_ERROR).json(responsePayload);
  return;
};
