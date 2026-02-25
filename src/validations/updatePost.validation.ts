import { checkSchema } from "express-validator";

export const updatePostValidation = () => {
  return checkSchema({
    caption: {
      trim: true,
      isLength: {
        options: { min: 5, max: 300 },
        errorMessage: "THe caption shound be between 3 to 300 character long.",
      },
      notEmpty: {
        errorMessage: "Please enter the caption for the media.",
      },
    },
  });
};
