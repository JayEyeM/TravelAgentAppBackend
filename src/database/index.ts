//File: src/database/index.ts
//This file contains functions to interact with the Supabase database for managing clients and bookings.

import supabase from '../utils/supabase';
import { Client } from '../types/client';
import {Booking, BookingInput } from '../types/booking';
import { formatBookingForSupabase } from '../utils/formatBooking';
import { Confirmation, PersonDetail, SignificantDate, EmailAddress, PhoneNumber } from '../types/booking';
import { snakeToCamel2, camelToSnake2 } from '../utils/caseConverter2';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

/** Get all clients */
export async function getAllClients(userId: string): Promise<Client[]> {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }

    // Convert each client object to camelCase before returning
    if (data) {
        return data.map(client => snakeToCamel2(client));
    } else {
        return [];
    }
}


/** Get a single client by ID */
export async function getClientById(id: number, user_id: string): Promise<Client | null> {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('user_id', user_id)
        .single();

    if (error) {
        console.error(`Error fetching client ${id}:`, error);
        return null;
    }

    if (!data) {
      return null;
    }

    return snakeToCamel2(data);
}


/** Create a new client */
export async function createClient(client: Omit<Client, 'id' | 'dateCreated'>): Promise<Client | null> {
    if (!client.userId) {
        console.error("❌ Error: userId is missing!");
        return null;
    }

    const formattedClient = {
        user_id: client.userId, // Ensure this is included
        client_name: client.clientName,
        client_email: client.clientEmail,
        client_phone: client.clientPhone,
        client_postal_code: client.clientPostalCode,
        client_street_address: client.clientStreetAddress,
        client_city: client.clientCity,
        client_province: client.clientProvince,
        client_country: client.clientCountry,
        notes: client.notes,
        payment_date: client.paymentDate ?? null,
        final_payment_date: client.finalPaymentDate ?? null,
        date_created: Math.floor(Date.now() / 1000), // Store as Unix Timestamp
    };

    const { data, error } = await supabase
        .from('clients')
        .insert([formattedClient])
        .select()
        .single();

        console.log('DEBUG createClient supabase insert data:', data);
    console.log('DEBUG createClient supabase insert error:', error);

     if (data) {
    const camelClient = snakeToCamel2(data);
    console.log("✅ Client successfully created (camelCase):", camelClient);
    return camelClient;
  } else {
    return null;
  }
}



export async function updateClient(
  clientId: number,
  userId: string,
  updatedClient: Partial<Client>
): Promise<Client | null> {
  const formattedClient = camelToSnake2(updatedClient);

  const { data, error } = await supabase
    .from('clients')
    .update(formattedClient)
    .eq('id', clientId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error(`Error updating client ${clientId}:`, error);
    return null;
  }

  return data ? snakeToCamel2(data) : null;
}



/** Delete a client */
export async function deleteClient(id: number, userId: string): Promise<boolean>
 {
    const { error } = await supabase
        .from('clients')
        .delete()
.eq('id', id)
.eq('user_id', userId) // Pass userId as an arg


    if (error) {
        console.error(`Error deleting client ${id}:`, error);
        return false;
    }

    return true;
}

/** Get all bookings along with related data */
export async function getAllBookings(): Promise<Booking[]> {
    const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*');

    if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        return [];
    }

    // Fetch related data for each booking (you can optimize with JOINs if needed)
    const bookingsWithDetails = await Promise.all(bookings.map(async (booking) => {
        const { data: confirmation, error: confirmationError } = await supabase
            .from('confirmation')
            .select('*')
            .eq('bookingId', booking.id)
            .single();

        const { data: personDetails, error: personDetailsError } = await supabase
            .from('person_details')
            .select('*')
            .eq('bookingId', booking.id);

        const { data: significantDates, error: significantDatesError } = await supabase
            .from('significant_dates')
            .select('*')
            .eq('bookingId', booking.id);

        const { data: emailAddresses, error: emailAddressesError } = await supabase
            .from('email_addresses')
            .select('*')
            .eq('bookingId', booking.id);

        const { data: phoneNumbers, error: phoneNumbersError } = await supabase
            .from('phone_numbers')
            .select('*')
            .eq('bookingId', booking.id);

        if (confirmationError || personDetailsError || significantDatesError || emailAddressesError || phoneNumbersError) {
            console.error('Error fetching related data:', confirmationError, personDetailsError, significantDatesError, emailAddressesError, phoneNumbersError);
        }

        return {
            ...booking,
            confirmation,
            personDetails,
            significantDates,
            emailAddresses,
            phoneNumbers
        };
    }));

    return bookingsWithDetails;
}

