import mongoose, { Types, Document, Schema } from "mongoose";

interface LoginDocument extends Document {
  email: string;
  userId: Types.ObjectId;
  deviceId: string;
  userAgent: string;
  ipAddress: string;
  accessToken: string;
  refreshToken: string;
  permission: string[];
  isActive: Boolean;
  createdAt: Date;
  updatedAt: Date;
}

const loginSchema = new Schema<LoginDocument>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    deviceId: { type: String, required: true },
    userAgent: String,
    ipAddress: String,
    email: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    permission: {
      type: [String],
      default: [],
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);
// IMPORTANT: one device = one active login
loginSchema.index({ userId: 1, deviceId: 1, isActive: 1 });

export const LoginModel = mongoose.model<LoginDocument>("Login", loginSchema);
