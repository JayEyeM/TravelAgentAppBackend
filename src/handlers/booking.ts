import { createFactory } from "hono/factory";
import { validator } from "hono/validator";
import { Booking } from "../types/booking";
import { createBooking, getAllBookings, getBookingById, updateBooking, deleteBooking } from "../database";

const factory = createFactory();

// Create a new booking
export const createBookingHandler = factory.createHandlers(validator('json', (value, c) => {
    // Validate booking fields
    if (!value.bookingId || typeof value.bookingId !== 'string') {
        return c.text('Booking ID must be a string', 400);
    }

    if (!value.travelDate || typeof value.travelDate !== 'number') {
        return c.json({ message: 'Missing or invalid travel date' }, 400);
    }

    if (!value.clientFinalPaymentDate || typeof value.clientFinalPaymentDate !== 'number') {
        return c.json({ message: 'Missing or invalid client final payment date' }, 400);
    }

    if (!value.supplierFinalPaymentDate || typeof value.supplierFinalPaymentDate !== 'number') {
        return c.json({ message: 'Missing or invalid supplier final payment date' }, 400);
    }

    if (!value.bookingDate || typeof value.bookingDate !== 'number') {
        return c.json({ message: 'Missing or invalid booking date' }, 400);
    }

    if (!value.invoicedDate || typeof value.invoicedDate !== 'number') {
        return c.json({ message: 'Missing or invalid invoiced date' }, 400);
    }

    if (!Array.isArray(value.confirmations) || !value.confirmations.every((conf: any) => typeof conf.confirmationNumber === 'string' && typeof conf.supplier === 'string')) {
        return c.json({ message: 'Missing or invalid confirmations' }, 400);
    }

    if (!Array.isArray(value.people) || !value.people.every((person: any) => typeof person.name === 'string' && typeof person.dateOfBirth === 'number')) {
        return c.json({ message: 'Missing or invalid people details' }, 400);
    }

    if (!value.mailingAddress || typeof value.mailingAddress !== 'string') {
        return c.json({ message: 'Missing or invalid mailing address' }, 400);
    }

    if (!Array.isArray(value.phoneNumbers) || !value.phoneNumbers.every((phone: any) => typeof phone === 'string')) {
        return c.json({ message: 'Missing or invalid phone numbers' }, 400);
    }

    if (!Array.isArray(value.emailAddresses) || !value.emailAddresses.every((email: any) => typeof email === 'string')) {
        return c.json({ message: 'Missing or invalid email addresses' }, 400);
    }

    if (!Array.isArray(value.significantDates) || !value.significantDates.every((date: any) => typeof date === 'number')) {
        return c.json({ message: 'Missing or invalid significant dates' }, 400);
    }

    if (typeof value.amount !== 'number') {
        return c.json({ message: 'Missing or invalid amount' }, 400);
    }

    if (typeof value.notes !== 'string') {
        return c.json({ message: 'Missing or invalid notes' }, 400);
    }

    if (typeof value.invoiced !== 'boolean') {
        return c.json({ message: 'Missing or invalid invoiced status' }, 400);
    }

    if (typeof value.paid !== 'boolean') {
        return c.json({ message: 'Missing or invalid paid status' }, 400);
    }

    if (typeof value.paymentDate !== 'number') {
        return c.json({ message: 'Missing or invalid payment date' }, 400);
    }

    if (typeof value.dateCreated !== 'number') {
        return c.json({ message: 'Missing or invalid date created' }, 400);
    }

    return value;
}), async (c) => {
    const body = await c.req.valid('json');
    const relatedData = {
        confirmation: body.confirmations[0],
        personDetails: body.people,
        significantDates: body.significantDates,
        emailAddresses: body.emailAddresses,
        phoneNumbers: body.phoneNumbers,
    };
    const newBooking = await createBooking(body as unknown as Booking, relatedData);
    return c.json(newBooking, 201);
});

// Get all bookings
export const getAllBookingsHandler = factory.createHandlers(async (c) => {
    const bookings = await getAllBookings();
    return c.json(bookings);
});

// Get a booking by ID
export const getBookingByIdHandler = factory.createHandlers(async (c) => {
    const idParam = c.req.param('id');
    if (!idParam) {
        return c.json({ message: 'Booking ID is required' }, 400);
    }
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
        return c.json({ message: 'Invalid booking ID' }, 400);
    }

    const booking = await getBookingById(id);
    if (!booking) {
        return c.json({ message: 'Booking not found' }, 404);
    }

    return c.json(booking);
});

// Update a booking by ID
export const updateBookingByIdHandler = factory.createHandlers(async (c) => {
    const idParam = c.req.param('id');
    if (!idParam) {
        return c.json({ message: 'Booking ID is required' }, 400);
    }
    const id = parseInt(idParam, 10);

    if (isNaN(id)) {
        return c.json({ message: 'Invalid booking ID' }, 400);
    }

    const body = await c.req.json<Partial<Booking>>();
    const existingBooking = await getBookingById(id);
    if (!existingBooking) {
        return c.json({ message: 'Booking not found' }, 404);
    }

    const updatedBookingData = { ...existingBooking, ...body };
    const updatedRelatedData = {
        confirmation: body.confirmations?.[0] || null,
        personDetails: body.people || [],
        significantDates: body.significantDates || [],
        emailAddresses: body.emailAddresses || [],
        phoneNumbers: body.phoneNumbers || [],
    };

    const updatedBooking = await updateBooking(id, updatedBookingData, updatedRelatedData);
    return c.json(updatedBooking);
});

// Delete a booking by ID
export const deleteBookingByIdHandler = factory.createHandlers(async (c) => {
    const idParam = c.req.param('id');
if (!idParam) {
    return c.json({ message: 'Booking ID is required' }, 400);
}
const id = parseInt(idParam, 10);

if (isNaN(id)) {
    return c.json({ message: 'Invalid booking ID' }, 400);
}

    if (isNaN(id)) {
        return c.json({ message: 'Invalid booking ID' }, 400);
    }

    const deleted = await deleteBooking(id);
    if (!deleted) {
        return c.json({ message: 'Booking not found' }, 404);
    }

    return c.json({ message: 'Booking deleted successfully' });
});