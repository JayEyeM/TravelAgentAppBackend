import { Email, UnixTimestamp } from "./client";

export interface Confirmation {
    confirmationNumber: string;
    supplier: string;
}

export interface PeopleDetails {
    name: string;
    dateOfBirth: UnixTimestamp;
}

export interface Booking {
    id: number;
    travelDate: UnixTimestamp;
    clientFinalPaymentDate: UnixTimestamp;
    supplierFinalPaymentDate: UnixTimestamp;
    bookingDate: UnixTimestamp;
    invoicedDate: UnixTimestamp;
    confirmations: Confirmation[];
    people: PeopleDetails[];
    mailingAddress: string;
    phoneNumbers: string[];
    emailAddresses: Email[];
    significantDates: UnixTimestamp[];
    bookingId: string;
    amount: number;
    notes: string;
    invoiced: boolean;
    paid: boolean;
    paymentDate: UnixTimestamp;
    dateCreated: UnixTimestamp;
}
