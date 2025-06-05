// file path: src/handyTools/handyToolsAuth/authJWTMiddleware.ts


import { MiddlewareHandler } from "hono";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const verifyJWT: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    c.set("userId", decoded.userId); 
    await next();
  } catch (error) {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
};
