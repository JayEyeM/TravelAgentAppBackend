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

const app = new Hono();
const port = parseInt(process.env.PORT ?? '8000');

const Authorize= async (c:any, next:any) => {
  const token = getCookie(c,'session');
  console.log("Token:", token);
  await next();
}

app.use('*', Authorize);
app.use('*', logger());
app.use('*', cors({
  origin: 'localhost:5173',
  allowHeaders: ['*'],
}));

app.route('/clients', UserRouter);
app.route('/bookings', BookingRouter);
app.route('/auth', authRoutes);

console.log(`Server is running on port ${port}`);
console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log("Port:", process.env.PORT);

serve({
  fetch: app.fetch,
  port,
});
