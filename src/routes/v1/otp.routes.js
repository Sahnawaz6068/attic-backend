import express from "express";
import otpController from "../../Controller/otp.controller.js";

const router = express.Router();

router.post("/verify-email", otpController.verifyEmailOtp);
router.post("/resend-otp", otpController.resendEmailOtp);

export default router;