// File path: src/handyTools/handyToolsAuth/router.ts

import { Hono } from "hono";
import { createUser, signInUser, deleteUser } from "./handlers";

export const HandyToolsUserRouter = new Hono();

HandyToolsUserRouter.post("/", ...createUser); // Create user
HandyToolsUserRouter.post("/sign-in", ...signInUser); // Sign in
HandyToolsUserRouter.delete("/", ...deleteUser); // Delete user
