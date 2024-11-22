import { Hono } from "hono";
import { createBookingHandler, getAllBookingsHandler, getBookingByIdHandler, updateBookingByIdHandler, deleteBookingByIdHandler } from "../handlers/booking";

export const BookingRouter = new Hono();

BookingRouter
    .post('/', ...createBookingHandler)
    .get('/', ...getAllBookingsHandler)
    .get('/:id', ...getBookingByIdHandler)
    .patch('/:id', ...updateBookingByIdHandler)
    .delete('/:id', ...deleteBookingByIdHandler)
