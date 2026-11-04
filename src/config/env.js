
import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "JWT_SECRET"
];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const config = {
  port: Number(process.env.PORT),
  mongoUri: process.env.MONGO_URI,

  // SMTP Configuration
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT),
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  jwtAccessSecret: process.env.JWT_SECRET,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
};

export default config;
