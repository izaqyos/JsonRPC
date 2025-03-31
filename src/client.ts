import axios from 'axios';
import { JSONRPCClient, JSONRPCRequest } from 'json-rpc-2.0';

// Define the type for our item (matching the server)
interface Item {
    id: string;
    name: string;
    description: string;
}

const SERVER_URL = "http://localhost:5001/jsonrpc";

// Configure the JSON-RPC client to use Axios for requests
const client = new JSONRPCClient(async (jsonRPCRequest: JSONRPCRequest) => {
    try {
        console.log("\nSending request:", JSON.stringify(jsonRPCRequest, null, 2));
        const response = await axios.post(SERVER_URL, jsonRPCRequest, {
            headers: {
                'content-type': 'application/json',
            },
        });

        if (response.status === 200) {
            // Use client.receive when you received a JSON-RPC response.
            console.log("Received response:", JSON.stringify(response.data, null, 2));
            client.receive(response.data);
        } else if (response.status === 204) {
            // Notification, no response content
            console.log("Received notification confirmation (204 No Content).");
            // If the server returns 204 No Content, it means the request was a notification.
            // We don't need to call receive in this case.
            return;
        } else {
            // Handle other HTTP statuses if needed
            const errorText = `HTTP error! status: ${response.status}, body: ${JSON.stringify(response.data)}`;
            console.error(errorText);
            // Reject the promise for the calling request function
            return Promise.reject(new Error(errorText));
        }
    } catch (error: any) {
        const errorText = error?.message || 'Axios request failed';
        console.error("Request failed:", errorText);
        // You might need to decide how to handle the error state for the client
        // For instance, reject the promise for the specific request that failed
        // This requires matching request IDs, which JSONRPCClient handles internally
        // if we pass the error to it via `receive`. Let's simulate an RPC error response.
        if (jsonRPCRequest.id) {
             client.receive({
                jsonrpc: "2.0",
                error: { code: -32000, message: errorText },
                id: jsonRPCRequest.id,
            });
        }
    }
});

// Helper function to make calls and handle potential null results/errors
async function callRpc<T>(method: string, params: object): Promise<T | null> {
    try {
        const result: T = await client.request(method, params);
        return result;
    } catch (error: any) {
        console.error(`RPC call ${method} failed:`, error.message || error);
        return null;
    }
}

// Main client logic
async function runClient() {
    console.log("--- TypeScript JSON-RPC Client Example ---");

    // 1. Create items
    console.log("\n1. Creating items...");
    const item1 = await callRpc<Item>('create_item', { name: "Apple", description: "A crisp red fruit" });
    const item2 = await callRpc<Item>('create_item', { name: "Banana", description: "A yellow curved fruit" });
    console.log(`Created item 1:`, item1);
    console.log(`Created item 2:`, item2);

    // 2. List items
    console.log("\n2. Listing items...");
    const items = await callRpc<Item[]>('list_items', {});
    console.log(`Current items:`, items);

    // 3. Read an item
    console.log("\n3. Reading item 1...");
    if (item1?.id) {
        const readItemResult = await callRpc<Item>('read_item', { item_id: item1.id });
        console.log(`Read item ${item1.id}:`, readItemResult);
    } else {
        console.log("Skipping read, item1 creation failed or has no ID.");
    }

    // 4. Update an item
    console.log("\n4. Updating item 1...");
    if (item1?.id) {
        const updatedItem = await callRpc<Item>('update_item', { item_id: item1.id, description: "A delicious Honeycrisp apple" });
        console.log(`Updated item ${item1.id}:`, updatedItem);
    } else {
        console.log("Skipping update, item1 creation failed or has no ID.");
    }

    // 5. Read the updated item
    console.log("\n5. Reading updated item 1...");
    if (item1?.id) {
        const readUpdatedItemResult = await callRpc<Item>('read_item', { item_id: item1.id });
        console.log(`Read updated item ${item1.id}:`, readUpdatedItemResult);
    } else {
        console.log("Skipping read, item1 creation failed or has no ID.");
    }

    // 6. Delete an item
    console.log("\n6. Deleting item 2...");
    if (item2?.id) {
        const deleteResult = await callRpc<boolean>('delete_item', { item_id: item2.id });
        console.log(`Delete item ${item2.id} result:`, deleteResult);
    } else {
        console.log("Skipping delete, item2 creation failed or has no ID.");
    }

    // 7. List items again
    console.log("\n7. Listing items again...");
    const finalItems = await callRpc<Item[]>('list_items', {});
    console.log(`Final items:`, finalItems);

    // 8. Try to read deleted item
    console.log("\n8. Attempting to read deleted item 2...");
    if (item2?.id) {
        const readDeletedItem = await callRpc<Item>('read_item', { item_id: item2.id });
        console.log(`Read deleted item ${item2.id}:`, readDeletedItem); // Should be null
    } else {
        console.log("Skipping read, item2 was not created or has no ID.");
    }

    console.log("\n--- Client Finished ---");
}

runClient().catch(error => {
    console.error("Client encountered an unhandled error:", error);
}); 