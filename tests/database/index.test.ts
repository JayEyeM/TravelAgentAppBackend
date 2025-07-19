//File: tests/database/index.test.ts
// Description: Tests for the createClient function in the database module


import { createClient, updateClient, getBookingsByClientId } from "../../src/database/index";
import * as database from "../../src/database/index";
import { Client } from "../../src/types/client";

// __mocks__/src/utils/supabase.ts
// export * from '../../src/utils/supabase'; // optional
jest.mock('../../src/utils/supabase', () => require('../../__mocks__/src/utils/supabase'));

import supabase from '../../src/utils/supabase';




// jest.mock("dotenv", () => ({
//   config: jest.fn(() => {
//     process.env.MY_ENV_VAR = "mocked_from_dotenv";
//     return { parsed: { MY_ENV_VAR: "mocked_from_dotenv" } };
//   }),
// }));





const mockClient = (b: any): Client => {
    return b as unknown as Client;
};

describe("createClient Tests", () => {
  it("should return null if user id is missing", async () => {
    const client = mockClient({});
    const created = await createClient(client);
    
     expect(created).toBeNull();
  });

  it("should create a client successfully when user id is provided", async () => {
    const inputClient = mockClient({
      userId: "user123",
      clientName: "Test Client",
      clientEmail: "test@example.com",
      clientPhone: "555-1234",
      clientPostalCode: "A1B2C3",
      clientStreetAddress: "123 Main St",
      clientCity: "Testville",
      clientProvince: "Test Province",
      clientCountry: "Testland",
      notes: "This is a test client",
      paymentDate: 1720000000,
      finalPaymentDate: 1725000000,
    });

    console.log('supabase.from("clients"):', supabase.from("clients"));
console.log('supabase.from("clients").insert([inputClient]):', supabase.from("clients").insert([inputClient]));
console.log('supabase.from("clients").insert([inputClient]).select():', supabase.from("clients").insert([inputClient]).select());
console.log('supabase.from("clients").insert([inputClient]).select().single:', supabase.from("clients").insert([inputClient]).select().single);


   (supabase as any).mockSingle.mockResolvedValueOnce({
  data: {
    id: 1,
    user_id: "user123",
    client_name: "Test Client",
    client_email: "test@example.com",
    client_phone: "555-1234",
    client_postal_code: "A1B2C3",
    client_street_address: "123 Main St",
    client_city: "Testville",
    client_province: "Test Province",
    client_country: "Testland",
    notes: "This is a test client",
    payment_date: 1720000000,
    final_payment_date: 1725000000,
    date_created: 1723000000,
  },
  error: null,
});


    const created = await createClient(inputClient);
    expect(created).toEqual({
      id: 1,
      userId: "user123",
      clientName: "Test Client",
      clientEmail: "test@example.com",
      clientPhone: "555-1234",
      clientPostalCode: "A1B2C3",
      clientStreetAddress: "123 Main St",
      clientCity: "Testville",
      clientProvince: "Test Province",
      clientCountry: "Testland",
      notes: "This is a test client",
      paymentDate: 1720000000,
      finalPaymentDate: 1725000000,
      dateCreated: 1723000000,
    });
  });
});


describe("updateClient Tests", () => {
  it("should update client fields successfully", async () => {
    const clientId = 1;
    const userId = "user123";
    const updatedFields = {
      clientName: "Updated Name",
      clientEmail: "updated@example.com",
    };

    (supabase as any).mockSingle.mockResolvedValueOnce({
      data: {
        id: clientId,
        user_id: userId,
        client_name: "Updated Name",
        client_email: "updated@example.com",
        client_phone: "555-1234",
        client_postal_code: "A1B2C3",
        client_street_address: "123 Main St",
        client_city: "Testville",
        client_province: "Test Province",
        client_country: "Testland",
        notes: "Some notes",
        payment_date: 1720000000,
        final_payment_date: 1725000000,
        date_created: 1723000000,
      },
      error: null,
    });

    const result = await updateClient(clientId, userId, updatedFields);

    expect(result).toEqual({
      
      id: clientId,
      userId,
      clientName: "Updated Name",
      clientEmail: "updated@example.com",
      clientPhone: "555-1234",
      clientPostalCode: "A1B2C3",
      clientStreetAddress: "123 Main St",
      clientCity: "Testville",
      clientProvince: "Test Province",
      clientCountry: "Testland",
      notes: "Some notes",
      paymentDate: 1720000000,
      finalPaymentDate: 1725000000,
      dateCreated: 1723000000,
    });
  });
});



