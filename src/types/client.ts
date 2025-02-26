export type Email = string;
export type UnixTimestamp = number; // e.g., 1729200231

export interface Client {
    id: number;  // Primary Key (PK)
    clientName: string;
    clientEmail: Email;
    clientPhone: string;
    clientPostalCode: string;
    clientStreetAddress: string;
    clientCity: string;
    clientProvince: string;
    clientCountry: string;
    notes: string;
    paymentDate: UnixTimestamp;
    finalPaymentDate: UnixTimestamp;
    dateCreated: UnixTimestamp;
}


