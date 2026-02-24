import { checkSchema } from "express-validator";

export const commentValidation = () => {
  return checkSchema({
    postId: {
      notEmpty: {
        errorMessage: "Please select the post.",
      },
    },
    parentComment: {
      trim: true,
      notEmpty: {
        errorMessage: "Please select the comment.",
      },
    },
    description: {
      trim: true,
      notEmpty: {
        errorMessage: "Please enter description",
      },
    },
  });
};
