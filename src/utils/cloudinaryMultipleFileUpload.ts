import cloudinary from "../config/cloudinary.config";
import streamifier from "streamifier";

interface UploadResponse {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
}

const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedVideoTypes = ["video/mp4", "video/mov", "video/avi", "video/mkv"];

const getResourceType = (mimetype: string): "image" | "video" => {
  if (allowedImageTypes.includes(mimetype)) return "image";
  if (allowedVideoTypes.includes(mimetype)) return "video";

  throw new Error(`Unsupported file type: ${mimetype}`);
};

export const uploadFilesToCloudinary = async (
  files: Express.Multer.File | Express.Multer.File[],
  folder = "postManagement",
): Promise<UploadResponse[]> => {
  try {
    if (!files) {
      throw new Error("No file(s) provided");
    }

    const fileArray = Array.isArray(files) ? files : [files];

    const uploadPromises = fileArray.map((file) => {
      return new Promise<UploadResponse>((resolve, reject) => {
        const resourceType = getResourceType(file.mimetype);

        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
            transformation:
              resourceType === "image"
                ? [{ quality: "auto", fetch_format: "auto" }]
                : undefined,
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error("Upload failed"));

            resolve({
              url: result.secure_url,
              publicId: result.public_id,
              resourceType,
            });
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
};
