import userService from "../services/user.service.js";
import otpService from "../services/otp.service.js";
import { StatusCodes } from "http-status-codes";

import {
  successResponseBody,
  errorResponseBody,
} from "../utils/responseBody.js";

async function signUp(req, res) {
  try {
    const user = await userService.registerUser(req.body);

    // Send email verification OTP
    if (user.email) {
      try {
        await otpService.sendEmailVerificationOtp(user.email);
      } catch (error) {
        console.error(
          `Failed to send verification OTP to ${user.email}:`,
          error.message
        );
      }
    }

    const successResponse = {
      ...successResponseBody,
      message: "User registered successfully. Please verify your email.",
      data: user,
    };

    return res
      .status(StatusCodes.CREATED)
      .json(successResponse);

  } catch (error) {
    console.error("Registration error:", error);

    const errorResponse = {
      ...errorResponseBody,
      message: error.message || "Registration failed",
    };

    return res
      .status(StatusCodes.BAD_REQUEST)
      .json(errorResponse);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        ...errorResponseBody,
        message: "Email and password are required",
      });
    }

    const result = await userService.loginUser({
      email,
      password,
    });

    return res.status(StatusCodes.OK).json({
      ...successResponseBody,
      message: "Login successful",
      data: result,
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      ...errorResponseBody,
      message: error.message || "Login failed",
    });
  }
}



export default {
  signUp,
  login
};