describe("getBookingsByClientId Tests", () => {
  const clientId = 1;
  const userId = "user123";

  it("should return an empty array if the client does not belong to the user", async () => {
    // Client not found
    (supabase as any).mockSingle
      .mockResolvedValueOnce({ data: null, error: { message: "Not found" } });

    // fetchAllBookingsForClient still called but return empty
    jest.spyOn(database, "fetchAllBookingsForClient")
      .mockResolvedValueOnce({ data: [], error: null } as any);

    const bookings = await getBookingsByClientId(clientId, userId);
    expect(bookings).toEqual([]);
  });

  it("should return an empty array if no bookings are found", async () => {
    // Client exists
    (supabase as any).mockSingle
      .mockResolvedValueOnce({ data: { id: clientId, user_id: userId }, error: null });

    // No bookings returned
    jest.spyOn(database, "fetchAllBookingsForClient")
      .mockResolvedValueOnce({ data: [], error: null } as any);

    const bookings = await getBookingsByClientId(clientId, userId);
    expect(bookings).toEqual([]);
  });

  it("should return bookings with related data", async () => {
    // Client exists
    (supabase as any).mockSingle
      .mockResolvedValueOnce({ data: { id: clientId, user_id: userId }, error: null });

    // Bookings data
    const booking1 = {
      id: 1,
      clientId,
      travelDate: 123,
      clientFinalPaymentDate: 456,
      supplierFinalPaymentDate: 789,
      bookingDate: 111,
      invoicedDate: 222,
      referenceCode: "REF1",
      amount: 100,
      notes: "Notes 1",
      invoiced: true,
      paid: true,
      paymentDate: 333,
      dateCreated: 444
    };
    const booking2 = {
      id: 2,
      clientId,
      travelDate: 555,
      clientFinalPaymentDate: 666,
      supplierFinalPaymentDate: 777,
      bookingDate: 888,
      invoicedDate: 999,
      referenceCode: "REF2",
      amount: 200,
      notes: "Notes 2",
      invoiced: false,
      paid: false,
      paymentDate: 111,
      dateCreated: 222
    };

    jest.spyOn(database, "fetchAllBookingsForClient")
      .mockResolvedValueOnce({ data: [booking1, booking2], error: null } as any);

    // Related mocks for booking1
    const confirmationMock1 = { id: 10, bookingId: 1, confirmationNumber: "CONF123", supplier: "SupplierA" };
    const personDetailsMock1 = [{ id: 11, bookingId: 1, name: "Alice", dateOfBirth: 111111 }];
    const significantDatesMock1 = [{ id: 12, bookingId: 1, date: 222222 }];
    const emailAddressesMock1 = [{ id: 13, bookingId: 1, email: "alice@example.com" }];
    const phoneNumbersMock1 = [{ id: 14, bookingId: 1, phone: "123-4567" }];

    // Related mocks for booking2
    const confirmationMock2 = { id: 20, bookingId: 2, confirmationNumber: "CONF456", supplier: "SupplierB" };
    const personDetailsMock2 = [{ id: 21, bookingId: 2, name: "Bob", dateOfBirth: 333333 }];
    const significantDatesMock2 = [{ id: 22, bookingId: 2, date: 444444 }];
    const emailAddressesMock2 = [{ id: 23, bookingId: 2, email: "bob@example.com" }];
    const phoneNumbersMock2 = [{ id: 24, bookingId: 2, phone: "987-6543" }];

    // Spies for each fetch function
    jest.spyOn(database, "fetchConfirmationForBooking")
      .mockResolvedValueOnce({ data: confirmationMock1, error: null } as any)
      .mockResolvedValueOnce({ data: confirmationMock2, error: null } as any);

    jest.spyOn(database, "fetchPersonDetailsForBooking")
      .mockResolvedValueOnce({ data: personDetailsMock1, error: null } as any)
      .mockResolvedValueOnce({ data: personDetailsMock2, error: null } as any);

    jest.spyOn(database, "fetchSignificantDatesForBooking")
      .mockResolvedValueOnce({ data: significantDatesMock1, error: null } as any)
      .mockResolvedValueOnce({ data: significantDatesMock2, error: null } as any);

    jest.spyOn(database, "fetchEmailAddressesForBooking")
      .mockResolvedValueOnce({ data: emailAddressesMock1, error: null } as any)
      .mockResolvedValueOnce({ data: emailAddressesMock2, error: null } as any);

    jest.spyOn(database, "fetchPhoneNumbersForBooking")
      .mockResolvedValueOnce({ data: phoneNumbersMock1, error: null } as any)
      .mockResolvedValueOnce({ data: phoneNumbersMock2, error: null } as any);

      const spy = jest.spyOn(database, "fetchAllBookingsForClient")
  .mockResolvedValueOnce({ data: [booking1, booking2], error: null } as any);
      
      console.log("Spy setup result:", spy.getMockName ? spy.getMockName() : "spy set");
console.log("Will return:", [booking1, booking2]);

    // Run the function
    const bookings = await getBookingsByClientId(clientId, userId);

    console.log("Bookings returned from getBookingsByClientId:", bookings);

    // Assertions
    expect(bookings.length).toBe(2);

    // booking1
    expect(bookings[0]).toMatchObject({
      id: 1,
      clientId,
      confirmation: confirmationMock1,
      personDetails: personDetailsMock1,
      significantDates: significantDatesMock1,
      emailAddresses: emailAddressesMock1,
      phoneNumbers: phoneNumbersMock1
    });

    // booking2
    expect(bookings[1]).toMatchObject({
      id: 2,
      clientId,
      confirmation: confirmationMock2,
      personDetails: personDetailsMock2,
      significantDates: significantDatesMock2,
      emailAddresses: emailAddressesMock2,
      phoneNumbers: phoneNumbersMock2
    });
  });
});


