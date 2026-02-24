import { checkSchema, Meta } from "express-validator";
import { trimInput } from "../utils/function";

export const resetPasswordValidation = () => {
  return checkSchema({
    email: {
      trim: true,
      isEmail: {
        errorMessage: "Please enter the valid email",
      },
      notEmpty: {
        errorMessage: "Please enter the email",
      },
    },
    otp: {
      trim: true,
      notEmpty: {
        errorMessage: "Please enter the token",
      },
    },
    password: {
      trim: true,
      notEmpty: {
        errorMessage: "Please enter the password.",
      },
      matches: {
        options: [/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/],
        errorMessage:
          "Password must be at least 6 characters long, including a number and a special character.",
      },
    },
    confirmPassword: {
      trim: true,
      notEmpty: {
        errorMessage: "Please enter the confirm password.",
      },

      custom: {
        options: (value: string, { req }: Meta): boolean => {
          if (value !== req.body.password) {
            throw new Error("Password and confirm password don't match.");
          }
          return true;
        },
      },
    },
  });
};
