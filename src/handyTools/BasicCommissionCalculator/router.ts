// File: src/handyTools/BasicCommissionCalculator/router.ts

import { Hono } from "hono";
import { createCommission, readCommissions, updateCommission, deleteCommission } from "../BasicCommissionCalculator/handlers";
import { verifyJWT } from "../handyToolsAuth/authJWTMiddleware";

export const BasicCommissionRouter = new Hono();
// Middleware to verify JWT for all routes
BasicCommissionRouter.use("*", verifyJWT);

// routes protected by JWT
// Create, Read, Update, Delete commissions
BasicCommissionRouter.post("/", ...createCommission);
BasicCommissionRouter.get("/", ...readCommissions);
BasicCommissionRouter.patch("/:id", ...updateCommission);
BasicCommissionRouter.delete("/:id", ...deleteCommission);
