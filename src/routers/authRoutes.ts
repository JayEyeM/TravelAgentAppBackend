import { Hono } from "hono";
import supabase from "../utils/supabase"; 
import { setCookie, deleteCookie, getCookie } from 'hono/cookie';

const authRoutes = new Hono();

// Login: Set session cookie
authRoutes.post("/login", async (c) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ error: "Missing Authorization token!" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");

  // Validate token with Supabase
  const { data: user, error } = await supabase.auth.getUser(token);

  if (error || !user || !user.user) {
    return c.json({ error: "Invalid token. Unauthorized request." }, 401);
  }

  // Set cookie (valid for 24 hours)
  setCookie(c, 'session', token, {
    httpOnly: true,        
    secure: process.env.NODE_ENV?.trim() === 'production',
    sameSite: 'strict',    
    maxAge: 86400, // 24 hours
    path: '/'              
  });

  return c.json({ 
    message: "Login successful!",
    user: {
      id: user.user.id,
      email: user.user.email
    }
  }, 200);
});

// Logout: Clears the session
authRoutes.post("/logout", async (c) => {
  deleteCookie(c, "session");
  return c.json({ message: "Logged out successfully!" }, 200);
});

// Check session validity
authRoutes.get("/session", async (c) => {
  const token = getCookie(c, "session");

  if (!token) {
    return c.json({ error: "No active session" }, 401);
  }

  return c.json({ message: "Session active", session: true }, 200);
});

export default authRoutes;
