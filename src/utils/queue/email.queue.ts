import { Queue } from "bullmq";
import { redisConnection } from "../../config/ioredis";

export const emailQueue = new Queue("email-queue", {
  connection: redisConnection,
});
