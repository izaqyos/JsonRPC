import express, { Request, Response } from 'express';
import { JSONRPCServer, JSONRPCParams, JSONRPCResponse } from 'json-rpc-2.0';

// Define the type for our item
interface Item {
    id: string;
    name: string;
    description: string;
}

// In-memory data store (replace with a proper database in a real application)
const dataStore: Map<string, Item> = new Map();
let nextId = 1;

// Instantiate the JSON-RPC server
const server = new JSONRPCServer();

// --- CRUD Methods ---

// Create
const createItem = (params: { name: string; description: string }): Item => {
    const id = String(nextId++);
    const newItem: Item = {
        id,
        name: params.name,
        description: params.description,
    };
    dataStore.set(id, newItem);
    console.log(`Created item:`, newItem);
    return newItem;
};
server.addMethod('create_item', createItem);

// Read
const readItem = (params: { item_id: string }): Item | null => {
    const item = dataStore.get(params.item_id) || null;
    console.log(`Read item ${params.item_id}:`, item);
    return item;
};
server.addMethod('read_item', readItem);

// List
const listItems = (): Item[] => {
    const items = Array.from(dataStore.values());
    console.log(`Listed items:`, items);
    return items;
};
server.addMethod('list_items', listItems);

// Update
const updateItem = (params: { item_id: string; name?: string; description?: string }): Item | null => {
    const item = dataStore.get(params.item_id);
    if (!item) {
        console.log(`Update failed: Item ${params.item_id} not found.`);
        return null;
    }

    if (params.name !== undefined) {
        item.name = params.name;
    }
    if (params.description !== undefined) {
        item.description = params.description;
    }
    console.log(`Updated item ${params.item_id}:`, item);
    return item;
};
server.addMethod('update_item', updateItem);

// Delete
const deleteItem = (params: { item_id: string }): boolean => {
    if (dataStore.has(params.item_id)) {
        dataStore.delete(params.item_id);
        console.log(`Deleted item ${params.item_id}`);
        return true;
    }
    console.log(`Delete failed: Item ${params.item_id} not found.`);
    return false;
};
server.addMethod('delete_item', deleteItem);

const deleteAllItems = (): boolean => {
    const count = dataStore.size;  // Use Map's size property
    // Clear the data store using Map's clear method
    dataStore.clear();
    // Reset the ID counter
    nextId = 1;
    console.log(`Deleted all items (${count} items removed)`);
    return true;
};

server.addMethod('delete_all_items', deleteAllItems);

// --- Express Setup ---

const app = express();
app.use(express.json());

app.post('/jsonrpc', (req: Request, res: Response) => {
    const jsonRPCRequest = req.body;
    // server.receive takes a JSON-RPC request and returns a promise of a JSON-RPC response.
    console.log("Received request:", JSON.stringify(jsonRPCRequest, null, 2));

    // It needs to be properly typed, otherwise ParamsObject type check fails
    if (jsonRPCRequest) {
        // Add explicit type JSONRPCResponse | null because receive can return null for notifications
        server.receive(jsonRPCRequest).then((jsonRPCResponse: JSONRPCResponse | null) => {
            if (jsonRPCResponse) {
                console.log("Sending response:", JSON.stringify(jsonRPCResponse, null, 2));
                res.json(jsonRPCResponse);
            } else {
                // If response is absent, it was a JSON-RPC notification without response.
                // Respond with no content status (204)
                console.log("Received notification, no response needed.")
                res.sendStatus(204);
            }
        });
    } else {
        res.status(400).send('Invalid Request');
    }
});

const PORT = process.env.PORT || 5001; // Use a different port than Python example

app.listen(PORT, () => {
    console.log(`JSON-RPC server is running on http://localhost:${PORT}/jsonrpc`);
}); 