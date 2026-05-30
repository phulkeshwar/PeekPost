import jwt from "jsonwebtoken";
import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyToken = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies?.accessToken;

  if (!token) {
    const error = new Error("Authentication required");
    error.status = 401;
    throw error;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-password -refreshToken");

    if (!user || user.isDeactivated) {
      const error = new Error("Invalid user session");
      error.status = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (err) {
    const error = new Error("Invalid or expired authentication token");
    error.status = 401;
    next(error);
  }
});

export const optionalAuth = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : req.cookies?.accessToken;

  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId).select("-password -refreshToken");
    if (user && !user.isDeactivated) {
      req.user = user;
    }
  } catch (_error) {
    req.user = null;
  }

  return next();
});