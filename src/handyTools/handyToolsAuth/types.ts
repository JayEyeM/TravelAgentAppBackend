// File: src/handyTools/handyToolsAuth/types.ts

// For inserting new users (before created_at exists)
export interface HandyToolsUserInput {
  id: string;
  password_hash: string;
}

// For fetched users (with created_at)
export interface HandyToolsUser {
  id: string;
  password_hash: string;
  created_at: string;
}


// export interface HandyToolsUserWithToken extends HandyToolsUser {
//   token: string;
// }