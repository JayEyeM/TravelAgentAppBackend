import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger'
import { UserRouter } from './routers/user';

const app = new Hono();
const port = parseInt(process.env.PORT ?? '8000');

app.use('*', logger());

app.route('/clients', UserRouter);

console.log(`Server is running on port ${port}`);
serve({
  fetch: app.fetch,
  port,
});


/**
 * App makes request -> router -> middleware -> handler -> middleware -> router -> app
 */