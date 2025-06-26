import { createFactory } from "hono/factory";
import { validator } from "hono/validator";
import {
  Booking,
  Confirmation,
  PersonDetail,
  SignificantDate,
  EmailAddress,
  PhoneNumber
} from '../types/booking';

import { createBooking, getAllBookings, getBookingById, updateBooking, deleteBooking } from "../database";
import { toUnixTimestamp } from '../utils/toUnixConverter';

const factory = createFactory();

// Create a new booking
export const createBookingHandler = factory.createHandlers(validator('json', (value, c) => {
  // Convert booking date strings to Unix timestamps
  value.booking.travelDate = toUnixTimestamp(value.booking.travelDate);
  value.booking.bookingDate = toUnixTimestamp(value.booking.bookingDate);
  value.booking.invoicedDate = toUnixTimestamp(value.booking.invoicedDate);
  value.booking.clientFinalPaymentDate = toUnixTimestamp(value.booking.clientFinalPaymentDate);
  value.booking.supplierFinalPaymentDate = toUnixTimestamp(value.booking.supplierFinalPaymentDate);
  value.booking.paymentDate = toUnixTimestamp(value.booking.paymentDate);
  value.booking.dateCreated = toUnixTimestamp(value.booking.dateCreated);

  // Convert people.dateOfBirth to Unix
  if (Array.isArray(value.relatedData?.personDetails)) {
    value.relatedData.personDetails = value.relatedData.personDetails.map((person: any) => ({
      ...person,
      dateOfBirth: toUnixTimestamp(person.dateOfBirth),
    }));
  }

  // Convert significantDates to Unix
  if (Array.isArray(value.relatedData?.significantDates)) {
    value.relatedData.significantDates = value.relatedData.significantDates.map((dateObj: any) => ({
      ...dateObj,
      date: toUnixTimestamp(dateObj.date),
    }));
  }

  // Validate required fields in booking
  const b = value.booking;

  if (!b.travelDate || typeof b.travelDate !== 'number') {
    return c.json({ message: 'Missing or invalid travel date' }, 400);
  }

  if (!b.clientFinalPaymentDate || typeof b.clientFinalPaymentDate !== 'number') {
    return c.json({ message: 'Missing or invalid client final payment date' }, 400);
  }

  if (!b.supplierFinalPaymentDate || typeof b.supplierFinalPaymentDate !== 'number') {
    return c.json({ message: 'Missing or invalid supplier final payment date' }, 400);
  }

  if (!b.bookingDate || typeof b.bookingDate !== 'number') {
    return c.json({ message: 'Missing or invalid booking date' }, 400);
  }

  if (!b.invoicedDate || typeof b.invoicedDate !== 'number') {
    return c.json({ message: 'Missing or invalid invoiced date' }, 400);
  }

  console.log('relatedData.confirmation:', value.relatedData?.confirmation);

  // Confirmation
  if (!Array.isArray(value.relatedData?.confirmation) || !value.relatedData.confirmation.every((c: any) =>
  typeof c.confirmationNumber === 'string' &&
  typeof c.supplier === 'string'
)) {
  return c.json({ message: 'Missing or invalid confirmations' }, 400);
}


  // Person Details
  if (!Array.isArray(value.relatedData?.personDetails) || !value.relatedData.personDetails.every((person: any) =>
  typeof person.name === 'string' &&
  typeof person.dateOfBirth === 'number'
)) {
  return c.json({ message: 'Missing or invalid people details' }, 400);
}


  // Phone Numbers
  if (!Array.isArray(value.relatedData?.phoneNumbers) ||
    !value.relatedData.phoneNumbers.every((phone: any) =>
      typeof phone.phone === 'string'
    )
  ) {
    return c.json({ message: 'Missing or invalid phone numbers' }, 400);
  }

  // Email Addresses
  if (!Array.isArray(value.relatedData?.emailAddresses) ||
    !value.relatedData.emailAddresses.every((email: any) =>
      typeof email.email === 'string'
    )
  ) {
    return c.json({ message: 'Missing or invalid email addresses' }, 400);
  }

  // Significant Dates
  if (!Array.isArray(value.relatedData?.significantDates) || !value.relatedData.significantDates.every((dateObj: any) =>
  typeof dateObj.date === 'number'
)) {
  return c.json({ message: 'Missing or invalid significant dates' }, 400);
}


  if (typeof b.amount !== 'number') {
    return c.json({ message: 'Missing or invalid amount' }, 400);
  }

  if (typeof b.notes !== 'string') {
    return c.json({ message: 'Missing or invalid notes' }, 400);
  }

  if (typeof b.invoiced !== 'boolean') {
    return c.json({ message: 'Missing or invalid invoiced status' }, 400);
  }

  if (typeof b.paid !== 'boolean') {
    return c.json({ message: 'Missing or invalid paid status' }, 400);
  }

  if (typeof b.paymentDate !== 'number' && b.paymentDate !== null) {
    return c.json({ message: 'Missing or invalid payment date' }, 400);
  }

  if (typeof b.dateCreated !== 'number') {
    return c.json({ message: 'Missing or invalid date created' }, 400);
  }

  return value;
}), async (c) => {
  const body = await c.req.valid('json') as any;
  const relatedData = {
    confirmations: body.relatedData.confirmation,
    personDetails: body.relatedData.personDetails,
    significantDates: body.relatedData.significantDates,
    emailAddresses: body.relatedData.emailAddresses,
    phoneNumbers: body.relatedData.phoneNumbers,
  };

  const newBooking = await createBooking(body.booking, relatedData);
  console.log('New booking result:', newBooking);

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
  const user = c.get("user");
  if (!user || !user.id) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const userId = user.id;

  const idParam = c.req.param("id");
  if (!idParam) return c.json({ message: "Booking ID is required" }, 400);
  const id = parseInt(idParam, 10);
  if (isNaN(id)) return c.json({ message: "Invalid booking ID" }, 400);

  const body = await c.req.json<{
    booking: Partial<Booking>;
    relatedData?: {
      confirmations?: Partial<Confirmation>[];
      personDetails?: Partial<PersonDetail>[];
      significantDates?: Partial<SignificantDate>[];
      emailAddresses?: Partial<EmailAddress>[];
      phoneNumbers?: Partial<PhoneNumber>[];
    };
  }>();

  const b = body.booking;

  b.travelDate = toUnixTimestamp(b.travelDate) ?? undefined;
  b.bookingDate = toUnixTimestamp(b.bookingDate) ?? undefined;
  b.invoicedDate = toUnixTimestamp(b.invoicedDate) ?? undefined;
  b.clientFinalPaymentDate = toUnixTimestamp(b.clientFinalPaymentDate) ?? undefined;
  b.supplierFinalPaymentDate = toUnixTimestamp(b.supplierFinalPaymentDate) ?? undefined;
  b.paymentDate = toUnixTimestamp(b.paymentDate) ?? undefined;
  b.dateCreated = toUnixTimestamp(b.dateCreated) ?? undefined;

  if (Array.isArray(body.relatedData?.personDetails)) {
    body.relatedData.personDetails = body.relatedData.personDetails.map(person => ({
      ...person,
      dateOfBirth: person.dateOfBirth ? toUnixTimestamp(person.dateOfBirth) ?? undefined : undefined,
    }));
  }

  if (Array.isArray(body.relatedData?.significantDates)) {
    body.relatedData.significantDates = body.relatedData.significantDates.map(dateObj => ({
      ...dateObj,
      date: dateObj.date ? toUnixTimestamp(dateObj.date) ?? undefined : undefined,
    }));
  }

  if (b.amount !== undefined && typeof b.amount !== "number") {
    return c.json({ message: "Invalid amount type" }, 400);
  }
  if (b.notes !== undefined && typeof b.notes !== "string") {
    return c.json({ message: "Invalid notes type" }, 400);
  }
  if (b.invoiced !== undefined && typeof b.invoiced !== "boolean") {
    return c.json({ message: "Invalid invoiced status" }, 400);
  }
  if (b.paid !== undefined && typeof b.paid !== "boolean") {
    return c.json({ message: "Invalid paid status" }, 400);
  }
  if (b.paymentDate !== undefined && typeof b.paymentDate !== "number") {
    return c.json({ message: "Invalid payment date" }, 400);
  }

  if (
    Array.isArray(body.relatedData?.confirmations) &&
    !body.relatedData.confirmations.every(
      c => typeof c.confirmationNumber === "string" && typeof c.supplier === "string"
    )
  ) {
    return c.json({ message: "Invalid confirmation(s)" }, 400);
  }

  if (
    Array.isArray(body.relatedData?.personDetails) &&
    !body.relatedData.personDetails.every(
      p => typeof p.name === "string" && typeof p.dateOfBirth === "number"
    )
  ) {
    return c.json({ message: "Invalid person detail(s)" }, 400);
  }

  if (
    Array.isArray(body.relatedData?.significantDates) &&
    !body.relatedData.significantDates.every(d => typeof d.date === "number")
  ) {
    return c.json({ message: "Invalid significant date(s)" }, 400);
  }

  if (
    Array.isArray(body.relatedData?.emailAddresses) &&
    !body.relatedData.emailAddresses.every(e => typeof e.email === "string")
  ) {
    return c.json({ message: "Invalid email address(es)" }, 400);
  }

  if (
    Array.isArray(body.relatedData?.phoneNumbers) &&
    !body.relatedData.phoneNumbers.every(p => typeof p.phone === "string")
  ) {
    return c.json({ message: "Invalid phone number(s)" }, 400);
  }

  const existingBooking = await getBookingById(id, userId);
  if (!existingBooking) {
    return c.json({ message: "Booking not found or unauthorized" }, 404);
  }

  const updatedBookingData = body.booking;
  const updatedRelatedData = {
    confirmations: body.relatedData?.confirmations || [],
    personDetails: body.relatedData?.personDetails || [],
    significantDates: body.relatedData?.significantDates || [],
    emailAddresses: body.relatedData?.emailAddresses || [],
    phoneNumbers: body.relatedData?.phoneNumbers || [],
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