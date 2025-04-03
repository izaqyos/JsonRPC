import { load } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { spec } from '../../src/openapi';

describe('OpenAPI Specification', () => {
    let yamlSpec: any;

    beforeAll(() => {
        // Load the generated YAML file
        const yamlPath = join(__dirname, '../../openapi/openapi.yaml');
        const yamlContent = readFileSync(yamlPath, 'utf8');
        yamlSpec = load(yamlContent);
    });

    it('should have basic OpenAPI structure', () => {
        expect(yamlSpec).toHaveProperty('openapi');
        expect(yamlSpec).toHaveProperty('info');
        expect(yamlSpec).toHaveProperty('paths');
        expect(yamlSpec).toHaveProperty('components');
    });

    it('should have correct API information', () => {
        expect(yamlSpec.info).toMatchObject({
            title: 'JSON-RPC CRUD API',
            version: '1.0.0'
        });
    });

    it('should have JSON-RPC endpoint defined', () => {
        expect(yamlSpec.paths).toHaveProperty('/jsonrpc');
        expect(yamlSpec.paths['/jsonrpc']).toHaveProperty('post');
    });

    it('should have all CRUD methods documented', () => {
        const methods = [
            'create_item',
            'read_item',
            'update_item',
            'delete_item',
            'list_items',
            'delete_all_items'
        ];

        // Check if all methods are in the schema
        const requestSchema = yamlSpec.components.schemas.JSONRPCRequest;
        expect(requestSchema.properties.method.enum).toEqual(expect.arrayContaining(methods));
    });

    it('should have Item schema defined', () => {
        expect(yamlSpec.components.schemas).toHaveProperty('Item');
        expect(yamlSpec.components.schemas.Item.properties).toMatchObject({
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' }
        });
    });

    it('should have parameter schemas for all methods', () => {
        const paramSchemas = [
            'CreateItemParams',
            'ReadItemParams',
            'UpdateItemParams',
            'DeleteItemParams',
            'ListItemsParams',
            'DeleteAllItemsParams'
        ];

        paramSchemas.forEach(schema => {
            expect(yamlSpec.components.schemas).toHaveProperty(schema);
        });
    });

    it('should have proper error responses defined', () => {
        const postEndpoint = yamlSpec.paths['/jsonrpc'].post;
        
        // Check for error response definitions
        expect(postEndpoint.responses).toHaveProperty('400');
        expect(postEndpoint.responses).toHaveProperty('500');
        
        // Verify error schema
        const errorSchema = yamlSpec.components.schemas.JSONRPCError;
        expect(errorSchema.properties.error.properties).toMatchObject({
            code: { type: 'integer' },
            message: { type: 'string' }
        });
    });

    it('should have examples for all methods', () => {
        const requiredExamples = [
            'CreateItemRequest',
            'CreateItemResponse',
            'ReadItemRequest',
            'UpdateItemRequest',
            'DeleteItemRequest',
            'ListItemsRequest',
            'DeleteAllItemsRequest',
            'ErrorResponse'
        ];

        requiredExamples.forEach(example => {
            expect(yamlSpec.components.examples).toHaveProperty(example);
        });
    });

    it('should have valid JSON-RPC request/response structures', () => {
        const schemas = yamlSpec.components.schemas;
        
        // Check request structure
        expect(schemas.JSONRPCRequest.required).toEqual(
            expect.arrayContaining(['jsonrpc', 'method', 'id'])
        );

        // Check response structure
        expect(schemas.JSONRPCResponse.required).toEqual(
            expect.arrayContaining(['jsonrpc', 'id'])
        );
    });

    it('should match the programmatically generated spec', () => {
        // Compare the loaded YAML with the programmatically generated spec
        expect(yamlSpec).toEqual(spec);
    });

    it('should have proper content types defined', () => {
        const postEndpoint = yamlSpec.paths['/jsonrpc'].post;
        
        expect(postEndpoint.requestBody.content)
            .toHaveProperty('application/json');
        
        expect(postEndpoint.responses['200'].content)
            .toHaveProperty('application/json');
    });
}); 