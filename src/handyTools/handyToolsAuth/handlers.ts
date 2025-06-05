// File: src/handyTools/handyToolsAuth/handlers.ts

import { createFactory } from "hono/factory";
import { validator } from "hono/validator";
import { createUserInDB, getUserById, deleteUserFromDB } from "./database";
import { hash, compare } from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { verifyJWT } from "./authJWTMiddleware";

const factory = createFactory<{ Variables: { userId: string } }>();

const JWT_SECRET = process.env.JWT_SECRET!;

// Create HandyTools User
export const createUser = factory.createHandlers(
  validator("json", (value, c) => {
    if (!value.password || typeof value.password !== "string") {
      return c.json({ error: "Password is required" }, 400);
    }
    return value;
  }),
  async (c) => {
    try {
      const { password } = c.req.valid("json");
      const id = crypto.randomUUID();
      const password_hash = await hash(password, 10);

      const user = await createUserInDB({ id, password_hash });

      return c.json({ message: "User created", userId: user.id }, 201);
    } catch (error) {
      console.error("Create user error:", error);
      return c.json({ error: "Failed to create user" }, 500);
    }
  }
);


// Sign In HandyTools User
export const signInUser = factory.createHandlers(
  validator("json", (value, c) => {
    if (!value.id || typeof value.id !== "string") {
      return c.json({ error: "ID is required" }, 400);
    }
    if (!value.password || typeof value.password !== "string") {
      return c.json({ error: "Password is required" }, 400);
    }
    return value;
  }),
  async (c) => {
    try {
      const { id, password } = c.req.valid("json");

      const user = await getUserById(id);
      if (!user) {
        return c.json({ error: "Invalid credentials" }, 401);
      }

      const isMatch = await compare(password, user.password_hash);
      if (!isMatch) {
        return c.json({ error: "Invalid credentials" }, 401);
      }

      // JWT token generation
      const token = jwt.sign(
        { userId: user.id }, // Payload
        JWT_SECRET,          // Secret
        { expiresIn: "1h" }  // Optional: expires in 1 hour
      );

      return c.json({ message: "Sign in successful", token });
    } catch (error) {
      console.error("Sign in error:", error);
      return c.json({ error: "Failed to sign in" }, 500);
    }
  }
);

// Delete HandyTools User
export const deleteUser = factory.createHandlers(
  verifyJWT, // Middleware: validates JWT and sets userId
  async (c) => {
    try {
      const userId = c.get("userId");
      await deleteUserFromDB(userId);

      return c.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Delete user error:", error);
      return c.json({ error: "Failed to delete user" }, 500);
    }
  }
);

