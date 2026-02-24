import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { transporter } from "../config/mail";

const APP_URL = "http://localhost:5173";

const forgotPasswordMail = async (
  token: string,
  email: string,
): Promise<void> => {
  try {
    const templatePath = path.join(
      process.cwd(),
      "src/views/forgotPassword.hbs",
    );

    const source = fs.readFileSync(templatePath, "utf-8");
    const template = handlebars.compile(source);

    const html = template({
      urlorcode: `${APP_URL}/${token}`,
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your password",
      html,
    });
  } catch (err) {
    console.error("Forgot password email error:", err);
  }
};

const verifyEmail = async (email: string, token: string): Promise<void> => {
  try {
    const templatePath = path.join(process.cwd(), "src/views/verifyEmail.hbs");

    const source = fs.readFileSync(templatePath, "utf-8");
    const template = handlebars.compile(source);

    const html = template({
      urlorcode: `${APP_URL}/verifyEmail/${token}`,
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html,
    });
  } catch (err) {
    console.error("Verify email error:", err);
  }
};

// interface OrderMailPayload {
//   to: string;
//   subject: string;
//   html: string;
// }

// const sendOrderMail = async ({
//   to,
//   subject,
//   html,
// }: OrderMailPayload): Promise<void> => {
//   await transporter.sendMail({
//     from: `"MyStore" <${process.env.GMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   });
// };

export { forgotPasswordMail, verifyEmail };
