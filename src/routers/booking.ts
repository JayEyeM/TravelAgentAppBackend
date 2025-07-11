import { Hono } from "hono";
import { createBookingHandler, 
    getAllBookingsHandler,
    getBookingsByClientIdHandler,
    getBookingByIdHandler, 
    updateBookingByIdHandler, 
    deleteBookingByIdHandler } from "../handlers/booking";

export const BookingRouter = new Hono();

BookingRouter
    .post('/', ...createBookingHandler)
    .get('/', ...getAllBookingsHandler)
    .get('/client/:clientId', ...getBookingsByClientIdHandler)
    .get('/:id', ...getBookingByIdHandler)
    .patch('/:id', ...updateBookingByIdHandler)
    .delete('/:id', ...deleteBookingByIdHandler)
