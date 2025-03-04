import { Hono } from "hono";
import { createUser, getAllUsers, getUserById, updateUserById, deleteUserById } from "../handlers/client";

export const UserRouter = new Hono();

// Create a new client
UserRouter
    .post('/', ...createUser)
    .get('/:id', ...getUserById)
    .get('/', ...getAllUsers)
    .patch('/:id', ...updateUserById)
    .delete('/:id', ...deleteUserById);
