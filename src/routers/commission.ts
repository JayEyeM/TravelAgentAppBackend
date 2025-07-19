// File path: src/routers/commission.ts

import { Hono } from "hono";
import { 
  createCommissionHandler,
  getAllCommissionsHandler,
  getCommissionsByUserIdHandler,
  getCommissionByIdHandler,
  updateCommissionByIdHandler,
  deleteCommissionByIdHandler
} from "../handlers/commission";

export const CommissionRouter = new Hono();

CommissionRouter
  .post('/', ...createCommissionHandler)
  .get('/', ...getAllCommissionsHandler)
  .get('/user/:userId', ...getCommissionsByUserIdHandler) // to get commissions by logged-in user
  .get('/:id', ...getCommissionByIdHandler)
  .patch('/:id', ...updateCommissionByIdHandler)
  .delete('/:id', ...deleteCommissionByIdHandler);
