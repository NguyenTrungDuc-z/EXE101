import { Router } from "express";
import { loginWithPhone, registerWithPhone, verifyRegisterOtp, loginWithGoogle, loginWithFacebook } from "../../controllers/auth/authController.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

export const authRouter = Router();

authRouter.post("/login", asyncHandler(loginWithPhone));
authRouter.post("/register", asyncHandler(registerWithPhone));
authRouter.post("/register/verify", asyncHandler(verifyRegisterOtp));
authRouter.post("/google", asyncHandler(loginWithGoogle));
authRouter.post("/facebook", asyncHandler(loginWithFacebook));
