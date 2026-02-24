// // utils/cloudinaryUpload.ts

// import fs from "fs";
// import cloudinary from "../config/cloudinary.config";

// export const uploadSingleImage = (
//   file: Express.Multer.File,
//   folder = "onlineShoppie",
// ): Promise<{ url: string; publicId: string }> => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       { folder },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve({ url: result!.secure_url, publicId: result!.public_id });
//       },
//     );

//     fs.readFile(file.path, (err, data) => {
//       if (err) return reject(err);
//       stream.end(data); // send buffer to Cloudinary
//     });
//   });
// };

import cloudinary from "../config/cloudinary.config";

export const uploadSingleImage = (
  file: Express.Multer.File,
  folder = "postManagement",
): Promise<{ url: string; publicId: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result!.secure_url,
          publicId: result!.public_id,
        });
      },
    );

    stream.end(file.buffer); // ✅ FIX
  });
};
