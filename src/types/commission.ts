// File path: src/types/commission.ts

// The full Commission record stored in the database and returned from the API
export interface Commission {
  id: number;                   // PK
  bookingId: number;            // FK to bookings
  clientId: number;             // snapshot of client id for quick reference
  clientName: string;           // snapshot of client name
  supplier: string;             // snapshot from confirmation or booking
  bookingTravelDate: string;    // snapshot ISO date string
  confirmationNumber: string;   // snapshot from confirmation
  finalPaymentDate: string;     // snapshot ISO date string

  rate: number;                 // commission rate %
  commission: number;           // commission amount
  commissionRateAmount: number; // calculated amount = commission * rate / 100

  invoiced: boolean;            // status flags
  paid: boolean;
  paymentDate: string | null;   // ISO date string or null

  dateCreated: string;          // ISO date string for creation timestamp
  userId: string;               // FK to users table (owner of the commission)
}

// Input when creating a new commission (POST /commissions)
export interface NewCommissionInput {
  bookingId: number;
  rate: number;
  commission: number;
  invoiced: boolean;
  paid: boolean;
  paymentDate: string | null;
}

// Input when updating a commission (PATCH /commissions/:id)
// Partial so fields are optional and only what is sent gets updated
export interface UpdateCommissionInput {
  rate?: number;
  commission?: number;
  invoiced?: boolean;
  paid?: boolean;
  paymentDate?: string | null;
}
