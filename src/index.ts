// File path: src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { ClientRouter } from './routers/client';
import { BookingRouter } from './routers/booking';
import { cors } from 'hono/cors';
import authRoutes from './routers/authRoutes';
import { getCookie } from 'hono/cookie';
import supabase from './utils/supabase';
import { BasicCommissionRouter } from './handyTools/BasicCommissionCalculator/router';
import { HandyToolsUserRouter } from './handyTools/handyToolsAuth/router';
import type { MiddlewareHandler } from 'hono';
import { CommissionRouter } from './routers/commission';

const app = new Hono();
const port = parseInt(process.env.PORT ?? '8000');

// Authorization Middleware
const Authorize: MiddlewareHandler = async (c, next) => {
  console.log("Checking session...");
  console.log("Authorize middleware hit");

  let token = getCookie(c, 'session');
  const authHeader = c.req.header("Authorization");
  if (!token && authHeader?.startsWith("Bearer ")) {
    token = authHeader.replace("Bearer ", "");
  }
  if (!token) {
    return c.json({ error: "Unauthorized: No token" }, 401);
  }

  // Validate token with Supabase
  const { data: user, error } = await supabase.auth.getUser(token);
  console.log("🔍 Supabase getUser response:", { user, error });

  if (error || !user || !user.user) {
    return c.json({ error: "Invalid token. Unauthorized request." }, 401);
  }

  const { id, email, user_metadata, created_at } = user.user;

  if (!email) {
    return c.json({ error: "Unauthorized: Missing email in user data" }, 401);
  }

  // Store user and token in context for handlers
  c.set('user', { id, email, user_metadata, created_at });
  c.set('userToken', token);

  console.log("✅ Session Active for:", id, email);
  await next();
};


// Log all request headers
app.use('*', async (c, next) => {
  console.log("Request Headers:", Object.fromEntries(c.req.raw.headers.entries()));
  await next();
});

const allowedOrigins = [
  'http://localhost:5173',
  'https://travel-agent-app.onrender.com',
  // add any other allowed frontend URLs here
];

app.use('*', cors({
  origin: (origin, c) => {
    if (!origin) return null;
    if (allowedOrigins.includes(origin)) return origin;
    return null;
  },
  credentials: true,
  allowHeaders: [
    'Content-Type',
    'Authorization',
    'Accept',
    'X-Requested-With'
  ],
}));

// Protect all routes except auth
app.use('/clients', Authorize);
app.use('/bookings', Authorize);
app.use('/clients/*', Authorize);
app.use('/bookings/*', Authorize);
app.use('/commissions', Authorize);
app.use('/commissions/*', Authorize);

// Routes available
app.route('/clients', ClientRouter);
app.route('/bookings', BookingRouter);
app.route('/commissions', CommissionRouter);

app.route('/auth', authRoutes);

// public handy tools routes
app.route('/basic-commissions', BasicCommissionRouter);
app.route('/handy-tools-auth', HandyToolsUserRouter);

console.log(`Server is running on port ${port}`);
serve({ fetch: app.fetch, port });
