import { createFactory } from "hono/factory";
import { validator } from "hono/validator";
import { Client } from "../types/client";
import { createClient, getAllClients, getClientById, updateClient, deleteClient } from "../database";

const factory = createFactory();

// Create a new client
export const createUser = factory.createHandlers(
    validator('json', (value, c) => {
        console.log(value);

        if (!value.clientName || typeof value.clientName !== 'string') {
            return c.json({ error: 'clientName must be a string' }, 400);
        }

        if (!value.clientEmail || typeof value.clientEmail !== 'string') {
            return c.json({ error: 'clientEmail must be a string' }, 400);
        }

        return value;
    }),
    async (c) => {
        try {
            const body = await c.req.valid('json');

            const newClient = await createClient({
                ...body,
                dateCreated: Date.now(), 
                paymentDate: body.paymentDate || null, 
                finalPaymentDate: body.finalPaymentDate || null, 
                notes: body.notes || null,  
            } as Client);

            return c.json(newClient, 201);
        } catch (error) {
            console.error("Error creating client:", error);
            return c.json({ error: "An error occurred while creating the client" }, 500);
        }
    }
);

// Get all clients
export const getAllUsers = factory.createHandlers(async (c) => {
    console.log("Fetching clients...");
    try {
        const clients = await getAllClients();
        return c.json(clients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        return c.json({ error: "An error occurred while fetching clients" }, 500);
    }
});

// Get a client by ID
export const getUserById = factory.createHandlers(async (c) => {
    try {
        const id = c.req.param('id');
        if (!id || isNaN(Number(id))) {
            return c.json({ error: 'Valid client ID is required' }, 400);
        }

        const client = await getClientById(Number(id));
        if (!client) {
            return c.json({ error: 'Client not found' }, 404);
        }

        return c.json(client);
    } catch (error) {
        console.error('Error fetching client:', error);
        return c.json({ error: 'An error occurred while fetching client' }, 500);
    }
});

// Update a client by ID
export const updateUserById = factory.createHandlers(async (c) => {
    try {
        const id = c.req.param('id');
        if (!id || isNaN(Number(id))) {
            return c.json({ error: 'Valid client ID is required' }, 400);
        }

        const body = await c.req.json<Partial<Client>>();

        const updatedClient = await updateClient(Number(id), body);

        if (!updatedClient) {
            return c.json({ error: 'Client not found' }, 404);
        }

        return c.json(updatedClient);
    } catch (error) {
        console.error('Error updating client:', error);
        return c.json({ error: 'An error occurred while updating client' }, 500);
    }
});

// Delete a client by ID
export const deleteUserById = factory.createHandlers(async (c) => {
    try {
        const id = c.req.param('id');
        if (!id || isNaN(Number(id))) {
            return c.json({ error: 'Valid client ID is required' }, 400);
        }

        const deleted = await deleteClient(Number(id));
        if (!deleted) {
            return c.json({ error: 'Client not found' }, 404);
        }

        return c.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Error deleting client:', error);
        return c.json({ error: 'An error occurred while deleting client' }, 500);
    }
});
