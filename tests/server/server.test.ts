import { JSONRPCServer } from 'json-rpc-2.0';

// Mock the data store and methods from server.ts
// This is a simplified example. In a real app, you might export these 
// functions or use dependency injection for better testability.

interface Item {
    id: string;
    name: string;
    description: string;
}

let testDataStore: { [key: string]: Item } = {};
let testNextId = 1;

// Re-implement or import the methods for testing
const createItem = (params: { name: string; description: string }): Item => {
    const id = String(testNextId++);
    const newItem: Item = { id, name: params.name, description: params.description };
    testDataStore[id] = newItem;
    return newItem;
};

const readItem = (params: { item_id: string }): Item | null => {
    return testDataStore[params.item_id] || null;
};

const listItems = (): Item[] => {
    return Object.values(testDataStore);
};

const updateItem = (params: { item_id: string; name?: string; description?: string }): Item | null => {
    const item = testDataStore[params.item_id];
    if (!item) return null;
    if (params.name !== undefined) item.name = params.name;
    if (params.description !== undefined) item.description = params.description;
    return item;
};

const deleteItem = (params: { item_id: string }): boolean => {
    if (testDataStore[params.item_id]) {
        delete testDataStore[params.item_id];
        return true;
    }
    return false;
};

const deleteAllItems = (): boolean => {
    const count = Object.keys(testDataStore).length;
    // Clear the test data store
    for (const key in testDataStore) {
        delete testDataStore[key];
    }
    // Reset the test ID counter
    testNextId = 1;
    return true;
};

// Create a server instance for testing
const testServer = new JSONRPCServer();
testServer.addMethod('create_item', createItem);
testServer.addMethod('read_item', readItem);
testServer.addMethod('list_items', listItems);
testServer.addMethod('update_item', updateItem);
testServer.addMethod('delete_item', deleteItem);
testServer.addMethod('delete_all_items', deleteAllItems);


