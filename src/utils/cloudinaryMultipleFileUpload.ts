import cloudinary from "../config/cloudinary.config";
import streamifier from "streamifier";

export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder = "onlineShoppie",
): Promise<{ url: string; publicId: string }[]> => {
  if (!files || files.length === 0) {
    throw new Error("No files received for upload");
  }

  const uploadPromises = files.map(
    (file) =>
      new Promise<{ url: string; publicId: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("Cloudinary upload failed"));

            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          },
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      }),
  );

  return Promise.all(uploadPromises);
};
