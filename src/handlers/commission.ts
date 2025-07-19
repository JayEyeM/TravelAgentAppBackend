// File: src/handlers/commission.ts

import { createFactory } from "hono/factory";
import { validator } from "hono/validator";
import {
  Commission,
  NewCommissionInput,
  UpdateCommissionInput,
} from "../types/commission";
import {
  createCommission,
  getAllCommissions,
  getCommissionById,
  updateCommission,
  deleteCommission,
} from "../database/commissionIndex";
import { toUnixTimestamp } from "../utils/toUnixConverter";

const factory = createFactory();

// Create a new commission
export const createCommissionHandler = factory.createHandlers(
  validator("json", (value, c) => {
    const body = value as NewCommissionInput;

    // Validate required fields
    if (typeof body.bookingId !== "number") {
      return c.json({ message: "Missing or invalid bookingId" }, 400);
    }
    if (typeof body.rate !== "number") {
      return c.json({ message: "Missing or invalid rate" }, 400);
    }
    if (typeof body.commission !== "number") {
      return c.json({ message: "Missing or invalid commission" }, 400);
    }
    if (typeof body.invoiced !== "boolean") {
      return c.json({ message: "Missing or invalid invoiced status" }, 400);
    }
    if (typeof body.paid !== "boolean") {
      return c.json({ message: "Missing or invalid paid status" }, 400);
    }
    if (body.paymentDate !== null && typeof body.paymentDate !== "string") {
      return c.json({ message: "Missing or invalid paymentDate" }, 400);
    }

    // Convert paymentDate to unix if present
    if (body.paymentDate) {
      body.paymentDate = toUnixTimestamp(body.paymentDate) as any; // if you store as Unix
    }

    return body;
  }),
  async (c) => {
    const user = c.get("user");
    if (!user || !user.id) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const body = await c.req.valid("json");
    const newCommission = await createCommission(body, user.id);

    if (!newCommission) {
      return c.json({ message: "Failed to create commission" }, 500);
    }

    return c.json(newCommission, 201);
  }
);

//  Get all commissions for a user
export const getAllCommissionsHandler = factory.createHandlers(async (c) => {
  const user = c.get("user");
  if (!user || !user.id) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const commissions = await getAllCommissions(user.id);
  return c.json(commissions);
});

// Get a single commission by ID
export const getCommissionByIdHandler = factory.createHandlers(async (c) => {
  const idParam = c.req.param("id");
  if (!idParam) {
    return c.json({ message: "Commission ID is required" }, 400);
  }

  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    return c.json({ message: "Invalid commission ID" }, 400);
  }

  const user = c.get("user");
  if (!user || !user.id) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const commission = await getCommissionById(id, user.id);
  if (!commission) {
    return c.json({ message: "Commission not found" }, 404);
  }

  return c.json(commission);
});

//  Update a commission by ID
export const updateCommissionByIdHandler = factory.createHandlers(async (c) => {
  const user = c.get("user");
  if (!user || !user.id) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const userId = user.id;

  const idParam = c.req.param("id");
  if (!idParam) return c.json({ message: "Commission ID is required" }, 400);
  const id = parseInt(idParam, 10);
  if (isNaN(id)) return c.json({ message: "Invalid commission ID" }, 400);

  const body = await c.req.json<UpdateCommissionInput>();

  // Validate fields if present
  if (body.rate !== undefined && typeof body.rate !== "number") {
    return c.json({ message: "Invalid rate" }, 400);
  }
  if (body.commission !== undefined && typeof body.commission !== "number") {
    return c.json({ message: "Invalid commission" }, 400);
  }
  if (body.invoiced !== undefined && typeof body.invoiced !== "boolean") {
    return c.json({ message: "Invalid invoiced status" }, 400);
  }
  if (body.paid !== undefined && typeof body.paid !== "boolean") {
    return c.json({ message: "Invalid paid status" }, 400);
  }
  if (
    body.paymentDate !== undefined &&
    body.paymentDate !== null &&
    typeof body.paymentDate !== "string"
  ) {
    return c.json({ message: "Invalid paymentDate" }, 400);
  }

  if (body.paymentDate) {
    body.paymentDate = toUnixTimestamp(body.paymentDate) as any; 
  }

  const updated = await updateCommission(id, userId, body);
  if (!updated) {
    return c.json({ message: "Commission not found or unauthorized" }, 404);
  }

  return c.json(updated);
});

//  Delete a commission by ID
export const deleteCommissionByIdHandler = factory.createHandlers(async (c) => {
  const idParam = c.req.param("id");
  if (!idParam) {
    return c.json({ message: "Commission ID is required" }, 400);
  }
  const id = parseInt(idParam, 10);
  if (isNaN(id)) {
    return c.json({ message: "Invalid commission ID" }, 400);
  }

  const user = c.get("user");
  if (!user || !user.id) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const deleted = await deleteCommission(id, user.id);
  if (!deleted) {
    return c.json({ message: "Commission not found or unauthorized" }, 404);
  }

  return c.json({ message: "Commission deleted successfully" });
});
