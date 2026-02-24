import mongoose, { Types, Document, Schema, mongo } from "mongoose";

interface reactionDocument extends Document {
  postId: Types.ObjectId;
  userId: Types.ObjectId;
  type: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
enum REACTION_TYPE {
  LIKE = "LIKE",
  DISLIKE = "DISLIKE",
}

const reactionSchema = new Schema<reactionDocument>(
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
    type: {
      type: String,
      enum: Object.values(REACTION_TYPE),
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
export const ReactionModel = mongoose.model<reactionDocument>(
  "Reaction",
  reactionSchema,
);
