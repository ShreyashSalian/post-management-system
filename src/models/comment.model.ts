import mongoose, { Types, Document, Schema, mongo } from "mongoose";

interface commentDocument extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  parentComment: Types.ObjectId;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<commentDocument>(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
export const CommentModel = mongoose.model<commentDocument>(
  "Comment",
  commentSchema,
);
