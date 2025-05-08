import { Email, UnixTimestamp } from "./client";

export interface Confirmation {
    id: number;   // Primary Key (PK)
    bookingId: number;  // Foreign Key (FK) referencing Booking.id
    confirmationNumber: string;
    supplier: string;
}

export interface PersonDetail {  // Changed from PeopleDetails (Singular form is better)
    id: number;   // Primary Key (PK)
    bookingId: number;  // Foreign Key (FK) referencing Booking.id
    name: string;
    dateOfBirth: UnixTimestamp;
}

export interface SignificantDate {
    id: number;   // Primary Key (PK)
    bookingId: number;  // Foreign Key (FK) referencing Booking.id
    date: UnixTimestamp;
}

export interface EmailAddress {
    id: number;   // Primary Key (PK)
    bookingId: number;  // Foreign Key (FK) referencing Booking.id
    email: Email;
}

export interface PhoneNumber {
    id: number;   // Primary Key (PK)
    bookingId: number;  // Foreign Key (FK) referencing Booking.id
    phone: string;
}

export interface Booking {
    id: number;  // Primary Key (PK)
    clientId: number;   // Foreign Key (FK) referencing Client.id
    travelDate: UnixTimestamp;
    clientFinalPaymentDate: UnixTimestamp;
    supplierFinalPaymentDate: UnixTimestamp;
    bookingDate: UnixTimestamp;
    invoicedDate: UnixTimestamp;
    referenceCode: string;  // Changed from bookingId to avoid confusion
    amount: number;
    notes: string;
    invoiced: boolean;
    paid: boolean;
    paymentDate: UnixTimestamp;
    dateCreated: UnixTimestamp;
}

export interface BookingWithRelations extends Booking {
    confirmations?: Confirmation[];
    people?: PersonDetail[];
    significantDates?: SignificantDate[];
    emailAddresses?: EmailAddress[];
    phoneNumbers?: PhoneNumber[];
}