import supabase from '../utils/supabase';
import { Client } from '../types/client';
import { Booking } from '../types/booking';

/** Get all clients */
export async function getAllClients(): Promise<Client[]> {
    const { data, error } = await supabase.from('clients').select('*');
    
    if (error) {
        console.error('Error fetching clients:', error);
        return [];
    }

    return data || [];
}

/** Get a single client by ID */
export async function getClientById(id: number): Promise<Client | null> {
    const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
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

/** Get all bookings */
export async function getAllBookings(): Promise<Booking[]> {
    const { data, error } = await supabase.from('bookings').select('*');

    if (error) {
        console.error('Error fetching bookings:', error);
        return [];
    }

    return data || [];
}

/** Get a booking by ID */
export async function getBookingById(id: number): Promise<Booking | null> {
    const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error(`Error fetching booking ${id}:`, error);
        return null;
    }

    return data;
}

/** Create a new booking */
export async function createBooking(booking: Omit<Booking, 'id'>): Promise<Booking | null> {
    const { data, error } = await supabase
        .from('bookings')
        .insert([booking])
        .select()
        .single();

    if (error) {
        console.error('Error creating booking:', error);
        return null;
    }

    return data;
}

/** Update a booking */
export async function updateBooking(bookingId: number, updatedBooking: Partial<Booking>): Promise<Booking | null> {
    const { data, error } = await supabase
        .from('bookings')
        .update(updatedBooking)
        .eq('id', bookingId)
        .select()
        .single();

    if (error) {
        console.error(`Error updating booking ${bookingId}:`, error);
        return null;
    }

    return data;
}

/** Delete a booking */
export async function deleteBooking(id: number): Promise<boolean> {
    const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`Error deleting booking ${id}:`, error);
        return false;
    }

    return true;
}
