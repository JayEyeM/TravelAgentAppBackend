import { createFactory } from "hono/factory";
import { validator } from "hono/validator";
import { Client } from "../types/client";
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient,
} from "../database";
import type { Context } from "hono";
import type { AuthenticatedUser } from "../types/user";
import { snakeToCamel2, camelToSnake2 } from "../utils/caseConverter2";


const factory = createFactory();

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
      const user = c.get("user");
      console.log("Creating client for user:", user);

      const body = await c.req.valid("json");

      // Compose the client data object in camelCase for createClient
      const clientData = {
        ...body,
        userId: user.id,
        dateCreated: Date.now(),
        paymentDate: body.paymentDate || null,
        finalPaymentDate: body.finalPaymentDate || null,
        notes: body.notes || null,
      };

      console.log("clientData before createClient:", clientData);

      const newClient = await createClient(clientData);

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


// Get all clients for the current user
export const getAllClientsHandler = factory.createHandlers(async (c) => {
  console.log("Fetching all clients...");

  try {
    const user = c.get("user");

    console.log("User:", user);

    const clients = await getAllClients(user.id);
    
    return c.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return c.json({ error: "An error occurred while fetching clients" }, 500);
  }
});

// Get a single client by ID
export const getClientByIdHandler = factory.createHandlers(async (c) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");

    if (!id || isNaN(Number(id))) {
      return c.json({ error: "Valid client ID is required" }, 400);
    }

    const client = await getClientById(Number(id), user.id);

    if (!client) {
      return c.json({ error: "Client not found" }, 404);
    }

    return c.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    return c.json(
      { error: "An error occurred while fetching the client" },
      500
    );
  }
});


// Update a client by ID (only if owned by user)
export const updateClientByIdHandler = factory.createHandlers(async (c) => {
  try {
    const user = c.get("user");
    const id = c.req.param("id");

    if (!id || isNaN(Number(id))) {
      return c.json({ error: "Valid client ID is required" }, 400);
    }

    // Ensure the client exists and belongs to the user
    const existingClient = await getClientById(Number(id), user.id);
    if (!existingClient) {
      return c.json({ error: "Client not found or unauthorized" }, 404);
    }

    // Read and pass the body as camelCase (handled internally)
    const body = await c.req.json<Partial<Client>>();
    const updatedClient = await updateClient(Number(id), user.id, body);

    if (!updatedClient) {
      return c.json({ error: "Failed to update client" }, 500);
    }

    return c.json(updatedClient);
  } catch (error) {
    console.error("Error updating client:", error);
    return c.json(
      { error: "An error occurred while updating the client" },
      500
    );
  }
});


// Delete a client by ID (only if owned by user)
export const deleteClientByIdHandler = factory.createHandlers(async (c) => {
  try {
    const user = c.get("user");

    const id = c.req.param("id");

    if (!id || isNaN(Number(id))) {
      return c.json({ error: "Valid client ID is required" }, 400);
    }

    const existingClient = await getClientById(Number(id), user.id);
    if (!existingClient) {
      return c.json({ error: "Client not found or unauthorized" }, 404);
    }

    const deleted = await deleteClient(Number(id), user.id);

    if (!deleted) {
      return c.json({ error: "Client could not be deleted" }, 500);
    }


    return c.json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    return c.json(
      { error: "An error occurred while deleting the client" },
      500
    );
  }
});
