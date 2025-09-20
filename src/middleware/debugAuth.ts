// File: src/middleware/debugAuth.ts
import type { MiddlewareHandler } from "hono";

export const debugAuth: MiddlewareHandler = async (c, next) => {
  console.log("🔍 Incoming request:", c.req.method, c.req.path);

  // Dump headers (helps confirm if Authorization header or cookies are present)
  console.log("🔍 Headers:", Object.fromEntries(c.req.raw.headers.entries()));

  // Dump whatever's in c.get("user") before hitting route
  console.log("🔍 c.get('user') before next():", c.get("user"));

  await next();

  // Log again after route/middleware runs
  console.log("🔍 c.get('user') after next():", c.get("user"));
};
