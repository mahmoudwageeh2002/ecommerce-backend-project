import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";

import authRoutes from "./modules/auth/auth.routes.js";

import {
  notFoundHandler,
} from "./middlewares/notFound.middleware.js";

import {
  errorHandler,
} from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: env.CLIENT_URL,

    credentials: true,
  }),
);

app.use(helmet());

app.use(compression());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

app.use(
  "/api/v1/auth",
  authRoutes,
);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;