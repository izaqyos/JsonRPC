# JSON-RPC CRUD Example (TypeScript)

This project demonstrates a simple Create, Read, Update, Delete (CRUD) application using JSON-RPC 2.0 over HTTP.

- The server is built with Node.js, Express, and the `json-rpc-2.0` library.
- The client is built with Node.js, Axios, and the `json-rpc-2.0` library.

## Prerequisites

- Node.js (v16 or later recommended)
- npm (usually comes with Node.js)
- HTTPie (optional, for running HTTPie request examples)

## Setup

1. **Clone the repository (or ensure you have the generated files):**
   ```bash
   # If applicable
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Optional: Install HTTPie for alternative request method:**
   ```bash
   brew install httpie
   ```

## Running the Example

You'll need two terminal windows.

**Terminal 1: Start the Server**
```bash
npm run dev:server
```

The server will start and listen on `http://localhost:5001/jsonrpc`.

**Terminal 2: Run the Client**
```bash
npm run start:client
```

## Making Requests

You can use either curl or HTTPie to make requests:

**Using curl:**
```bash
./requests.sh
```

**Using HTTPie:**
```bash
./requests-httpie.sh
```

Both scripts demonstrate all CRUD operations including:
- Clearing all data
- Creating items
- Reading items
- Updating items
- Deleting items
- Listing all items

## Testing

Run the test suite:
```bash
npm test
```

This will run both server and client tests, which include:
- Server method tests
- Client request/response tests
- Error handling tests

## Project Structure

```
.
├── dist/              # Compiled JavaScript output (after running npm run build)
├── node_modules/      # Node.js dependencies (after running npm install)
├── src/
│   ├── client.ts      # Client implementation
│   └── server.ts      # Server implementation
├── package.json       # Project configuration and dependencies
├── package-lock.json  # Lockfile for dependency versions
├── README.md          # This file
└── tsconfig.json      # TypeScript compiler configuration
``` 