import { Hono } from "hono";
import { getClientById, getAllClients, createClient, updateClient, deleteClient } from "../database";
import { Client } from "../types/client"; 

export const UserRouter = new Hono();

// Create a new client
UserRouter.post('/', async (c) => {
    const body = await c.req.json<Client>();

    if (!body.clientName || !body.clientEmail) {
        return c.json({ message: 'Missing name or email' }, 400);
    }

    const newClient = await createClient(body);

    return c.json(newClient, 201);
});

// Get a client by ID
UserRouter.get('/:id', async (c) => {
    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
        return c.json({ message: 'Invalid client ID' }, 400);
    }

    const client = await getClientById(id);

    if (!client) {
        return c.json({ message: 'Client not found' }, 404);
    }

    return c.json(client);
});

// Get all clients
UserRouter.get('/', async (c) => {
    const clients = await getAllClients();
    return c.json(clients);
});

// Update client
UserRouter.patch('/:id', async (c) => {
    const id = parseInt(c.req.param('id'), 10);
    const body = await c.req.json<Partial<Client>>();

    if (isNaN(id)) {
        return c.json({ message: 'Invalid client ID' }, 400);
    }

    const existingClient = await getClientById(id);
    if (!existingClient) {
        return c.json({ message: 'Client not found' }, 404);
    }

    const updatedClientData = { ...existingClient, ...body };
    const updatedClient = await updateClient(updatedClientData);

    return c.json(updatedClient);
});

// Delete client
UserRouter.delete('/:id', async (c) => {
    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
        return c.json({ message: 'Invalid client ID' }, 400);
    }

    const deleted = await deleteClient(id);

    if (!deleted) {
        return c.json({ message: 'Client not found' }, 404);
    }

    return c.json({ message: 'Client deleted successfully' });
});
