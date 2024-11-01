import { Hono } from "hono";
import { createUser, getAllUsers, getUserById, updateUserById, deleteUserById } from "../handlers/user";

export const UserRouter = new Hono();

// Create a new client
UserRouter.post('/', createUser);

// Get a client by ID
UserRouter.get('/:id', getUserById);

// Get all clients
UserRouter.get('/', getAllUsers);

// Update a client by ID
UserRouter.patch('/:id', updateUserById);

// Delete a client by ID
UserRouter.delete('/:id', deleteUserById);
