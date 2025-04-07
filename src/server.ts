import 'reflect-metadata';
import express from 'express';
import { createExpressServer, JsonController, Post, Body } from 'routing-controllers';
import { OpenAPI } from 'routing-controllers-openapi';
import { IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { setupSwagger } from './swagger';

// Base class for JSON-RPC requests
class JsonRpcRequest {
    @IsString()
    jsonrpc: string = '2.0';

    @IsString()
    method!: string;

    @IsString()
    id!: string;

    constructor(method: string, id: string) {
        this.method = method;
        this.id = id;
    }
}

// Item class
class Item {
    @IsString()
    id!: string;

    @IsString()
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;

    constructor(id: string, name: string, description?: string) {
        this.id = id;
        this.name = name;
        this.description = description;
    }
}

// --- Define Parameter Classes ---

class CreateItemParamsDto {
    @IsString()
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;
}

class ReadItemParamsDto {
    @IsString()
    id!: string;
}

class UpdateItemParamsDto {
    @IsString()
    id!: string;

    @IsString()
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;
}

class DeleteItemParamsDto {
    @IsString()
    id!: string;
}

// Empty class for methods with no specific params (still needed for typing)
class NoParamsDto {}

// Request DTOs
class CreateItemRequest extends JsonRpcRequest {
    @ValidateNested()
    @Type(() => CreateItemParamsDto)
    params: CreateItemParamsDto;

    constructor(id: string, params: CreateItemParamsDto) {
        super('create_item', id);
        this.params = params;
    }
}

class ReadItemRequest extends JsonRpcRequest {
    @ValidateNested()
    @Type(() => ReadItemParamsDto)
    params: ReadItemParamsDto;

    constructor(id: string, params: ReadItemParamsDto) {
        super('read_item', id);
        this.params = params;
    }
}

class UpdateItemRequest extends JsonRpcRequest {
    @ValidateNested()
    @Type(() => UpdateItemParamsDto)
    params: UpdateItemParamsDto;

    constructor(id: string, params: UpdateItemParamsDto) {
        super('update_item', id);
        this.params = params;
    }
}

class DeleteItemRequest extends JsonRpcRequest {
    @ValidateNested()
    @Type(() => DeleteItemParamsDto)
    params: DeleteItemParamsDto;

    constructor(id: string, params: DeleteItemParamsDto) {
        super('delete_item', id);
        this.params = params;
    }
}

class ListItemsRequest extends JsonRpcRequest {
    @ValidateNested()
    @Type(() => NoParamsDto)
    params: NoParamsDto = new NoParamsDto();

    constructor(id: string) {
        super('list_items', id);
    }
}

class DeleteAllItemsRequest extends JsonRpcRequest {
    @ValidateNested()
    @Type(() => NoParamsDto)
    params: NoParamsDto = new NoParamsDto();

    constructor(id: string) {
        super('delete_all_items', id);
    }
}

@JsonController()
export class JsonRpcController {
    private items: Map<string, Item> = new Map();

    @Post('/jsonrpc')
    @OpenAPI({
        summary: 'JSON-RPC endpoint',
        description: 'Handles all JSON-RPC method calls'
    })
    async handleRequest(@Body() body: any): Promise<any> {
        if (body.jsonrpc !== '2.0') {
            return {
                jsonrpc: '2.0',
                error: {
                    code: -32600,
                    message: 'Invalid Request: Not JSON-RPC 2.0'
                },
                id: body.id || null
            };
        }

        try {
            switch (body.method) {
                case 'create_item':
                    return await this.createItem(body as CreateItemRequest);
                case 'read_item':
                    return await this.readItem(body as ReadItemRequest);
                case 'update_item':
                    return await this.updateItem(body as UpdateItemRequest);
                case 'delete_item':
                    return await this.deleteItem(body as DeleteItemRequest);
                case 'list_items':
                    return await this.listItems(body as ListItemsRequest);
                case 'delete_all_items':
                    return await this.deleteAllItems(body as DeleteAllItemsRequest);
                default:
                    return {
                        jsonrpc: '2.0',
                        error: {
                            code: -32601,
                            message: 'Method not found'
                        },
                        id: body.id
                    };
            }
        } catch (error) {
            return {
                jsonrpc: '2.0',
                error: {
                    code: -32000,
                    message: error instanceof Error ? error.message : 'Internal error'
                },
                id: body.id
            };
        }
    }

    private async createItem(request: CreateItemRequest): Promise<any> {
        const { name, description } = request.params;
        const id = Math.random().toString(36).substr(2, 9);
        const item = new Item(id, name, description);
        this.items.set(id, item);
        return {
            jsonrpc: '2.0',
            result: item,
            id: request.id
        };
    }

    private async readItem(request: ReadItemRequest): Promise<any> {
        const { id } = request.params;
        const item = this.items.get(id);
        if (!item) {
            throw new Error('Item not found');
        }
        return {
            jsonrpc: '2.0',
            result: item,
            id: request.id
        };
    }

    private async updateItem(request: UpdateItemRequest): Promise<any> {
        const { id, name, description } = request.params;
        if (!this.items.has(id)) {
            throw new Error('Item not found');
        }
        const item = new Item(id, name, description);
        this.items.set(id, item);
        return {
            jsonrpc: '2.0',
            result: item,
            id: request.id
        };
    }

    private async deleteItem(request: DeleteItemRequest): Promise<any> {
        const { id } = request.params;
        if (!this.items.has(id)) {
            throw new Error('Item not found');
        }
        this.items.delete(id);
        return {
            jsonrpc: '2.0',
            result: true,
            id: request.id
        };
    }

    private async listItems(request: ListItemsRequest): Promise<any> {
        return {
            jsonrpc: '2.0',
            result: Array.from(this.items.values()),
            id: request.id
        };
    }

    private async deleteAllItems(request: DeleteAllItemsRequest): Promise<any> {
        this.items.clear();
        return {
            jsonrpc: '2.0',
            result: true,
            id: request.id
        };
    }
}

// Create Express app with routing-controllers
const app = createExpressServer({
    controllers: [JsonRpcController],
    defaultErrorHandler: false
});

// Apply middleware directly to the app instance if needed
app.use(express.json());

// Set up Swagger UI on the app instance
setupSwagger(app);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Unhandled Error:", err);
    const requestId = (req.body && req.body.id) ? req.body.id : null;
    res.status(500).json({
        jsonrpc: '2.0',
        error: {
            code: -32000,
            message: err.message || 'Internal server error'
        },
        id: requestId
    });
});

const PORT = process.env.PORT || 5001;

// Start listening only if the script is executed directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
    });
}

// Export the configured app instance for testing or programmatic use
export { app }; 