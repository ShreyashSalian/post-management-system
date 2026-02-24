import { Worker } from "bullmq";
import { redisConnection } from "../../config/ioredis";
import { forgotPasswordMail, verifyEmail } from "../sendMail";

new Worker(
  "email-queue",
  async (job) => {
    const { name, data } = job;
    switch (name) {
      case "FORGOT_PASSWORD":
        await forgotPasswordMail(data?.email, data?.otp);
        break;
      case "VERIFY_EMAIL":
        await verifyEmail(data?.email, data.token);
        break;
      // case "ORDER_PLACED":
      //   const { email, order } = job.data;

      // await sendOrderMail({
      //   to: email,
      //   subject: "Your Order Has Been Placed 🎉",
      //   html: orderPlacedTemplate({
      //     orderId: order.orderId,
      //     amount: order.payableAmount,
      //     items: order.items,
      //   }),
      // });
      default:
        throw new Error("Unknown job type");
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, //send 5 emails at a time
  },
);
