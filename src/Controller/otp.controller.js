import otpService from "../services/otp.service.js";
import userService from "../services/user.service.js";

import { StatusCodes } from "http-status-codes";

import {
  successResponseBody,
  errorResponseBody,
} from "../utils/responseBody.js";

// Verify email OTP
async function verifyEmailOtp(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        ...errorResponseBody,
        message: "Email and OTP are required",
      });
    }

    // Verify OTP
    const isVerified = await otpService.verifyEmailVerificationOtp({
      email,
      otp,
    });

    if (!isVerified) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        ...errorResponseBody,
        message: "Invalid or expired OTP",
      });
    }

    // Update user email verification status
    await userService.verifyUserEmail(email);

    return res.status(StatusCodes.OK).json({
      ...successResponseBody,
      message: "Email verified successfully",
    });

  } catch (error) {
    console.error("OTP verification error:", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      ...errorResponseBody,
      message: error.message || "OTP verification failed",
    });
  }
}

// Resend email OTP
async function resendEmailOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        ...errorResponseBody,
        message: "Email is required",
      });
    }

    // Check whether user exists and is already verified
    const user = await userService.getUserByEmail(email);

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        ...errorResponseBody,
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      return res.status(StatusCodes.CONFLICT).json({
        ...errorResponseBody,
        message: "Email is already verified",
      });
    }

    await otpService.sendEmailVerificationOtp(email);

    return res.status(StatusCodes.OK).json({
      ...successResponseBody,
      message: "Verification OTP sent successfully",
    });

  } catch (error) {
    console.error("Resend OTP error:", error);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      ...errorResponseBody,
      message: error.message || "Failed to resend OTP",
    });
  }
}

export default {
  verifyEmailOtp,
  resendEmailOtp,
};