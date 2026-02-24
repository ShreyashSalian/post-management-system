import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";

export const loginValidation = () => {
  return checkSchema({
    userNameOrEmail: {
      trim: true,
      notEmpty: {
        errorMessage: "Please enter the email or userName.",
      },
    },
    password: {
      trim: true,
      notEmpty: {
        errorMessage: "Please enter password.",
      },
    },
  });
};
