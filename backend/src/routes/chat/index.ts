import { Router } from "express";
import { chatAI } from "../../controllers/chat.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { authenticate } from "../../middleware/auth.js";

export const chatRouter = Router();

chatRouter.use(authenticate);

chatRouter.post("/", asyncHandler(chatAI));
