import mongoose, { Types } from "mongoose";

interface UserDetail {
  userId: Types.ObjectId;
  email: string;
  accessToken: string;
  permission: string[];
}

import * as express from "express-serve-static-core";

declare global {
  namespace Express {
    interface Request {
      user?: UserDetail;
    }
  }
}
