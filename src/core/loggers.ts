// import { createLogger, transports, format } from "winston";
// import fs from "fs";
// import path from "path";

// const logDir = path.join(process.cwd(), "logs");

// // Create logs folder if not exists
// if (!fs.existsSync(logDir)) {
//   fs.mkdirSync(logDir);
// }

// const logger = createLogger({
//   level: "info",
//   format: format.combine(
//     format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
//     format.errors({ stack: true }),
//     format.printf(({ timestamp, level, message, stack }) => {
//       return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
//     }),
//   ),
//   transports: [
//     new transports.Console(),
//     new transports.File({
//       filename: path.join(logDir, "combined.log"),
//     }),
//     new transports.File({
//       filename: path.join(logDir, "error.log"),
//       level: "error",
//     }),
//   ],
// });

// export default logger;

//-------------------------------------------------------------
import { createLogger, transports, format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import fs from "fs";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

const logDir = path.join(process.cwd(), "logs");

// Create logs folder only in production
if (isProduction && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Common log format
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  }),
);

// Create transports
const loggerTransports: any[] = [
  new transports.Console({
    format: format.combine(format.colorize(), logFormat), // colored logs in console
  }),
];

// Add rotating file logs only in production
if (isProduction) {
  loggerTransports.push(
    // All logs (daily)
    new DailyRotateFile({
      filename: path.join(logDir, "application-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: true, // compress old logs
      maxSize: "20m", // rotate if >20MB
      maxFiles: "14d", // keep logs for 14 days
    }),

    // Error logs (separate file)
    new DailyRotateFile({
      filename: path.join(logDir, "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d", // keep error logs longer
    }),
  );
}

const logger = createLogger({
  level: isProduction ? "info" : "debug",
  format: logFormat,
  transports: loggerTransports,
});

export default logger;
