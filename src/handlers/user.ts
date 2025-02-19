import { createFactory } from "hono/factory";
import { validator } from "hono/validator";
import { Client } from "../types/client";
import { createClient, getAllClients, getClientById, updateClient, deleteClient } from "../database";

const factory = createFactory();

export const createUser = factory.createHandlers(validator('json', (value, c) => {
    // const body = value['body']
    console.log(value);

    if (!value.clientName || typeof value.clientName !== 'string') {
        return c.text('Name must be a string', 400);
    }

    if (!value.clientName || !value.clientEmail) {
        return c.json({ message: 'Missing name or email' }, 400);
    }

    return value;
}), async (c) => {
    const body = await c.req.valid('json');

    // if (!body.clientName || !body.clientEmail) {
    //     return c.json({ message: 'Missing name or email' }, 400);
    // }

    const newClient = await createClient(body as unknown as Client);
    return c.json(newClient, 201);
});

export const getAllUsers = factory.createHandlers(async (c) => {
    const clients = await getAllClients();
    return c.json(clients);
});

export const getUserById = factory.createHandlers(async (c) => {
    try {
        const id = parseInt(c.req.param('id'), 10);
        if (isNaN(id)) {
            return c.json({ message: 'Invalid client ID' }, 400);
        }

        const client = await getClientById(id);
        if (!client) {
            return c.json({ message: 'Client not found' }, 404);
        }

        return c.json(client);
    } catch (error) {
        console.error('Error fetching client:', error);
        return c.json({ message: 'An error occurred' }, 500);
    }
});

// Update a client by ID
export const updateUserById = factory.createHandlers(async (c) => {
    try {
        const id = parseInt(c.req.param('id'), 10);
        const body = await c.req.json<Partial<Client>>();

        if (isNaN(id)) {
            return c.json({ message: 'Invalid client ID' }, 400);
        }

        // const existingClient = await getClientById(id);
        // if (!existingClient) {
        //     return c.json({ message: 'Client not found' }, 404);
        // }

        /**
         * 
         * rescurisvely merge two objects together
         * 
         * const original = {
         *  name: 'bob',
         *  age: 50,
         *  billing: {
         *    address: 'town'
         *    postalCode: 'code' 
         *  }
         * }
         * 
         * const requestBody = {
         *  age: 60,
         *  billing: {
         *    postalCode: 'A1A1A1'
         *  }
         * }
         * 
         * 
         * const updated = {
         *   name: 'bob',
         *   age: 60,
         *   billing: {
         *     address: 'town'
         *     postalCode: 'A1A1A1'
         *   }
         * }
         * 
         * 
         * 
         */

        const updatedClient = await updateClient(id as number, body as Required<Partial<Client>>);

        if (!updatedClient) {
            return c.json({ message: 'Client not found' }, 404);
        }

        return c.json(updatedClient);
    } catch (error) {
        console.error('Error updating client:', error);
        return c.json({ message: 'An error occurred' }, 500);
    }
});

// Delete a client by ID
export const deleteUserById = factory.createHandlers(async (c) => {
    try {
        const id = parseInt(c.req.param('id'), 10);

        if (isNaN(id)) {
            return c.json({ message: 'Invalid client ID' }, 400);
        }

        const deleted = await deleteClient(id);
        if (!deleted) {
            return c.json({ message: 'Client not found' }, 404);
        }

        return c.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Error deleting client:', error);
        return c.json({ message: 'An error occurred' }, 500);
    }
});