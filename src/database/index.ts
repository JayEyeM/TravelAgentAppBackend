import supabase from '../utils/supabase';
import { Client } from '../types/client';
import { Booking } from '../types/booking';
import { formatBookingForSupabase } from '../utils/formatBooking';
import { Confirmation, PersonDetail, SignificantDate, EmailAddress, PhoneNumber } from '../types/booking';

/** Get all clients */
export async function getAllClients(userId: string): Promise<Client[]> {
    const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    ;
    
    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }

    return data || [];
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

    return data;
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

    if (error) {
        console.error('❌ Error creating client:', error);
        return null;
    }

    console.log("✅ Client successfully created:", data);
    return data;
}



/** Update a client */
export async function updateClient(clientId: number, updatedClient: Partial<Client>): Promise<Client | null> {
    const { data, error } = await supabase
        .from('clients')
        .update(updatedClient)
        .eq('id', clientId)
        .select()
        .single();

    if (error) {
        console.error(`Error updating client ${clientId}:`, error);
        return null;
    }

    return data;
}

/** Delete a client */
export async function deleteClient(id: number): Promise<boolean> {
    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

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


/** Get a booking by ID along with related data */
export async function getBookingById(id: number): Promise<Booking | null> {
    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

    if (bookingError) {
        console.error(`Error fetching booking ${id}:`, bookingError);
        return null;
    }

    // Fetch related data for the specific booking
    const { data: confirmation, error: confirmationError } = await supabase
        .from('confirmation')
        .select('*')
        .eq('bookingId', id)
        .single();

    const { data: personDetails, error: personDetailsError } = await supabase
        .from('person_details')
        .select('*')
        .eq('bookingId', id);

    const { data: significantDates, error: significantDatesError } = await supabase
        .from('significant_dates')
        .select('*')
        .eq('bookingId', id);

    const { data: emailAddresses, error: emailAddressesError } = await supabase
        .from('email_addresses')
        .select('*')
        .eq('bookingId', id);

    const { data: phoneNumbers, error: phoneNumbersError } = await supabase
        .from('phone_numbers')
        .select('*')
        .eq('bookingId', id);

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
}


/** Create a new booking along with related details */
export async function createBooking(booking: Omit<Booking, 'id'>, relatedData: {
    confirmation: Confirmation;
    personDetails: PersonDetail[];
    significantDates: SignificantDate[];
    emailAddresses: EmailAddress[];
    phoneNumbers: PhoneNumber[];
}): Promise<Booking | null> {
    const formattedBooking = formatBookingForSupabase(booking);

    // Step 1: Insert the booking
    const { data: insertedBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert([formattedBooking])
        .select()
        .single();

    if (bookingError) {
        console.error('Error creating booking:', bookingError);
        return null;
    }

    // Step 2: Insert related data
    const { confirmation, personDetails, significantDates, emailAddresses, phoneNumbers } = relatedData;

    // Input confirmation
    const { data: insertedConfirmation, error: confirmationError } = await supabase
        .from('confirmation')
        .insert([{ ...confirmation, bookingId: insertedBooking.id }])
        .select()
        .single();

    // onput person details
    const { data: insertedPersonDetails, error: personDetailsError } = await supabase
        .from('person_details')
        .insert(personDetails.map(person => ({ ...person, bookingId: insertedBooking.id })));

    // input significant dates
    const { data: insertedSignificantDates, error: significantDatesError } = await supabase
        .from('significant_dates')
        .insert(significantDates.map(date => ({ ...date, bookingId: insertedBooking.id })));

    // input email addresses
    const { data: insertedEmailAddresses, error: emailAddressesError } = await supabase
        .from('email_addresses')
        .insert(emailAddresses.map(email => ({ ...email, bookingId: insertedBooking.id })));

    // input phone numbers
    const { data: insertedPhoneNumbers, error: phoneNumbersError } = await supabase
        .from('phone_numbers')
        .insert(phoneNumbers.map(phone => ({ ...phone, bookingId: insertedBooking.id })));

    if (confirmationError || personDetailsError || significantDatesError || emailAddressesError || phoneNumbersError) {
        console.error('Error inserting related data:', confirmationError, personDetailsError, significantDatesError, emailAddressesError, phoneNumbersError);
        return null;
    }

    return insertedBooking;
}



/** Update a booking along with related details */
export async function updateBooking(bookingId: number, updatedBooking: Partial<Booking>, updatedRelatedData: {
    confirmation?: Partial<Confirmation>;
    personDetails?: Partial<PersonDetail>[];
    significantDates?: Partial<SignificantDate>[];
    emailAddresses?: Partial<EmailAddress>[];
    phoneNumbers?: Partial<PhoneNumber>[];
}): Promise<Booking | null> {
    const formattedBooking = formatBookingForSupabase(updatedBooking);

    // Step 1: Update the booking
    const { data: updatedBookingData, error: bookingError } = await supabase
        .from('bookings')
        .update(formattedBooking)
        .eq('id', bookingId)
        .select()
        .single();

    if (bookingError) {
        console.error(`Error updating booking ${bookingId}:`, bookingError);
        return null;
    }

    // Step 2: Update related data
    if (updatedRelatedData.confirmation) {
        const { data: updatedConfirmation, error: confirmationError } = await supabase
            .from('confirmation')
            .update(updatedRelatedData.confirmation)
            .eq('bookingId', bookingId)
            .select()
            .single();

        if (confirmationError) {
            console.error('Error updating confirmation:', confirmationError);
            return null;
        }
    }

    if (updatedRelatedData.personDetails) {
        const { data: updatedPersonDetails, error: personDetailsError } = await supabase
            .from('person_details')
            .upsert(updatedRelatedData.personDetails.map(person => ({ ...person, bookingId: bookingId })));

        if (personDetailsError) {
            console.error('Error updating person details:', personDetailsError);
            return null;
        }
    }

    if (updatedRelatedData.significantDates) {
        const { data: updatedSignificantDates, error: significantDatesError } = await supabase
            .from('significant_dates')
            .upsert(updatedRelatedData.significantDates.map(date => ({ ...date, bookingId: bookingId })));

        if (significantDatesError) {
            console.error('Error updating significant dates:', significantDatesError);
            return null;
        }
    }

    if (updatedRelatedData.emailAddresses) {
        const { data: updatedEmailAddresses, error: emailAddressesError } = await supabase
            .from('email_addresses')
            .upsert(updatedRelatedData.emailAddresses.map(email => ({ ...email, bookingId: bookingId })));

        if (emailAddressesError) {
            console.error('Error updating email addresses:', emailAddressesError);
            return null;
        }
    }

    if (updatedRelatedData.phoneNumbers) {
        const { data: updatedPhoneNumbers, error: phoneNumbersError } = await supabase
            .from('phone_numbers')
            .upsert(updatedRelatedData.phoneNumbers.map(phone => ({ ...phone, bookingId: bookingId })));

        if (phoneNumbersError) {
            console.error('Error updating phone numbers:', phoneNumbersError);
            return null;
        }
    }

    return updatedBookingData;
}


/** Delete a booking and its related details */
export async function deleteBooking(id: number): Promise<boolean> {
    // Step 1: Delete related data first
    const { error: confirmationError } = await supabase
        .from('confirmation')
        .delete()
        .eq('bookingId', id);

    const { error: personDetailsError } = await supabase
        .from('person_details')
        .delete()
        .eq('bookingId', id);

    const { error: significantDatesError } = await supabase
        .from('significant_dates')
        .delete()
        .eq('bookingId', id);

    const { error: emailAddressesError } = await supabase
        .from('email_addresses')
        .delete()
        .eq('bookingId', id);

    const { error: phoneNumbersError } = await supabase
        .from('phone_numbers')
        .delete()
        .eq('bookingId', id);

    // Step 2: Delete the booking
    const { error: bookingError } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

    if (confirmationError || personDetailsError || significantDatesError || emailAddressesError || phoneNumbersError || bookingError) {
        console.error('Error deleting booking or related data:', confirmationError, personDetailsError, significantDatesError, emailAddressesError, phoneNumbersError, bookingError);
        return false;
    }

    return true;
}

