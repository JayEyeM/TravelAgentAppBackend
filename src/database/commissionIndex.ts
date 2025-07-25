//File path: src/database/commissionIndex.ts

//File: src/database/commissionIndex.ts

import supabase from "../utils/supabase";
import {
  Commission,
  NewCommissionInput,
  UpdateCommissionInput,
} from "../types/commission";
import { snakeToCamel2, camelToSnake2 } from "../utils/caseConverter2";
import { getBookingById, getClientById } from ".";

/** Get all commissions for a specific user */
export async function getAllCommissions(userId: string): Promise<Commission[]> {
  const { data, error } = await supabase
    .from("commissions")
    .select("*")
    .eq("user_id", userId)
    .order("date_created", { ascending: false });

  if (error) {
    console.error("❌ Error fetching commissions:", error);
    return [];
  }

  return data ? data.map((c) => snakeToCamel2(c)) : [];
}


/** Get a single commission by ID (verifies ownership) */
export async function getCommissionById(
  id: number,
  userId: string
): Promise<Commission | null> {
  const { data, error } = await supabase
    .from("commissions")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error(`❌ Error fetching commission ${id}:`, error);
    return null;
  }

  return data ? snakeToCamel2(data) : null;
}

/** Create a new commission */
export async function createCommission(
  input: NewCommissionInput,
  userId: string
): Promise<Commission | null> {
  if (!userId) {
    console.error("❌ createCommission: userId missing");
    return null;
  }

  // Fetch booking and client details for snapshot fields
  const booking = await getBookingById(input.bookingId, userId);
  if (!booking) {
    console.error(`❌ Booking ${input.bookingId} not found or unauthorized`);
    return null;
  }

  // ✅ Fetch the client using the existing helper
const client = await getClientById(booking.clientId, userId);
if (!client) {
  console.error(`❌ Client ${booking.clientId} not found or unauthorized`);
  return null;
}

  // Format the payload for Supabase
const formatted = {
  user_id: userId,
  booking_id: input.bookingId,
  rate: input.rate,
  commission: input.commission,
  commission_rate_amount: input.commission * (input.rate / 100),
  invoiced: input.invoiced,
  paid: input.paid,
  payment_date: input.paymentDate ?? null,
  date_created: Math.floor(Date.now() / 1000),

  // Snapshot fields from booking
  client_id: booking.clientId,
  client_name: client.clientName ?? "",
  supplier: "", // no supplier snapshot needed for now
  booking_travel_date: booking.travelDate,           
  confirmation_number: "",
  final_payment_date: booking.clientFinalPaymentDate, 
};




  const { data, error } = await supabase
    .from("commissions")
    .insert([formatted])
    .select()
    .single();

  if (error) {
    console.error("❌ Error creating commission:", error);
    return null;
  }

  return data ? snakeToCamel2(data) : null;
}

/** Update a commission */
export async function updateCommission(
  id: number,
  userId: string,
  updated: UpdateCommissionInput
): Promise<Commission | null> {
  const formatted = camelToSnake2(updated);

  // Recompute commission_rate_amount if both commission & rate are present
  if (updated.commission !== undefined && updated.rate !== undefined) {
    formatted["commission_rate_amount"] =
      updated.commission * (updated.rate / 100);
  }

  const { data, error } = await supabase
    .from("commissions")
    .update(formatted)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error(`❌ Error updating commission ${id}:`, error);
    return null;
  }

  return data ? snakeToCamel2(data) : null;
}

/** Delete a commission */
export async function deleteCommission(
  id: number,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("commissions")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error(`❌ Error deleting commission ${id}:`, error);
    return false;
  }

  return true;
}
