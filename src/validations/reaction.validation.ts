import { checkSchema } from "express-validator";

export const reactionValidation = () => {
  return checkSchema({
    postId: {
      notEmpty: {
        errorMessage: "Please select the post.",
      },
    },
    userId: {
      trim: true,
      notEmpty: {
        errorMessage: "Please select the user.",
      },
    },
    type: {
      trim: true,
      notEmpty: {
        errorMessage: "Please enter the type",
      },
    },
  });
};
