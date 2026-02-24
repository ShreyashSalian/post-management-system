import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";

export const emailVerificationValidation = () => {
  return checkSchema({
    token: {
      notEmpty: {
        errorMessage: "Please enter the token for verification",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
