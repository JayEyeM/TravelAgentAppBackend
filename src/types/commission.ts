// File path: src/types/commission.ts

// The full Commission record stored in the database and returned from the API
export interface Commission {
  id: number;
  bookingId: number;
  clientId: number;
  clientName: string;
  supplier: string;
  bookingTravelDate: number;   // ✅ Unix timestamp
  confirmationNumber: string;
  finalPaymentDate: number;    // ✅ Unix timestamp

  rate: number;
  commission: number;
  commissionRateAmount: number;

  invoiced: boolean;
  paid: boolean;
  paymentDate: number | null;  // ✅ Unix timestamp or null

  dateCreated: number;         // ✅ Unix timestamp
  userId: string;
}


// Input when creating a new commission (POST /commissions)
export interface NewCommissionInput {
  bookingId: number;
  rate: number;
  commission: number;
  invoiced: boolean;
  paid: boolean;
  paymentDate: number | null;
}

// Input when updating a commission (PATCH /commissions/:id)
// Partial so fields are optional and only what is sent gets updated
export interface UpdateCommissionInput {
  rate?: number;
  commission?: number;
  invoiced?: boolean;
  paid?: boolean;
  paymentDate?: number | null;
}
