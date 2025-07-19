// File: src/types/booking.ts

import { Email, UnixTimestamp } from "./client";

//
// ─────────────────────────────────────────────────────────────────────
// SECTION 1: Base Interfaces — represent actual database rows
// ─────────────────────────────────────────────────────────────────────
//

export interface Booking {
  id: number; // PK
  clientId: number; // FK to clients
  travelDate: UnixTimestamp;
  clientFinalPaymentDate: UnixTimestamp;
  supplierFinalPaymentDate: UnixTimestamp;
  bookingDate: UnixTimestamp;
  invoicedDate: UnixTimestamp;
  referenceCode: string; // This is like a custom short identifier you display (e.g. "REF-291X")
  amount: number;
  notes: string;
  invoiced: boolean;
  paid: boolean;
  paymentDate: UnixTimestamp;
  dateCreated: UnixTimestamp;
}

export interface Confirmation {
  id: number;
  bookingId: number;
  confirmationNumber: string;
  supplier: string;
}

export interface PersonDetail {
  id: number;
  bookingId: number;
  name: string;
  dateOfBirth: UnixTimestamp;
}

export interface SignificantDate {
  id: number;
  bookingId: number;
  date: UnixTimestamp;
}

export interface EmailAddress {
  id: number;
  bookingId: number;
  email: Email;
}

export interface PhoneNumber {
  id: number;
  bookingId: number;
  phone: string;
}

//
// ─────────────────────────────────────────────────────────────────────
// SECTION 2: Input Interface — used for creating a booking (from client/frontend)
// ─────────────────────────────────────────────────────────────────────
//

export interface BookingInput {
  clientId: number;
  travelDate: UnixTimestamp;
  clientFinalPaymentDate: UnixTimestamp;
  supplierFinalPaymentDate: UnixTimestamp;
  bookingDate: UnixTimestamp;
  invoicedDate: UnixTimestamp;
  referenceCode: string;
  amount: number;
  notes: string;
  invoiced: boolean;
  paid: boolean;
  paymentDate: UnixTimestamp;
  dateCreated: UnixTimestamp;

  confirmations: Omit<Confirmation, "id" | "bookingId">[];
  people: Omit<PersonDetail, "id" | "bookingId">[];
  significantDates: Omit<SignificantDate, "id" | "bookingId">[];
  emailAddresses: Omit<EmailAddress, "id" | "bookingId">[];
  phoneNumbers: Omit<PhoneNumber, "id" | "bookingId">[];
}

//
// ─────────────────────────────────────────────────────────────────────
// SECTION 3: Response Interface — used when sending booking to frontend
// ─────────────────────────────────────────────────────────────────────
//

export interface BookingWithRelations extends Booking {
  confirmations: Confirmation[];
  people: PersonDetail[];
  significantDates: SignificantDate[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
}
