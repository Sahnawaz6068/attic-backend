import bcrypt from "bcrypt";
import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import config from "../config/env.js";

async function registerUser(userData) {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
  } = userData;

  // Check existing user
  const existingUser = await User.findOne({
    $or: [
      ...(email ? [{ email: email.toLowerCase().trim() }] : []),
      ...(phone ? [{ phone: phone.trim() }] : []),
    ],
  });

  if (existingUser) {
    throw new Error("User already exists with this email or phone");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
console.log(hashedPassword)
  // Create user
  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password: hashedPassword,
  });

  // Remove sensitive fields from response
  const userObject = user.toObject();
  delete userObject.password;

  return userObject;
}

async function getUserByEmail(email) {
  return await User.findOne({
    email: email.toLowerCase().trim(),
  });
}

async function verifyUserEmail(email) {
  return await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { emailVerified: true },
    { returnDocument: "after", }
  );
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    user.password
  );

  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.emailVerified) {
    const error = new Error("Please verify your email first");
    error.statusCode = 403;
    throw error;
  }

  const accessToken = jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
    },
    config.jwtAccessSecret,
    {
      expiresIn: "1d",
    }
  );

  user.lastLogin = new Date();
  await user.save();

  return {
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    },
    accessToken,
  };
}

export default {
  registerUser,
  getUserByEmail,
  verifyUserEmail,
  loginUser
};
