import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized to access this route",
      });
    }

    try {
      const secret = process.env.JWT_SECRET || "opentrace_jwt_secret_fallback_key_2026";
      const decoded = jwt.verify(token, secret);
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User account no longer exists" });
      }
      req.user = user;
      next();
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Token is not valid" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

