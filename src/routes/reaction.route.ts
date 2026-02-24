import express from "express";
import { verifyUser } from "../middlewares/auth.middleware";
import { reactionValidation } from "../validations/reaction.validation";
import { addReaction } from "../controllers/reaction.controller";
import { validateAPI } from "../middlewares/validation.middleware";
const reactionRouter = express.Router();

/* =====================================================
   ADD REACTION LIKE AND DISLIKE
===================================================== */
reactionRouter.post(
  "/",
  verifyUser,
  reactionValidation(),
  validateAPI,
  addReaction,
);

export default reactionRouter;
