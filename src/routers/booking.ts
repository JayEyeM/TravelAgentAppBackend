import { Hono } from "hono";
import { createBookingHandler, getAllBookingsHandler, getBookingByIdHandler, updateBookingByIdHandler, deleteBookingByIdHandler } from "../handlers/booking";

export const BookingRouter = new Hono();

BookingRouter.post('/', ...createBookingHandler);
BookingRouter.get('/', getAllBookingsHandler);
BookingRouter.get('/:id', getBookingByIdHandler);
BookingRouter.patch('/:id', updateBookingByIdHandler);
BookingRouter.delete('/:id', deleteBookingByIdHandler);
