import cors from "cors";
import express from "express";
import { connectDatabase } from "./config/database.js";
import { env } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

async function bootstrap() {
  await connectDatabase();

  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin
    })
  );
  app.use(express.json());

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start backend", error);
  process.exit(1);
});