describe('JSON-RPC Server Methods', () => {

    // Reset data before each test
    beforeEach(async () => {
        // Clear all data first
        await testServer.receive({ 
            jsonrpc: "2.0", 
            id: 0, 
            method: "delete_all_items", 
            params: {} 
        } as const);
        
        // Reset local test variables
        testDataStore = {};
        testNextId = 1;
    });

    it('should create an item', async () => {
        const request = {
            jsonrpc: "2.0",
            id: 1,
            method: "create_item",
            params: { name: "Test Item", description: "Test Description" }
        } as const;
        const response = await testServer.receive(request);
        expect(response?.result).toEqual({ id: "1", name: "Test Item", description: "Test Description" });
        expect(testDataStore["1"]).toBeDefined();
    });

    it('should list items', async () => {
        // Create some items first
        await testServer.receive({ jsonrpc: "2.0", id: 1, method: "create_item", params: { name: "Item 1", description: "Desc 1" } } as const);
        await testServer.receive({ jsonrpc: "2.0", id: 2, method: "create_item", params: { name: "Item 2", description: "Desc 2" } } as const);

        const listRequest = { jsonrpc: "2.0", id: 3, method: "list_items", params: {} } as const;
        const response = await testServer.receive(listRequest);
        expect(response?.result).toHaveLength(2);
        expect(response?.result).toEqual([
            { id: "1", name: "Item 1", description: "Desc 1" },
            { id: "2", name: "Item 2", description: "Desc 2" },
        ]);
    });

    it('should read an item', async () => {
        const createdResponse = await testServer.receive({ jsonrpc: "2.0", id: 1, method: "create_item", params: { name: "Read Me", description: "Details" } } as const);
        const created = createdResponse?.result as Item | undefined;
        const itemId = created?.id;
        if (!itemId) throw new Error("Item creation failed in test setup");

        const readRequest = { jsonrpc: "2.0", id: 2, method: "read_item", params: { item_id: itemId } } as const;
        const response = await testServer.receive(readRequest);
        expect(response?.result).toEqual({ id: itemId, name: "Read Me", description: "Details" });
    });

     it('should return null when reading a non-existent item', async () => {
        const readRequest = { jsonrpc: "2.0", id: 1, method: "read_item", params: { item_id: "999" } } as const;
        const response = await testServer.receive(readRequest);
        expect(response?.result).toBeNull();
    });

    it('should update an item', async () => {
        const createdResponse = await testServer.receive({ jsonrpc: "2.0", id: 1, method: "create_item", params: { name: "Update Me", description: "Initial" } } as const);
        const created = createdResponse?.result as Item | undefined;
        const itemId = created?.id;
        if (!itemId) throw new Error("Item creation failed in test setup");

        const updateRequest = {
            jsonrpc: "2.0",
            id: 2,
            method: "update_item",
            params: { item_id: itemId, name: "Updated Name", description: "Updated Description" }
        } as const;
        const updateResponse = await testServer.receive(updateRequest);
        expect(updateResponse?.result).toEqual({ id: itemId, name: "Updated Name", description: "Updated Description" });

        // Verify by reading again
        const readRequest = { jsonrpc: "2.0", id: 3, method: "read_item", params: { item_id: itemId } } as const;
        const readResponse = await testServer.receive(readRequest);
        expect(readResponse?.result).toEqual({ id: itemId, name: "Updated Name", description: "Updated Description" });
    });

     it('should return null when updating a non-existent item', async () => {
        const updateRequest = { jsonrpc: "2.0", id: 1, method: "update_item", params: { item_id: "999", name: "Wont Work" } } as const;
        const response = await testServer.receive(updateRequest);
        expect(response?.result).toBeNull();
    });

    it('should delete an item', async () => {
        const createdResponse = await testServer.receive({ jsonrpc: "2.0", id: 1, method: "create_item", params: { name: "Delete Me", description: "Gone" } } as const);
        const created = createdResponse?.result as Item | undefined;
        const itemId = created?.id;
        if (!itemId) throw new Error("Item creation failed in test setup");

        const deleteRequest = { jsonrpc: "2.0", id: 2, method: "delete_item", params: { item_id: itemId } } as const;
        const deleteResponse = await testServer.receive(deleteRequest);
        expect(deleteResponse?.result).toBe(true);

        // Verify by trying to read
        const readRequest = { jsonrpc: "2.0", id: 3, method: "read_item", params: { item_id: itemId } } as const;
        const readResponse = await testServer.receive(readRequest);
        expect(readResponse?.result).toBeNull();
    });

    it('should return false when deleting a non-existent item', async () => {
        const deleteRequest = { jsonrpc: "2.0", id: 1, method: "delete_item", params: { item_id: "999" } } as const;
        const response = await testServer.receive(deleteRequest);
        expect(response?.result).toBe(false);
    });

    // Add new test for delete all
    it('should delete all items', async () => {
        // Create a few items first
        await testServer.receive({ jsonrpc: "2.0", id: 1, method: "create_item", params: { name: "Item 1", description: "Desc 1" } } as const);
        await testServer.receive({ jsonrpc: "2.0", id: 2, method: "create_item", params: { name: "Item 2", description: "Desc 2" } } as const);
        
        // Verify items exist
        const beforeList = await testServer.receive({ jsonrpc: "2.0", id: 3, method: "list_items", params: {} } as const);
        expect(beforeList?.result).toHaveLength(2);

        // Delete all items
        const deleteAllResponse = await testServer.receive({ jsonrpc: "2.0", id: 4, method: "delete_all_items", params: {} } as const);
        expect(deleteAllResponse?.result).toBe(true);

        // Verify all items are gone
        const afterList = await testServer.receive({ jsonrpc: "2.0", id: 5, method: "list_items", params: {} } as const);
        expect(afterList?.result).toHaveLength(0);
    });
}); 