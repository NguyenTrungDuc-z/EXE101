import { Router } from "express";
import { loginWithPhone, verifyLoginOtp, registerWithPhone, loginWithGoogle, loginWithFacebook } from "../../controllers/auth/authController.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(loginWithPhone));
authRouter.post("/login/verify", asyncHandler(verifyLoginOtp));
authRouter.post("/register", asyncHandler(registerWithPhone));
authRouter.post("/google", asyncHandler(loginWithGoogle));
authRouter.post("/facebook", asyncHandler(loginWithFacebook));
