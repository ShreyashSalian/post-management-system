import mongoose, { Types, Document, Schema, mongo } from "mongoose";

interface postDocument extends Document {
  userId: Types.ObjectId;
  caption: string;
  media: string[];
  likeCount: number;
  disLikeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<postDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    caption: {
      type: String,
    },
    media: [
      {
        type: String,
        required: true,
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
  },
  {
    timestamps: true,
  },
);

export const PostModel = mongoose.model<postDocument>("Post", postSchema);
