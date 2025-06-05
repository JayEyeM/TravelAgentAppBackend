// File: src/handyTools/BasicCommissionCalculator/handlers.ts


import { createFactory } from "hono/factory";
import { validator } from "hono/validator";
import { BasicCommissionData } from "./types";
import { insertCommission, getCommissionsByUserId, getCommissionById, updateCommissionById, deleteCommissionById } from "./database";
import { hash } from "bcryptjs"; 
import { convertKeysToSnakeCase, convertKeysToCamelCase } from "../utils/caseConverter";

const factory = createFactory<{ Variables: { userId: string } }>();


// Create a new commission
export const createCommission = factory.createHandlers(
  validator('json', (value, c) => {
    if (typeof value.commissionRate !== "number") {
      return c.json({ error: "commissionRate must be a number" }, 400);
    }
    return value;
  }),
  async (c) => {
    try {
      const userId = c.get("userId"); 
      const commissionBody = await c.req.valid("json") as Omit<BasicCommissionData, "userId">;

      const commission: BasicCommissionData = {
        ...commissionBody,
        user_id: userId, 
      };

      const commissionSnakeCase = convertKeysToSnakeCase(commission);
      const newCommission = await insertCommission(commissionSnakeCase);

      return c.json(newCommission, 201);
    } catch (error) {
      console.error("Error creating commission:", error);
      return c.json({ error: "Failed to create commission" }, 500);
    }
  }
);



// Read commissions by userId
export const readCommissions = factory.createHandlers(
  async (c) => {
    try {
      const userId = c.get("userId"); // get userId from JWT middleware
      if (!userId) {
        return c.json({ error: "Unauthorized: userId missing" }, 401);
      }

      console.log("Fetching commissions for userId:", userId);
      const commissions = await getCommissionsByUserId(userId);

      if (!commissions || commissions.length === 0) {
        return c.json({ error: "No commissions found for this user" }, 404);
      }

      const camelCaseCommissions = convertKeysToCamelCase(commissions);

      return c.json(camelCaseCommissions, 200);
    } catch (error) {
      console.error("Error reading commissions:", error);
      return c.json({ error: "Failed to read commissions" }, 500);
    }
  }
);


// Update a commission by ID
export const updateCommission = factory.createHandlers(
  validator('param', (value, c) => {
    if (!value.id || typeof value.id !== "string") {
      return c.json({ error: "id is required" }, 400);
    }
    return value;
  }),
  validator('json', (value, c) => {
    if (value.userId !== undefined && typeof value.userId !== "string") {
      return c.json({ error: "userId must be a string" }, 400);
    }
    if (value.commissionRate !== undefined && typeof value.commissionRate !== "number") {
      return c.json({ error: "commissionRate must be a number" }, 400);
    }
    return value;
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { id } = c.req.valid("param");
      const commissionData = await c.req.valid("json");

      // Fetch commission by id to check ownership
      const commission = await getCommissionById(id);

      if (!commission) {
        return c.json({ error: "Commission not found" }, 404);
      }

      if (commission.user_id !== userId) {
        return c.json({ error: "Forbidden: You cannot update this commission" }, 403);
      }

      // Convert camelCase keys to snake_case before DB update
      const commissionSnakeCase = convertKeysToSnakeCase(commissionData);

      const updatedCommission = await updateCommissionById(id, commissionSnakeCase);

      if (!updatedCommission) {
        return c.json({ error: "Commission not found or update failed" }, 404);
      }

      // Convert DB result back to camelCase
      const camelCaseCommission = convertKeysToCamelCase(updatedCommission);

      return c.json(camelCaseCommission, 200);
    } catch (error) {
      console.error("Error updating commission:", error);
      return c.json({ error: "Failed to update commission" }, 500);
    }
  }
);



// Delete a commission by ID
export const deleteCommission = factory.createHandlers(
  validator('param', (value, c) => {
    if (!value.id || typeof value.id !== "string") {
      return c.json({ error: "id is required" }, 400);
    }
    return value;
  }),
  async (c) => {
    try {
      const userId = c.get("userId");
      if (!userId) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { id } = c.req.valid("param");

      // Fetch commission by id to check ownership
      const commission = await getCommissionById(id);

      if (!commission) {
        return c.json({ error: "Commission not found" }, 404);
      }

      if (commission.user_id !== userId) {
        return c.json({ error: "Forbidden: You cannot delete this commission" }, 403);
      }

      const deletedCommission = await deleteCommissionById(id);

      if (!deletedCommission) {
        return c.json({ error: "Commission not found or delete failed" }, 404);
      }

      return c.json({ message: "Commission deleted successfully" }, 200);
    } catch (error) {
      console.error("Error deleting commission:", error);
      return c.json({ error: "Failed to delete commission" }, 500);
    }
  }
);


