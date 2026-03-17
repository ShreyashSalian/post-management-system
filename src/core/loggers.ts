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
import fs from "fs";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";

// Only create logs folder in production
const logDir = path.join(process.cwd(), "logs");

if (isProduction && !fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Create transports array dynamically
const loggerTransports: any[] = [
  new transports.Console(), // Always log to console
];

// Add file transports only in production
if (isProduction) {
  loggerTransports.push(
    new transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
    new transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
  );
}

const logger = createLogger({
  level: isProduction ? "info" : "debug", // more logs in dev
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.printf(({ timestamp, level, message, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    }),
  ),
  transports: loggerTransports,
});

export default logger;
