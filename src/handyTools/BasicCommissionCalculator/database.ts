// File: src/handyTools/BasicCommissionCalculator/database.ts

import supabase from "../../utils/supabase";
import { BasicCommissionData } from "./types";

export async function insertCommission(data: BasicCommissionData) {
  const { data: result, error } = await supabase
    .from("Basic Commissions Calulator")
    .insert([data])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return result;
}
