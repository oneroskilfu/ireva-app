import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET || "secret";

export function signToken(payload: object) {
  return jwt.sign(payload, secret, { expiresIn: "1h" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, secret);
}