import express from "express";
import { loginValidation } from "../validations/login.validation";
import { validateAPI } from "../middlewares/validation.middleware";
import { login, logout } from "../controllers/auth.controller";
import { verifyUser } from "../middlewares/auth.middleware";

const authRouter = express.Router();
/* =====================================================
   LOGIN API
===================================================== */
authRouter.post("/login", loginValidation(), validateAPI, login);

/* =====================================================
   LOGOUT API
===================================================== */
authRouter.post("/logout", verifyUser, logout);

export default authRouter;
