// client.ts

import { Booking } from "./booking";  

export type Email = string;
export type UnixTimestamp = number; // e.g., 1729200231

export interface Client {
    id: number;
    clientName: string;
    clientEmail: Email;
    clientPhone: string;
    clientPostalCode: string;
    clientStreetAddress: string;
    clientCity: string;
    clientProvince: string;
    clientCountry: string;
    notes: string;
    invoiced: boolean;
    paid: boolean;
    paymentDate: UnixTimestamp;
    finalPaymentDate: UnixTimestamp;
    dateCreated: UnixTimestamp;
    bookings: Booking[];  
}

// comments for testing out if secondary branch creation works
// comments for testing out if secondary branch creation works
