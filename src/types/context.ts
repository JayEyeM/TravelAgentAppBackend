//File path: src/types/context.ts

import type { AuthenticatedUser } from "./user";

declare module "hono" {
  interface ContextVariableMap {
    user: AuthenticatedUser;
  }
}
