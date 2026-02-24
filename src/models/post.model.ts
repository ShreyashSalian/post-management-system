import mongoose, { Types, Document, Schema } from "mongoose";

interface MediaType {
  url: string;
  publicId: string;
}

interface postDocument extends Document {
  userId: Types.ObjectId;
  caption: string;
  media: MediaType[];
  likeCount: number;
  disLikeCount: number;
  commentCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<postDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caption: {
      type: String,
    },
    media: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
    disLikeCount: {
      type: Number,
      default: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const PostModel = mongoose.model<postDocument>("Post", postSchema);
