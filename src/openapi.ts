export const spec = {
    openapi: '3.1.0',
    info: {
        title: 'JSON-RPC CRUD API',
        version: '1.0.0',
        description: 'A JSON-RPC 2.0 API for CRUD operations on items'
    },
    servers: [
        {
            url: 'http://localhost:5001',
            description: 'Development server'
        }
    ],
    paths: {
        '/jsonrpc': {
            post: {
                summary: 'JSON-RPC endpoint',
                description: 'Handles all JSON-RPC method calls',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/JSONRPCRequest'
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/JSONRPCResponse'
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Invalid request',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/JSONRPCError'
                                }
                            }
                        }
                    },
                    '500': {
                        description: 'Server error',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/JSONRPCError'
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    components: {
        schemas: {
            JSONRPCRequest: {
                type: 'object',
                required: ['jsonrpc', 'method', 'id'],
                properties: {
                    jsonrpc: {
                        type: 'string',
                        enum: ['2.0']
                    },
                    method: {
                        type: 'string',
                        enum: [
                            'create_item',
                            'read_item',
                            'update_item',
                            'delete_item',
                            'list_items',
                            'delete_all_items'
                        ]
                    },
                    params: {
                        oneOf: [
                            { $ref: '#/components/schemas/CreateItemParams' },
                            { $ref: '#/components/schemas/ReadItemParams' },
                            { $ref: '#/components/schemas/UpdateItemParams' },
                            { $ref: '#/components/schemas/DeleteItemParams' },
                            { $ref: '#/components/schemas/ListItemsParams' },
                            { $ref: '#/components/schemas/DeleteAllItemsParams' }
                        ]
                    },
                    id: {
                        type: 'string'
                    }
                }
            },
            JSONRPCResponse: {
                type: 'object',
                required: ['jsonrpc', 'id'],
                properties: {
                    jsonrpc: {
                        type: 'string',
                        enum: ['2.0']
                    },
                    result: {
                        oneOf: [
                            { $ref: '#/components/schemas/Item' },
                            {
                                type: 'array',
                                items: { $ref: '#/components/schemas/Item' }
                            },
                            {
                                type: 'boolean'
                            }
                        ]
                    },
                    error: {
                        $ref: '#/components/schemas/JSONRPCError'
                    },
                    id: {
                        type: 'string'
                    }
                }
            },
            JSONRPCError: {
                type: 'object',
                required: ['error'],
                properties: {
                    error: {
                        type: 'object',
                        required: ['code', 'message'],
                        properties: {
                            code: {
                                type: 'integer'
                            },
                            message: {
                                type: 'string'
                            }
                        }
                    }
                }
            },
            Item: {
                type: 'object',
                required: ['id', 'name'],
                properties: {
                    id: {
                        type: 'string'
                    },
                    name: {
                        type: 'string'
                    },
                    description: {
                        type: 'string'
                    }
                }
            },
            CreateItemParams: {
                type: 'object',
                required: ['name'],
                properties: {
                    name: {
                        type: 'string'
                    },
                    description: {
                        type: 'string'
                    }
                }
            },
            ReadItemParams: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {
                        type: 'string'
                    }
                }
            },
            UpdateItemParams: {
                type: 'object',
                required: ['id', 'name'],
                properties: {
                    id: {
                        type: 'string'
                    },
                    name: {
                        type: 'string'
                    },
                    description: {
                        type: 'string'
                    }
                }
            },
            DeleteItemParams: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: {
                        type: 'string'
                    }
                }
            },
            ListItemsParams: {
                type: 'object',
                properties: {}
            },
            DeleteAllItemsParams: {
                type: 'object',
                properties: {}
            }
        },
        examples: {
            CreateItemRequest: {
                value: {
                    jsonrpc: '2.0',
                    method: 'create_item',
                    params: {
                        name: 'New Item',
                        description: 'Description of new item'
                    },
                    id: '1'
                }
            },
            CreateItemResponse: {
                value: {
                    jsonrpc: '2.0',
                    result: {
                        id: '123',
                        name: 'New Item',
                        description: 'Description of new item'
                    },
                    id: '1'
                }
            },
            ReadItemRequest: {
                value: {
                    jsonrpc: '2.0',
                    method: 'read_item',
                    params: {
                        id: '123'
                    },
                    id: '2'
                }
            },
            UpdateItemRequest: {
                value: {
                    jsonrpc: '2.0',
                    method: 'update_item',
                    params: {
                        id: '123',
                        name: 'Updated Item',
                        description: 'Updated description'
                    },
                    id: '3'
                }
            },
            DeleteItemRequest: {
                value: {
                    jsonrpc: '2.0',
                    method: 'delete_item',
                    params: {
                        id: '123'
                    },
                    id: '4'
                }
            },
            ListItemsRequest: {
                value: {
                    jsonrpc: '2.0',
                    method: 'list_items',
                    params: {},
                    id: '5'
                }
            },
            DeleteAllItemsRequest: {
                value: {
                    jsonrpc: '2.0',
                    method: 'delete_all_items',
                    params: {},
                    id: '6'
                }
            },
            ErrorResponse: {
                value: {
                    jsonrpc: '2.0',
                    error: {
                        code: -32600,
                        message: 'Invalid Request'
                    },
                    id: null
                }
            }
        }
    }
}; 