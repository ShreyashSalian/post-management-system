import mongoose, { Types, Document, Schema, mongo } from "mongoose";

interface commentDocument extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  parentComment?: Types.ObjectId | null;
  description: string;
  isDeleted: boolean;
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
      default: null,
      // required: true,
    },
    description: {
      type: String,
      required: true,
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
commentSchema.index({ postId: 1, parentComment: 1 });
commentSchema.index({ createdAt: -1 });
export const CommentModel = mongoose.model<commentDocument>(
  "Comment",
  commentSchema,
);
