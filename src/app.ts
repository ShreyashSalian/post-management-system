// import express from "express";
// import path from "path";

// import cors from "cors";
// import helmet from "helmet";
// import cookieParser from "cookie-parser";
// import i18n from "./config/i18n";
// import morgan from "morgan";
// import indexRouter from "./routes/index.routes";

// const app = express();
// app.use(
//   cors({
//     origin: process.env.ORIGIN,
//     methods: "GET,PUT,DELETE,PATCH,HEAD,POST",
//     credentials: true,
//   }),
// );

// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(helmet());
// app.use(i18n.init);
// app.use(morgan("dev"));
// app.use(express.static(path.join(path.resolve(), "public")));
// app.use("/images", express.static("/public/images"));

// app.set("view engine", "hbs");
// app.set("views", "./src/views");

// app.use(indexRouter);
// // Error handler (must be last)

// export default app;

import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import swaggerUI from "swagger-ui-express";
import cookieParser from "cookie-parser";
import i18n from "./config/i18n";
import indexRouter from "./routes/index.routes";
import logger from "./core/loggers";
import { swaggersDocuments } from "./utils/swagger";

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: "GET,PUT,DELETE,PATCH,HEAD,POST",
    credentials: true,
  }),
);

// Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));

// Security & utils
app.use(cookieParser());
app.use(helmet());
app.use(i18n.init);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggersDocuments));
// ✅ Winston Request Logger Middleware
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`,
    );
  });

  next();
});

// Static files
app.use(express.static(path.join(path.resolve(), "public")));
app.use("/images", express.static(path.join(path.resolve(), "public/images")));

// View engine
app.set("view engine", "hbs");
app.set("views", "./src/views");

// Routes
app.use(indexRouter);

// ✅ 404 Handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ✅ Global Error Handler
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    logger.error(err.stack || err.message);

    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal Server Error",
    });
  },
);

export default app;
