import axios from 'axios';
import { JSONRPCClient, JSONRPCRequest, JSONRPCResponse } from 'json-rpc-2.0';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Define the type for our item (matching the client/server)
interface Item {
    id: string;
    name: string;
    description: string;
}

const SERVER_URL = "http://localhost:5001/jsonrpc"; // Use the same URL as the client

// Variable to store the last request sent by the client for inspection
let lastSentRequest: JSONRPCRequest | null = null;

// Set up the client instance, similar to client.ts
const client = new JSONRPCClient(async (jsonRPCRequest: JSONRPCRequest) => {
    lastSentRequest = jsonRPCRequest; // Store the request for assertion
    try {
        // Instead of actually calling axios, we resolve/reject the promise
        // based on how we configure the mock for each test case.
        // The actual mock implementation is done within each test.
        const response = await mockedAxios.post(SERVER_URL, jsonRPCRequest);

        if (response.status === 200 && response.data) {
            client.receive(response.data);
        } else if (response.status === 204) {
            // Handle notification confirmation (no body expected)
            return; 
        } else {
             return Promise.reject(new Error(`HTTP error! status: ${response.status}`));
        }

    } catch (error: any) {
         // Simulate receiving an error response if the mock axios throws
         if (jsonRPCRequest.id) {
             client.receive({
                jsonrpc: "2.0",
                error: { code: -32000, message: error?.message || 'Simulated request failure' },
                id: jsonRPCRequest.id,
            });
         }
        // Rethrow or handle as needed for the test case, but the receive above allows request() to reject
        // throw error;
    }
});


describe('JSON-RPC Client', () => {

    // Reset mocks before each test
    beforeEach(() => {
        mockedAxios.post.mockReset();
        lastSentRequest = null;
    });

    it('should send a create_item request and process the response', async () => {
        const mockItemId = "item-123";
        const mockItemName = "Test Item";
        const mockItemDesc = "Created via test";

        // Configure the mock axios response for this test
        const mockRpcResponse: JSONRPCResponse = {
            jsonrpc: "2.0",
            id: 1, // Client generates IDs, server reflects them
            result: { id: mockItemId, name: mockItemName, description: mockItemDesc },
        };
        mockedAxios.post.mockResolvedValue({ status: 200, data: mockRpcResponse });

        // Call the client method
        const result = await client.request('create_item', { name: mockItemName, description: mockItemDesc });

        // Assertions
        expect(result).toEqual({ id: mockItemId, name: mockItemName, description: mockItemDesc });
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith(SERVER_URL, expect.objectContaining({
            method: 'create_item',
            params: { name: mockItemName, description: mockItemDesc },
            jsonrpc: '2.0'
            // We don't usually assert the ID as it's internal to the client
        }));
        // Check the actual request object captured by the client sender function
        expect(lastSentRequest).toEqual(expect.objectContaining({
             method: 'create_item',
             params: { name: mockItemName, description: mockItemDesc },
             jsonrpc: '2.0',
             id: expect.any(Number) // or String, depending on client implementation
        }));
    });

    it('should send a read_item request and process the response', async () => {
        const itemIdToRead = "item-456";
        const mockItem: Item = { id: itemIdToRead, name: "Read Item", description: "Details here" };
        
        const mockRpcResponse: JSONRPCResponse = {
            jsonrpc: "2.0",
            id: 2,
            result: mockItem,
        };
        mockedAxios.post.mockResolvedValue({ status: 200, data: mockRpcResponse });

        const result = await client.request('read_item', { item_id: itemIdToRead });

        expect(result).toEqual(mockItem);
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith(SERVER_URL, expect.objectContaining({
            method: 'read_item',
            params: { item_id: itemIdToRead },
        }));
        expect(lastSentRequest?.method).toBe('read_item');
        expect((lastSentRequest?.params as any)?.item_id).toBe(itemIdToRead);
    });

    it('should handle a null result from the server (e.g., item not found)', async () => {
         const itemIdToRead = "non-existent-item";
         const mockRpcResponse: JSONRPCResponse = {
            jsonrpc: "2.0",
            id: 3,
            result: null,
        };
        mockedAxios.post.mockResolvedValue({ status: 200, data: mockRpcResponse });

        const result = await client.request('read_item', { item_id: itemIdToRead });

        expect(result).toBeNull();
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith(SERVER_URL, expect.objectContaining({
            method: 'read_item',
            params: { item_id: itemIdToRead },
        }));
    });

    it('should handle JSON-RPC error response from the server', async () => {
        const mockRpcErrorResponse: JSONRPCResponse = {
            jsonrpc: "2.0",
            id: 4,
            error: { code: -32601, message: "Method not found" },
        };
        mockedAxios.post.mockResolvedValue({ status: 200, data: mockRpcErrorResponse });

        await expect(client.request('non_existent_method', {}))
            .rejects
            .toMatchObject({ // Check specifics of the error object JSONRPCClient throws
                code: -32601,
                message: "Method not found",
            });

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith(SERVER_URL, expect.objectContaining({
            method: 'non_existent_method',
        }));
    });

    it('should handle network/axios error during request', async () => {
        const errorMessage = "Network Error";
        mockedAxios.post.mockRejectedValue(new Error(errorMessage));

        await expect(client.request('any_method', {}))
            .rejects
            .toMatchObject({ // Check the error object passed to client.receive in the catch block
                 code: -32000,
                 message: errorMessage,
            });

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

     it('should handle non-200 HTTP status code', async () => {
        const status = 500;
        mockedAxios.post.mockResolvedValue({ status: status, data: 'Internal Server Error' });

        await expect(client.request('any_method', {}))
            .rejects
            .toMatchObject({ // Adjust assertion: Check only message for standard Error
                 // code: -32000, // Standard Error doesn't have a code
                 message: `HTTP error! status: ${status}`, 
            });
            
        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });

}); 