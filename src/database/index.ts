import path from "path";
import fs from 'fs/promises';
import { Client } from "../types/client";
import { Booking } from "../types/booking"; 

const clientsFilePath = path.join(process.cwd(), 'src', 'data', 'clients.json');
const bookingsFilePath = path.join(process.cwd(), 'src', 'data', 'bookings.json'); 

/** Helper functions for reading/writing Clients */
const readClients = async (): Promise<Client[]> => {
  try {
    const fileContent = await fs.readFile(clientsFilePath, 'utf8');
    return JSON.parse(fileContent ?? '[]') as Client[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

export async function saveClients(clients: Client[]) {
  await fs.writeFile(clientsFilePath, JSON.stringify(clients, null, 2));
}

/** CRUD for Clients */
export async function getAllClients(): Promise<Client[]> {
  return readClients();
}

export async function getClientById(id: number): Promise<Client | null> {
  const clients = await readClients();
  const client = clients.find(client => client.id === id);
  return client || null;
}

export async function createClient(client: Client): Promise<Client> {
  const clients = await readClients();
  client.id = clients.length > 0 ? clients[clients.length - 1].id + 1 : 1;
  client.dateCreated = Date.now();
  clients.push(client);
  await saveClients(clients);
  return client;
}

export async function updateClient(updatedClient: Client): Promise<Client | null> {
  const clients = await readClients();
  const clientIndex = clients.findIndex(client => client.id === updatedClient.id);
  if (clientIndex === -1) return null;
  clients[clientIndex] = { ...clients[clientIndex], ...updatedClient };
  await saveClients(clients);
  return clients[clientIndex];
}

export async function deleteClient(id: number): Promise<boolean> {
  const clients = await readClients();
  const updatedClients = clients.filter(client => client.id !== id);
  if (updatedClients.length === clients.length) return false;
  await saveClients(updatedClients);
  return true;
}

/** Helper functions for reading/writing Bookings */
const readBookings = async (): Promise<Booking[]> => {
  try {
    const fileContent = await fs.readFile(bookingsFilePath, 'utf8');
    return JSON.parse(fileContent ?? '[]') as Booking[];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
};

export async function saveBookings(bookings: Booking[]) {
  await fs.writeFile(bookingsFilePath, JSON.stringify(bookings, null, 2));
}

/** CRUD for Bookings */
export async function getAllBookings(): Promise<Booking[]> {
  return readBookings();
}

export async function getBookingById(id: number): Promise<Booking | null> {
  const bookings = await readBookings();
  const booking = bookings.find(booking => booking.id === id);
  return booking || null;
}

export async function createBooking(booking: Booking): Promise<Booking> {
  const bookings = await readBookings();
  booking.id = bookings.length > 0 ? bookings[bookings.length - 1].id + 1 : 1;
  bookings.push(booking);
  await saveBookings(bookings);
  return booking;
}

export async function updateBooking(updatedBooking: Booking): Promise<Booking | null> {
  const bookings = await readBookings();
  const bookingIndex = bookings.findIndex(booking => booking.id === updatedBooking.id);
  if (bookingIndex === -1) return null;
  bookings[bookingIndex] = { ...bookings[bookingIndex], ...updatedBooking };
  await saveBookings(bookings);
  return bookings[bookingIndex];
}

export async function deleteBooking(id: number): Promise<boolean> {
  const bookings = await readBookings();
  const updatedBookings = bookings.filter(booking => booking.id !== id);
  if (updatedBookings.length === bookings.length) return false;
  await saveBookings(updatedBookings);
  return true;
}
