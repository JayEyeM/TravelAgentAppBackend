import { Booking } from '../types/booking';

export function formatBookingForSupabase(booking: Partial<Booking>) {
    return {
        ...(booking.clientId !== undefined && { client_id: booking.clientId }),
        ...(booking.travelDate !== undefined && { travel_date: booking.travelDate }),
        ...(booking.clientFinalPaymentDate !== undefined && { client_final_payment_date: booking.clientFinalPaymentDate }),
        ...(booking.supplierFinalPaymentDate !== undefined && { supplier_final_payment_date: booking.supplierFinalPaymentDate }),
        ...(booking.bookingDate !== undefined && { booking_date: booking.bookingDate }),
        ...(booking.invoicedDate !== undefined && { invoiced_date: booking.invoicedDate }),
        ...(booking.referenceCode !== undefined && { reference_code: booking.referenceCode }),
        ...(booking.amount !== undefined && { amount: booking.amount }),
        ...(booking.notes !== undefined && { notes: booking.notes }),
        ...(booking.invoiced !== undefined && { invoiced: booking.invoiced }),
        ...(booking.paid !== undefined && { paid: booking.paid }),
        ...(booking.paymentDate !== undefined && { payment_date: booking.paymentDate }),
        ...(booking.dateCreated !== undefined && { date_created: booking.dateCreated }),
    };
}
