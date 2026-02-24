import express from "express";
import path from "path";

import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import i18n from "./config/i18n";
import morgan from "morgan";
import indexRouter from "./routes/index.routes";

const app = express();
app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: "GET,PUT,DELETE,PATCH,HEAD,POST",
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());
app.use(i18n.init);
app.use(morgan("dev"));
app.use(express.static(path.join(path.resolve(), "public")));
app.use("/images", express.static("/public/images"));

app.set("view engine", "hbs");
app.set("views", "./src/views");

app.use(indexRouter);
// Error handler (must be last)

export default app;
