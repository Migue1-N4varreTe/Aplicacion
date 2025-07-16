import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "la-economica-secret-key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

const refreshToken = (token) => {
  try {
    const decoded = verifyToken(token);
    delete decoded.iat;
    delete decoded.exp;
    return generateToken(decoded);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

export { generateToken, verifyToken, refreshToken };
