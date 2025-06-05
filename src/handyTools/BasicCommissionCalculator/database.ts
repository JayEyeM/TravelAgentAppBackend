// File: src/handyTools/BasicCommissionCalculator/database.ts

import supabase from "../../utils/supabase";
import { BasicCommissionData } from "./types";

export async function insertCommission(data: BasicCommissionData) {
  const { data: result, error } = await supabase
    .from("Basic Commissions Calculator")
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return result;
}

export async function getCommissionsByUserId(userId: string) {
  const { data, error } = await supabase
    .from("Basic Commissions Calculator")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getCommissionById(id: string) {
  const { data, error } = await supabase
    .from("Basic Commissions Calculator")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}


export async function updateCommissionById(id: string, data: Partial<BasicCommissionData>) {
  const { data: result, error } = await supabase
    .from("Basic Commissions Calculator")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return result;
}

export async function deleteCommissionById(id: string) {
  const { data, error } = await supabase
    .from("Basic Commissions Calculator")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}