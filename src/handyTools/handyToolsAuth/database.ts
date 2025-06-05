// File: src/handyTools/handyToolsAuth/database.ts

import { HandyToolsUserInput, HandyToolsUser } from "./types";
import supabase from "../../utils/supabase";

// creates a new user in the HandyToolsUsers table
export async function createUserInDB(userInput: HandyToolsUserInput): Promise<HandyToolsUser> {
  const { data, error } = await supabase
    .from("HandyToolsUsers")
    .insert([userInput])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as HandyToolsUser;
}

// gets a user by their ID from the HandyToolsUsers table
export async function getUserById(id: string): Promise<HandyToolsUser | null> {
  const { data, error } = await supabase
    .from("HandyToolsUsers")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // No rows found
    throw new Error(error.message);
  }

  return data as HandyToolsUser;
}

// deletes a user by their ID from the HandyToolsUsers table
export async function deleteUserFromDB(id: string): Promise<void> {
  const { error } = await supabase
    .from("HandyToolsUsers")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}



