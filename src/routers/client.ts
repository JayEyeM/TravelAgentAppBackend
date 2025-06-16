// File path: src/routers/client.ts

import { Hono } from "hono";
import {
  createClientHandler,
  getAllClientsHandler,
  getClientByIdHandler,
  updateClientByIdHandler,
  deleteClientByIdHandler,
} from "../handlers/client";

export const ClientRouter = new Hono();

ClientRouter
  .post('/', ...createClientHandler)
  .get('/', ...getAllClientsHandler)
  .get('/:id', ...getClientByIdHandler)
  .patch('/:id', ...updateClientByIdHandler)
  .delete('/:id', ...deleteClientByIdHandler);
