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

    return value;
}), async (c) => {
    const body = await c.req.valid('json');
    const newBooking = await createBooking(body as unknown as Booking);
    return c.json(newBooking, 201);
});

// Get all bookings
export const getAllBookingsHandler = factory.createHandlers(async (c) => {
    const bookings = await getAllBookings();
    return c.json(bookings);
});

// Get a booking by ID
export const getBookingByIdHandler = factory.createHandlers(async (c) => {
    const id = parseInt(c.req.param('id'), 10);

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
    const id = parseInt(c.req.param('id'), 10);
    const body = await c.req.json<Partial<Booking>>();

    if (isNaN(id)) {
        return c.json({ message: 'Invalid booking ID' }, 400);
    }

    const existingBooking = await getBookingById(id);
    if (!existingBooking) {
        return c.json({ message: 'Booking not found' }, 404);
    }

    const updatedBookingData = { ...existingBooking, ...body };
    const updatedBooking = await updateBooking(updatedBookingData);
    return c.json(updatedBooking);
});

// Delete a booking by ID
export const deleteBookingByIdHandler = factory.createHandlers(async (c) => {
    const id = parseInt(c.req.param('id'), 10);

    if (isNaN(id)) {
        return c.json({ message: 'Invalid booking ID' }, 400);
    }

    const deleted = await deleteBooking(id);
    if (!deleted) {
        return c.json({ message: 'Booking not found' }, 404);
    }

    return c.json({ message: 'Booking deleted successfully' });
});
