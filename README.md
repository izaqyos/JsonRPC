# JSON-RPC CRUD Example

This project provides a modern TypeScript implementation of a JSON-RPC 2.0 service demonstrating basic Create, Read, Update, and Delete (CRUD) operations. It features a Node.js/Express server, a simple client, unit tests using Jest, and interactive API documentation via Swagger UI.

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- Git (for cloning the repository)
- `curl` or HTTPie (for command-line requests)

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Running the Example

1.  **Build the project:**
    ```bash
    npm run build
    ```
2.  **Start the server:**
    ```bash
    npm start
    ```
    The server will start on `http://localhost:5001`.

3.  **Run the client (optional example):**
    In a separate terminal:
    ```bash
    npm run start:client
    ```

## API Documentation (Swagger UI)

This project uses Swagger UI to provide interactive API documentation.

### Accessing the Documentation

Once the server is running (`npm start`), you can access the Swagger UI in your browser at:

[http://localhost:5001/api-docs](http://localhost:5001/api-docs)

### Features

The Swagger UI allows you to:
*   **Explore Endpoints:** View the available JSON-RPC methods (`create_item`, `read_item`, etc.) exposed through the single `/jsonrpc` endpoint.
*   **View Schemas:** Inspect the structure of request parameters (`params`) and response objects (`result`, `error`) for each method. It uses schemas derived from the TypeScript classes and validation decorators.
*   **Try it Out:** Execute JSON-RPC requests directly from the browser interface to test the API functionality.
*   **View Specification:** Access the raw OpenAPI 3.1 specification in JSON format at [http://localhost:5001/api-docs.json](http://localhost:5001/api-docs.json).

### Implementation Details

*   **Swagger UI Express:** The `swagger-ui-express` library is used to serve the Swagger UI interface.
*   **Dynamic Specification:** The OpenAPI specification is generated dynamically at runtime using `routing-controllers-openapi` and `class-validator-jsonschema`. It inspects the `routing-controllers` decorators (`@JsonController`, `@Post`, `@Body`, etc.) and `class-validator` decorators (`@IsString`, `@IsOptional`, etc.) in the `src/server.ts` file to build the API documentation.
*   **Configuration:** The Swagger setup is configured in `src/swagger.ts`.

## Making Requests

You can interact with the JSON-RPC server using tools like `curl` or HTTPie. Examples are provided in `requests.sh` (curl) and `requests-httpie.sh` (HTTPie).

**Using curl:**
```bash
./requests.sh create name="My First Item" description="Details about the item"
./requests.sh list
# ... and other commands
```

**Using HTTPie:**
Ensure HTTPie is installed (`brew install httpie` or `pip install httpie`).
```bash
./requests-httpie.sh create name="My First Item" description="Details about the item"
./requests-httpie.sh list
# ... and other commands
```

## Testing

The project uses Jest for unit and integration testing.

*   **Run all tests:**
    ```bash
    npm test
    ```
*   **Run Swagger-specific tests:**
    ```bash
    npm run test:swagger
    ```
    These tests verify the OpenAPI specification generation (`tests/swagger/openapi.test.ts`) and the Swagger UI setup (`tests/swagger/swagger-ui.test.ts`).

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