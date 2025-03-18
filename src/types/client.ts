export type Email = string;
export type UnixTimestamp = number; // e.g., 1729200231


//account id add
export interface Client {
    id: number;  // Primary Key (PK)
    userId: string; // Foreign Key (FK) referencing auth.users.id (UUID)
    clientName: string;
    clientEmail: Email;
    clientPhone: string;
    clientPostalCode: string;
    clientStreetAddress: string;
    clientCity: string;
    clientProvince: string;
    clientCountry: string;
    notes?: string;
    paymentDate?: UnixTimestamp;
    finalPaymentDate?: UnixTimestamp;
    dateCreated: UnixTimestamp;
}


