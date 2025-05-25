import { Request, Response } from "express";
import pool from "../config/db";
import { signToken } from "../utils/jwt";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const result = await pool.query("SELECT * FROM users WHERE email = $1 AND password = $2", [email, password]);
  if (result.rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const user = result.rows[0];
  const token = signToken({ userId: user.id, role: user.role, tenantId: user.tenant_id });
  res.json({ token });
}