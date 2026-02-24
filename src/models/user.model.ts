import mongoose, { Document, Schema, Model } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =====================================================
   INTERFACE
===================================================== */

export interface userDocument extends Document {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "user" | "admin" | "manager";
  contactNumber: string;
  failedLoginAttempts: number;
  lockUntil?: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  profileImage: {
    url: string | null;
    publicId: string | null;
  };

  permission: string[];

  refreshToken?: string;
  resetPasswordOtp?: string;
  resetPasswordOtpExpiry?: Date;

  isEmailVerified: boolean;
  emailVerificationToken?: string | null;

  comparePassword(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

/* =====================================================
   IMAGE SUB-SCHEMA (Reusable)
===================================================== */

const imageSchema = new Schema(
  {
    url: { type: String, default: null },
    publicId: { type: String, default: null },
  },
  { _id: false },
);

/* =====================================================
   USER ROLE ENUM
===================================================== */

export enum USER_ROLE {
  USER = "user",
  ADMIN = "admin",
  MANAGER = "manager",
}

/* =====================================================
   MAIN USER SCHEMA
===================================================== */

const userSchema = new Schema<userDocument>(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    contactNumber: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // do not return password by default
    },

    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.USER,
    },

    permission: {
      type: [String],
      default: [],
    },

    failedLoginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    profileImage: {
      type: imageSchema,
      default: () => ({}), // Always object, never null
    },

    refreshToken: {
      type: String,
      select: false,
    },
    resetPasswordOtp: {
      type: String,
      select: false,
    },

    resetPasswordOtpExpiry: {
      type: Date,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  const user = this as userDocument;
  if (!user.isModified("password")) {
    return next;
  } else {
    try {
      user.password = await bcrypt.hash(user.password, 12);
    } catch (err: any) {
      throw new Error(err);
    }
  }
});

userSchema.methods.comparePassword = async function (
  password: string,
): Promise<Boolean> {
  const user = this as userDocument;
  return bcrypt.compare(password, user.password);
};

userSchema.methods.generateAccessToken = function (): string {
  const user = this as userDocument;
  const token = process.env.ACCESS_TOKEN;
  if (!token) {
    throw new Error("Please enter the token");
  }
  return jwt.sign(
    {
      userId: user?._id,
      email: user?.email,
      firstName: user?.firstName,
      permission: user?.permission,
    },
    token,
    {
      expiresIn: "5h",
    },
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  const user = this as userDocument;
  const token = process.env.REFRESH_TOKEN;
  if (!token) {
    throw new Error("No refresh token found");
  }
  return jwt.sign(
    {
      userId: user?._id,
      email: user?.email,
      firstName: user?.firstName,
      permission: user?.permission,
    },
    token,
    {
      expiresIn: "10d",
    },
  );
};

export const UserModel = mongoose.model<userDocument>("User", userSchema);
