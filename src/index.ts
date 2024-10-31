import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { UserRouter } from './routers/user';
import { getAllClients, saveClients } from './database'; // Import saveClients and getAllClients

const app = new Hono();
const port = 4000;

app.route('/clients', UserRouter);

console.log(`Server is running on port ${port}`);
serve({
  fetch: app.fetch,
  port,
});

// Ensure clients are saved on shutdown
process.on('SIGINT', async () => {
  console.log('Saving clients and shutting down...');
  const clients = await getAllClients(); 
  await saveClients(clients); 
  console.log('Clients saved successfully.');
  process.exit();
});
