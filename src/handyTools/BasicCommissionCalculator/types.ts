export interface BasicCommissionData {
  commission_rate: number;
  client_name?: string;
  supplier_name?: string;
  booking_number?: string;
  final_payment_date?: string; 
  invoiced?: boolean;
  commission_amount?: number;
  calculated_commission?: number;
  paid?: boolean;
  month_paid?: string;
  year_paid?: string;
  notes?: string;
  user_id: string; // HandyToolsUsers.id (used to link to a user)
}