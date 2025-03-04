import dotenv from 'dotenv';
dotenv.config();

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger'
import { UserRouter } from './routers/client';
import { BookingRouter } from './routers/booking';
import { cors } from 'hono/cors';

const app = new Hono();
const port = parseInt(process.env.PORT ?? '8000');

app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
}));

app.route('/clients', UserRouter);
app.route('/bookings', BookingRouter);

console.log(`Server is running on port ${port}`);
console.log("Supabase URL:", process.env.SUPABASE_URL);
console.log("Port:", process.env.PORT);

serve({
  fetch: app.fetch,
  port,
});
