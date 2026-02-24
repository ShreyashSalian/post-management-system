import { checkSchema, Meta } from "express-validator";
import { allowedMimeTypes, maxSize } from "../utils/function";

export const uploadProfileImageValidation = () => {
  return checkSchema({
    profileImage: {
      custom: {
        options: (value: unknown, { req }: Meta) => {
          const file = (req.file as Express.Multer.File) || null;

          // Skip validation if no file is uploaded
          if (!file) {
            return true;
          }

          // Check MIME type
          if (!allowedMimeTypes.includes(file.mimetype)) {
            //deleteFile(file);
            throw new Error("Only .jpeg and .png formats are allowed.");
          }

          // Check file size
          if (file.size > maxSize) {
            //deleteFile(file);
            throw new Error("Image size should not exceed 2MB.");
          }

          return true; // Validation passes
        },
      },
    },
  });
};