export async function fetchAllBookingsForClient(clientId: number): Promise<PostgrestSingleResponse<any[]>> {
  // fetch all bookings for this client
  
  return supabase
    .from('bookings')
    .select('*')
    .eq('client_id', clientId);
  }


/** Get all bookings by client ID for a specific user */
export async function getBookingsByClientId(clientId: number, userId: string): Promise<Booking[]> {
  // verfy client belongs to the user
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .eq('user_id', userId)
    .single();

  if (clientError || !client) {
    console.error(`❌ Client ${clientId} not found or unauthorized for user ${userId}`);
    return [];
  }

  const { data: bookings, error: bookingsError } = await fetchAllBookingsForClient(clientId);

  if (bookingsError || !bookings) {
    console.error(`❌ Error fetching bookings for client ${clientId}:`, bookingsError);
    return [];
  }

  // Fetch related data for each booking
  const bookingsWithDetails = await Promise.all(bookings.map(async (booking) => {
    const [
      { data: confirmation },
      { data: personDetails },
      { data: significantDates },
      { data: emailAddresses },
      { data: phoneNumbers },
    ] = await Promise.all([
      supabase.from('confirmation').select('*').eq('booking_id', booking.id).single(),
      supabase.from('person_details').select('*').eq('booking_id', booking.id),
      supabase.from('significant_dates').select('*').eq('booking_id', booking.id),
      supabase.from('email_addresses').select('*').eq('booking_id', booking.id),
      supabase.from('phone_numbers').select('*').eq('booking_id', booking.id),
    ]);

    return {
      ...snakeToCamel2(booking),
      confirmation,
      personDetails,
      significantDates,
      emailAddresses,
      phoneNumbers,
    };
  }));

  return bookingsWithDetails;
}


// Get a single booking by ID including related data 
// This function fetches a booking by its ID and ensures the user owns the booking before returning
export async function getBookingById(
  bookingId: number,
  userId: string
): Promise<Booking | null> {
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    console.error(`❌ Error fetching booking ${bookingId}:`, bookingError);
    return null;
  }

  const clientId = booking.client_id;

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('id', clientId)
    .single();

  if (clientError || !client) {
    console.error(`❌ Error fetching client ${clientId}:`, clientError);
    return null;
  }

  console.log(`Booking client_id: ${booking.client_id}`);
console.log(`Client user_id: ${client.user_id}`);
console.log(`Request userId: ${userId}`);

  if (client.user_id !== userId) {
    console.warn(`⚠️ Unauthorized access attempt by user ${userId} for booking ${bookingId}`);
    return null;
  }

  const [
    { data: confirmation },
    { data: personDetails },
    { data: significantDates },
    { data: emailAddresses },
    { data: phoneNumbers },
  ] = await Promise.all([
    supabase.from('confirmation').select('*').eq('booking_id', bookingId).single(),
    supabase.from('person_details').select('*').eq('booking_id', bookingId),
    supabase.from('significant_dates').select('*').eq('booking_id', bookingId),
    supabase.from('email_addresses').select('*').eq('booking_id', bookingId),
    supabase.from('phone_numbers').select('*').eq('booking_id', bookingId),
  ]);

  const bookingCamel = snakeToCamel2(booking);

  return {
    ...bookingCamel,
    confirmation,
    personDetails,
    significantDates,
    emailAddresses,
    phoneNumbers,
  };
}





