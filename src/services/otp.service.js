
import nodemailer from "nodemailer";
import OTP from "../model/otp.model.js";
import { generateOTP } from "../utils/otp.utils.js";
import config from "../config/env.js";

const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: Number(config.smtpPort),
  secure: Number(config.smtpPort) === 465,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPassword,
  },
});

async function sendEmailVerificationOtp(email) {
  const normalizedEmail = email.toLowerCase().trim();

  // Generate OTP
  const otp = generateOTP();

  // Store OTP
  await OTP.findOneAndUpdate(
    { email: normalizedEmail },
    {
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      verified: false,
    },
    {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    }
  );

  // Send email
  await transporter.sendMail({
    from: config.smtpUser,
    to: normalizedEmail,
    subject: "Verify your email - The Attic",
    html: `
      <div>
        <h2>Email Verification</h2>
        <p>Your verification OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP expires in 5 minutes.</p>
      </div>
    `,
  });

  return {
    message: "Verification OTP sent successfully",
  };
}

async function verifyEmailVerificationOtp({ email, otp }) {
  const normalizedEmail = email.toLowerCase().trim();

  const otpRecord = await OTP.findOne({
    email: normalizedEmail,
    otp: otp.toString(),
    verified: false,
    expiresAt: { $gt: new Date() },
  });

  if (!otpRecord) {
    return false;
  }

  otpRecord.verified = true;
  await otpRecord.save();

  return true;
}

export default {
  sendEmailVerificationOtp,
  verifyEmailVerificationOtp
};
