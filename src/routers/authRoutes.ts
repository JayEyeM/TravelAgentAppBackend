import { Hono } from "hono";
import supabase from "../utils/supabase"; 
import {
  getCookie,
  getSignedCookie,
  setCookie,
  setSignedCookie,
  deleteCookie,
} from 'hono/cookie'

const authRoutes = new Hono();

authRoutes.post("/login", async (c) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ error: "Missing Authorization token!" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");

  // Validate the token with Supabase
  const { data: user, error } = await supabase.auth.getUser(token);

  if (error || !user || !user.user) {
    return c.json({ error: "Invalid token. Unauthorized request." }, 401);
  }

  setCookie(c, 'session', token, {
    httpOnly: true,           // Makes the cookie inaccessible to JavaScript
    secure: false,            // Only sent over HTTPS
    sameSite: 'strict',       // Prevents CSRF attacks
    maxAge: 3600,             // Cookie expiration (1 hour)
    path: '/'                 // Cookie path
  });

  return c.json({
    message: "Login successful!",
    user: {
      id: user.user.id,
      email: user.user.email
    }
  }, 200);
});

export default authRoutes;