export async function createBooking(
  booking: BookingInput,
  relatedData: {
    confirmations: Omit<Confirmation, 'id' | 'bookingId'>[];
    personDetails: Omit<PersonDetail, 'id' | 'bookingId'>[];
    significantDates: Omit<SignificantDate, 'id' | 'bookingId'>[];
    emailAddresses: Omit<EmailAddress, 'id' | 'bookingId'>[];
    phoneNumbers: Omit<PhoneNumber, 'id' | 'bookingId'>[];
  }
): Promise<{
  booking: Booking;
  confirmations: Confirmation[];
  personDetails: PersonDetail[];
  significantDates: SignificantDate[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
} | null> {
  const formattedBooking = formatBookingForSupabase(booking);

  const { data: insertedBooking, error: bookingError } = await supabase
    .from('bookings')
    .insert([formattedBooking])
    .select()
    .single();

  if (bookingError || !insertedBooking) {
    console.error('Error creating booking:', bookingError);
    return null;
  }

  const bookingId = insertedBooking.id;
  const {
    confirmations,
    personDetails,
    significantDates,
    emailAddresses,
    phoneNumbers,
  } = relatedData;

  // Insert confirmations
  const { data: insertedConfirmations, error: confirmationError } = await supabase
    .from('confirmations')
    .insert(confirmations.map(c => camelToSnake2({ ...c, bookingId })))
    .select();

  // Insert person details
  const { data: insertedPersonDetails, error: personDetailsError } = await supabase
    .from('person_details')
    .insert(personDetails.map(p => camelToSnake2({ ...p, bookingId })))
    .select();

  // Insert significant dates
  const { data: insertedSignificantDates, error: significantDatesError } = await supabase
    .from('significant_dates')
    .insert(significantDates.map(d => camelToSnake2({ ...d, bookingId })))
    .select();

  // Insert email addresses
  const { data: insertedEmailAddresses, error: emailAddressesError } = await supabase
    .from('email_addresses')
    .insert(emailAddresses.map(e => camelToSnake2({ ...e, bookingId })))
    .select();

  // Insert phone numbers
  const { data: insertedPhoneNumbers, error: phoneNumbersError } = await supabase
    .from('phone_numbers')
    .insert(phoneNumbers.map(p => camelToSnake2({ ...p, bookingId })))
    .select();

  if (
    confirmationError ||
    personDetailsError ||
    significantDatesError ||
    emailAddressesError ||
    phoneNumbersError
  ) {
    console.error(
      'Error inserting related data:',
      confirmationError,
      personDetailsError,
      significantDatesError,
      emailAddressesError,
      phoneNumbersError
    );
    return null;
  }

  return {
    booking: insertedBooking,
    confirmations: insertedConfirmations ?? [],
    personDetails: insertedPersonDetails ?? [],
    significantDates: insertedSignificantDates ?? [],
    emailAddresses: insertedEmailAddresses ?? [],
    phoneNumbers: insertedPhoneNumbers ?? []
  };
}





/** Update a booking along with related details */
export async function updateBooking(
  bookingId: number,
  updatedBooking: Partial<Booking>,
  updatedRelatedData: {
    confirmations?: Partial<Confirmation>[];
    personDetails?: Partial<PersonDetail>[];
    significantDates?: Partial<SignificantDate>[];
    emailAddresses?: Partial<EmailAddress>[];
    phoneNumbers?: Partial<PhoneNumber>[];
  }
): Promise<{
  booking: Booking;
  confirmations: Confirmation[];
  personDetails: PersonDetail[];
  significantDates: SignificantDate[];
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
} | null> {
  const formattedBooking = formatBookingForSupabase(updatedBooking);

  // Step 1: Update the booking
  const { data: updatedBookingData, error: bookingError } = await supabase
    .from('bookings')
    .update(formattedBooking)
    .eq('id', bookingId)
    .select()
    .single();

  if (bookingError || !updatedBookingData) {
    console.error(`Error updating booking ${bookingId}:`, bookingError);
    return null;
  }

  const results = {
    booking: updatedBookingData,
    confirmations: [] as Confirmation[],
    personDetails: [] as PersonDetail[],
    significantDates: [] as SignificantDate[],
    emailAddresses: [] as EmailAddress[],
    phoneNumbers: [] as PhoneNumber[],
  };

  // Step 2: Update confirmations
  if (updatedRelatedData.confirmations) {
    const { data, error } = await supabase
      .from('confirmations')
      .upsert(updatedRelatedData.confirmations.map(c => camelToSnake2({ ...c, bookingId })))
      .select();
    if (error) {
      console.error('Error updating confirmations:', error);
      return null;
    }
    results.confirmations = data || [];
  }

  // Step 3: Update person details
  if (updatedRelatedData.personDetails) {
    const { data, error } = await supabase
      .from('person_details')
      .upsert(updatedRelatedData.personDetails.map(p => camelToSnake2({ ...p, bookingId })))
      .select();
    if (error) {
      console.error('Error updating person details:', error);
      return null;
    }
    results.personDetails = data || [];
  }

  // Step 4: Update significant dates
  if (updatedRelatedData.significantDates) {
    const { data, error } = await supabase
      .from('significant_dates')
      .upsert(updatedRelatedData.significantDates.map(d => camelToSnake2({ ...d, bookingId })))
      .select();
    if (error) {
      console.error('Error updating significant dates:', error);
      return null;
    }
    results.significantDates = data || [];
  }

  // Step 5: Update email addresses
  if (updatedRelatedData.emailAddresses) {
    const { data, error } = await supabase
      .from('email_addresses')
      .upsert(updatedRelatedData.emailAddresses.map(e => camelToSnake2({ ...e, bookingId })))
      .select();
    if (error) {
      console.error('Error updating email addresses:', error);
      return null;
    }
    results.emailAddresses = data || [];
  }

  // Step 6: Update phone numbers
  if (updatedRelatedData.phoneNumbers) {
    const { data, error } = await supabase
      .from('phone_numbers')
      .upsert(updatedRelatedData.phoneNumbers.map(p => camelToSnake2({ ...p, bookingId })))
      .select();
    if (error) {
      console.error('Error updating phone numbers:', error);
      return null;
    }
    results.phoneNumbers = data || [];
  }

  return results;
}


//Delete a booking and all related data
// This function deletes a booking by its ID and ensures the user owns the booking before deleting
export async function deleteBooking(id: number, userId: string): Promise<boolean> {
  // Step 0: Check if booking exists and belongs to the user
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('client_id')
    .eq('id', id)
    .single();

  if (bookingError) {
    console.error(`❌ Booking lookup failed:`, bookingError);
    return false;
  }

  if (!booking) {
    console.warn(`⚠️ Booking ${id} not found`);
    return false;
  }

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('user_id')
    .eq('id', booking.client_id)
    .single();

  if (clientError) {
    console.error(`❌ Client lookup failed:`, clientError);
    return false;
  }

  if (!client || client.user_id !== userId) {
    console.warn(`⚠️ Unauthorized delete attempt for booking ${id} by user ${userId}`);
    return false;
  }

  // Step 1: Delete related data
  const { error: confirmationError } = await supabase
    .from('confirmations')
    .delete()
    .eq('booking_id', id);

  const { error: personDetailsError } = await supabase
    .from('person_details')
    .delete()
    .eq('booking_id', id);

  const { error: significantDatesError } = await supabase
    .from('significant_dates')
    .delete()
    .eq('booking_id', id);

  const { error: emailAddressesError } = await supabase
    .from('email_addresses')
    .delete()
    .eq('booking_id', id);

  const { error: phoneNumbersError } = await supabase
    .from('phone_numbers')
    .delete()
    .eq('booking_id', id);

  // Step 2: Delete the booking itself
  const { error: bookingDeleteError } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  if (
    confirmationError ||
    personDetailsError ||
    significantDatesError ||
    emailAddressesError ||
    phoneNumbersError ||
    bookingDeleteError
  ) {
    console.error('❌ Error deleting booking or related data:', {
      confirmationError,
      personDetailsError,
      significantDatesError,
      emailAddressesError,
      phoneNumbersError,
      bookingDeleteError,
    });
    return false;
  }

  console.log(`✅ Booking ${id} and related data deleted for user ${userId}`);
  return true;
}


