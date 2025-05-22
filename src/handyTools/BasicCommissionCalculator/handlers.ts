// File: src/handyTools/BasicCommissionCalculator/handlers.ts


import { createFactory } from "hono/factory";
import { validator } from "hono/validator";
import { BasicCommissionData } from "./types";
import { insertCommission } from "./database";
import { hash } from "bcryptjs"; 
import { convertKeysToSnakeCase } from "../utils/caseConverter";

const factory = createFactory();

// Create a new commission
export const createCommission = factory.createHandlers(
  validator('json', (value, c) => {
    if (!value.userId || typeof value.userId !== "string") {
  return c.json({ error: "userId is required" }, 400);
}

    if (typeof value.commissionRate !== "number") {
  return c.json({ error: "commissionRate must be a number" }, 400);
}


    return value;
  }),
  async (c) => {
    try {
      const commission = await c.req.valid("json") as BasicCommissionData;

      // Convert camelCase keys to snake_case before DB insert
    const commissionSnakeCase = convertKeysToSnakeCase(commission);

      const newCommission = await insertCommission(commissionSnakeCase);

      return c.json(newCommission, 201);
    } catch (error) {
      console.error("Error creating commission:", error);
      return c.json({ error: "Failed to create commission" }, 500);
    }
  }
);
