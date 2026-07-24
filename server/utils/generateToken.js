import jwt from "jsonwebtoken";

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || "opentrace_jwt_secret_fallback_key_2026";
  return jwt.sign({ id }, secret, {
    expiresIn: "7d",
  });
};

export default generateToken;

