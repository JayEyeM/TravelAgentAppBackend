import path from "path";
import fs from 'fs/promises';
import { Client } from "../types/client";

// const readClients = async (): Promise<Client[]> => {
//   try {
//     const fileContent = await fs.readFile(clientsFilePath, 'utf8')
//     return JSON.parse(fileContent) as Client[]
//   } catch (error) {
//     if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
//       return []
//     }
//     throw error
//   }
// }

// // write the clients to the file
// const writeClientsToFile = async (clients: Client[]): Promise<void> => {
//   await fs.writeFile(clientsFilePath, JSON.stringify(clients, null, 2));
// };

// // initialise the clients array from the file
// let clients: Client[] = [];

// //load the clients from the file on startup of the server
// const loadClients = async () => {
//   clients = await readClients();
// };

// // save the clients to the file on shutdown of the server
// const saveClients = async () => {
//   await writeClientsToFile(clients);
// }; 

const clientsFilePath = path.join(process.cwd(), 'src', 'data', 'clients.json')

/** These functions handle the actual read/write to the file */
const readClients = async (): Promise<Client[]> => {
  try {
    const fileContent = await fs.readFile(clientsFilePath, 'utf8')
    return JSON.parse(fileContent ?? '[]') as Client[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }
}

export async function saveClients(clients: Client[]) {
    await fs.writeFile(clientsFilePath, JSON.stringify(clients, null, 2));
}

/** These functions handle your 'entities' and interacting with the database */
export async function getAllClients(): Promise<Client[]> {
    return readClients();
}

export async function getClientById(id: number): Promise<Client | null> {
    const clients = await readClients();

    const idx = clients.findIndex(client => client.id === id)

    if (idx === -1) {
        return null;
    }

    return clients[idx];
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

  if (clientIndex === -1) {
      return null; 
  }

  
  clients[clientIndex] = { ...clients[clientIndex], ...updatedClient };

  await saveClients(clients);

  return clients[clientIndex];
}


export async function deleteClient(id: number): Promise<boolean> {
  const clients = await readClients();

  const initialLength = clients.length;
  const updatedClients = clients.filter(client => client.id !== id);

  if (updatedClients.length === initialLength) {
      return false; 
  }

  await saveClients(updatedClients);
  return true;
}



