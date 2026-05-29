import { Router } from "express";
import { chatAI } from "../../controllers/chat.controller.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";

export const chatRouter = Router();

chatRouter.post("/", asyncHandler(chatAI));
