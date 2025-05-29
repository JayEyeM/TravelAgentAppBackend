// File: src/handyTools/BasicCommissionCalculator/router.ts

import { Hono } from "hono";
import { createCommission, readCommissions, updateCommission, deleteCommission } from "../BasicCommissionCalculator/handlers";

export const BasicCommissionRouter = new Hono();

BasicCommissionRouter.post("/", ...createCommission);
BasicCommissionRouter.get("/:userId", ...readCommissions);
BasicCommissionRouter.patch("/:id", ...updateCommission);
BasicCommissionRouter.delete("/:id", ...deleteCommission);
