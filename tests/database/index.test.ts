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
    (supabase as any).mockSingle
      .mockResolvedValueOnce({ data: null, error: { message: "Not found" } });
      jest.spyOn(database, 'fetchAllBookingsForClient').mockResolvedValueOnce({ data: [], error: null } as any);

    const bookings = await getBookingsByClientId(clientId, userId);
    expect(bookings).toEqual([]);
  });

  it("should return an empty array if no bookings are found", async () => {
    
    (supabase as any).mockSingle
      .mockResolvedValueOnce({ data: { id: clientId, user_id: userId }, error: null });

   
    (supabase as any).mockSelect.mockResolvedValueOnce({ data: [], error: null });

    const bookings = await getBookingsByClientId(clientId, userId);
    expect(bookings).toEqual([]);
  });

  it("should return bookings with related data", async () => {
    
    (supabase as any).mockSingle
      .mockResolvedValueOnce({ data: { id: clientId, user_id: userId }, error: null });

  
    (supabase as any).mockSelect.mockResolvedValueOnce({
      data: [
        { id: 1, client_id: clientId, destination: "Test Land" },
        { id: 2, client_id: clientId, destination: "Other Place" }
      ],
      error: null
    });

    
    const confirmationMock = { id: 10, confirmed: true };
    const personDetailsMock = [{ id: 11, name: "Alice" }];
    const significantDatesMock = [{ id: 12, date_type: "departure" }];
    const emailAddressesMock = [{ id: 13, email: "a@example.com" }];
    const phoneNumbersMock = [{ id: 14, number: "123-4567" }];

    (supabase as any).mockSingle
      .mockResolvedValue({ data: confirmationMock, error: null });

    (supabase as any).mockSingle.mockResolvedValue([
      { data: personDetailsMock, error: null },
      { data: significantDatesMock, error: null },
      { data: emailAddressesMock, error: null },
      { data: phoneNumbersMock, error: null }
    ]);

    const bookings = await getBookingsByClientId(clientId, userId);
    expect(bookings.length).toBe(2);
    expect(bookings[0]).toMatchObject({
      clientId,
      confirmation: confirmationMock,
      personDetails: personDetailsMock,
      significantDates: significantDatesMock,
      emailAddresses: emailAddressesMock,
      phoneNumbers: phoneNumbersMock
    });
  });
});
