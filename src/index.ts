import dotenv from 'dotenv';
dotenv.config();

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger'
import { UserRouter } from './routers/client';
import { BookingRouter } from './routers/booking';
import { cors } from 'hono/cors';
import authRoutes from './routers/authRoutes';
import { getCookie } from 'hono/cookie';
import supabase from './utils/supabase';
import { BasicCommissionRouter } from './handyTools/BasicCommissionCalculator/router';
import { HandyToolsUserRouter } from './handyTools/handyToolsAuth/router';

const app = new Hono();
const port = parseInt(process.env.PORT ?? '8000');

// Authorization Middleware
const Authorize = async (c: any, next: any) => {
  console.log("Checking session...");
  const token = getCookie(c, 'session');

  if (!token) {
    return c.json({ error: "Unauthorized: No session cookie" }, 401);
  }

  // Validate token with Supabase
  const { data: user, error } = await supabase.auth.getUser(token);

  console.log(1);
  

  if (error || !user || !user.user) {
    return c.json({ error: "Invalid token. Unauthorized request." }, 401);
  }

  c.set('user', user.user);

  console.log("Session Active:", token);
  await next();
};

app.use('*', logger());
app.use('*', cors({
  origin: 'http://localhost:5173',  
  credentials: true,  // Allows cookies to be sent
  allowHeaders: ['*'],
}));

// Protect all routes except auth
app.use('/clients', Authorize);
app.use('/bookings', Authorize);
app.use('/clients/*', Authorize);
app.use('/bookings/*', Authorize);

// Routes available
app.route('/clients', UserRouter);
app.route('/bookings', BookingRouter);
app.route('/auth', authRoutes);

// public handy tools routes
app.route('/basic-commissions', BasicCommissionRouter);
app.route('/handy-tools-auth', HandyToolsUserRouter);

console.log(`Server is running on port ${port}`);
serve({ fetch: app.fetch, port });
