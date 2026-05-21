import { Router } from "express";
import { adminRouter } from "./admin/index.js";
import { userRouter } from "./user/index.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

apiRouter.use("/admin", adminRouter);
apiRouter.use("/user", userRouter);
