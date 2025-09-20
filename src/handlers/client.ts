import { createFactory } from "hono/factory";
import { validator } from "hono/validator";
import { Client } from "../types/client";
import {
  createClient as dbCreateClient,
  getAllClients as dbGetAllClients,
  getClientById as dbGetClientById,
  updateClient as dbUpdateClient,
  deleteClient as dbDeleteClient,
} from "../database";
import type { MiddlewareHandler, Context } from "hono";
import { snakeToCamel2, camelToSnake2 } from "../utils/caseConverter2";
import { createClient } from '@supabase/supabase-js';
import supabase from '../utils/supabase';

const factory = createFactory();

// Helper to get a Supabase client for the current request
const supabaseWithToken = (token: string) => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: `Bearer ${token}` }
      }
    }
  );
};

// --- Helper to get user & token from context ---
const getUserAndToken = (c: Context) => {
  const user = c.get<any>("user");
  const token = c.get<any>("userToken") as string;
  if (!user || !token) throw new Error("Missing user or token in context");
  return { user, token };
};

// Create a new client
export const createClientHandler = factory.createHandlers(
  validator("json", (value, c) => {
    console.log("Validating createClient payload:", value);

    if (!value.clientName || typeof value.clientName !== "string") {
      return c.json({ error: "clientName must be a string" }, 400);
    }

    if (!value.clientEmail || typeof value.clientEmail !== "string") {
      return c.json({ error: "clientEmail must be a string" }, 400);
    }

    return value;
  }),
  async (c) => {
    try {
      const { user, token } = getUserAndToken(c);
      console.log("Creating client for user:", user);

      const body = await c.req.valid("json");

      const clientData = {
        ...body,
        userId: user.id,
        dateCreated: Date.now(),
        paymentDate: body.paymentDate || null,
        finalPaymentDate: body.finalPaymentDate || null,
        notes: body.notes || null,
      };

      console.log("clientData before createClient:", clientData);

      const supabaseReq = supabaseWithToken(token);
      const newClient = await dbCreateClient(clientData, supabaseReq);

      console.log("Client created:", newClient);
      return c.json(newClient, 201);
    } catch (error) {
      console.error("Error creating client:", error);
      return c.json(
        { error: "An error occurred while creating the client" },
        500
      );
    }
  }
);

// Get all clients
export const getAllClientsHandler = factory.createHandlers(async (c) => {
  try {
    const { user, token } = getUserAndToken(c);

    const supabaseReq = supabaseWithToken(token);
    const clients = await dbGetAllClients(user.id, supabaseReq);

    return c.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return c.json({ error: "An error occurred while fetching clients" }, 500);
  }
});

// Get single client by ID
export const getClientByIdHandler = factory.createHandlers(async (c) => {
  try {
    const { user, token } = getUserAndToken(c);
    const id = c.req.param("id");

    if (!id || isNaN(Number(id))) {
      return c.json({ error: "Valid client ID is required" }, 400);
    }

    const supabaseReq = supabaseWithToken(token);
    const client = await dbGetClientById(Number(id), user.id, supabaseReq);

    if (!client) return c.json({ error: "Client not found" }, 404);

    return c.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    return c.json({ error: "An error occurred while fetching the client" }, 500);
  }
});

// Update client by ID
export const updateClientByIdHandler = factory.createHandlers(async (c) => {
  try {
    const { user, token } = getUserAndToken(c);
    const id = c.req.param("id");

    if (!id || isNaN(Number(id))) return c.json({ error: "Valid client ID is required" }, 400);

    const supabaseReq = supabaseWithToken(token);
    const existingClient = await dbGetClientById(Number(id), user.id, supabaseReq);

    if (!existingClient) return c.json({ error: "Client not found or unauthorized" }, 404);

    const body = await c.req.json<Partial<Client>>();
    const updatedClient = await dbUpdateClient(Number(id), user.id, body, supabaseReq);

    if (!updatedClient) return c.json({ error: "Failed to update client" }, 500);

    return c.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    return c.json({ error: "An error occurred while updating the client" }, 500);
  }
});

// Delete client by ID
export const deleteClientByIdHandler = factory.createHandlers(async (c) => {
  try {
    const { user, token } = getUserAndToken(c);
    const id = c.req.param("id");

    if (!id || isNaN(Number(id))) return c.json({ error: "Valid client ID is required" }, 400);

    const supabaseReq = supabaseWithToken(token);
    const existingClient = await dbGetClientById(Number(id), user.id, supabaseReq);

    if (!existingClient) return c.json({ error: "Client not found or unauthorized" }, 404);

    const deleted = await dbDeleteClient(Number(id), user.id, supabaseReq);

    if (!deleted) return c.json({ error: "Client could not be deleted" }, 500);

    return c.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return c.json({ error: "An error occurred while deleting the client" }, 500);
  }
});
