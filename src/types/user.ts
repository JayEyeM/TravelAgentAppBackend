// File path: src/types/user.ts


export interface AuthenticatedUser {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    display_name?: string;
    phone?: string;
    [key: string]: any; // fallback for anything else
  };
}
