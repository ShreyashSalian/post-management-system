import { checkSchema } from "express-validator";

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
];

const allowedVideoTypes = ["video/mp4", "video/mov", "video/avi", "video/mkv"];

const allowedMimeTypes = [...allowedImageTypes, ...allowedVideoTypes];
export const postValidation = () => {
  return checkSchema({
    caption: {
      trim: true,
      notEmpty: {
        errorMessage: "Please enter the email or userName.",
      },
    },
    media: {
      custom: {
        options: (value: any, { req }) => {
          const files =
            (req.files as Express.Multer.File[]) ||
            (req.file ? [req.file] : []);

          if (!files || files.length === 0) {
            throw new Error("Please upload at least one image or video.");
          }

          const maxImageSize = 3 * 1024 * 1024; // 3MB
          const maxVideoSize = 50 * 1024 * 1024; // 50MB

          files.forEach((file) => {
            // ✅ MIME TYPE VALIDATION
            if (!allowedMimeTypes.includes(file.mimetype)) {
              throw new Error(
                "Only JPEG, PNG,JPG, WEBP images and MP4, MOV, AVI, MKV videos are allowed.",
              );
            }

            // ✅ SIZE VALIDATION
            if (
              allowedImageTypes.includes(file.mimetype) &&
              file.size > maxImageSize
            ) {
              throw new Error("Image size should not exceed 3MB.");
            }

            if (
              allowedVideoTypes.includes(file.mimetype) &&
              file.size > maxVideoSize
            ) {
              throw new Error("Video size should not exceed 50MB.");
            }
          });

          return true;
        },
      },
    },
  });
};
