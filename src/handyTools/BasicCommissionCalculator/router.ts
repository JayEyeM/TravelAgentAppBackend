// File: src/handyTools/BasicCommissionCalculator/handlers.ts

import { Hono } from "hono";
import { createCommission } from "../BasicCommissionCalculator/handlers";

export const BasicCommissionRouter = new Hono();

BasicCommissionRouter.post("/", ...createCommission);
