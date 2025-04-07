import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
// We might need to explicitly import controllers if they aren't automatically found
// depending on how routing-controllers loads things in different contexts.
// Let's assume for now getMetadataArgsStorage finds them.
// If not, we might need: import './server';

// Function to generate the OpenAPI specification object
export function getOpenApiSpec() {
    try {
        // Remove the explicit controller reference
        // const controller = JsonRpcController;

        // Assume metadata is registered because the calling context
        // (generate-openapi.ts or openapi.test.ts) imports 'server.ts' first.
        const schemas = validationMetadatasToSchemas({
            // refPointerPrefix: '#/components/schemas/', // Usually default works
        });
        const storage = getMetadataArgsStorage(); // Get storage

        const spec = routingControllersToSpec(storage, {}, { // Pass storage explicitly
            components: {
                schemas,
            },
            info: {
                title: 'JSON-RPC CRUD API',
                version: '1.0.0',
                description: 'A JSON-RPC 2.0 API for CRUD operations on items based on routing-controllers decorators.'
            }
        });
        return spec;
    } catch (error) {
        console.error("Error generating OpenAPI spec:", error);
        return {
            openapi: '3.1.0',
            info: { title: 'API Spec Generation Failed', version: '0.0.0' },
            paths: {}
        };
    }
}

export function setupSwagger(app: Express): void {
    const spec = getOpenApiSpec(); // Use the generator function

    // Swagger UI options
    const options = {
        swaggerOptions: {
            url: '/api-docs.json',
            displayRequestDuration: true,
            docExpansion: 'list',
            filter: true
        }
    };

    // Serve OpenAPI spec
    app.get('/api-docs.json', (req, res) => {
        res.json(spec);
    });

    // Serve Swagger UI
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, options));

    if (spec.info.title !== 'API Spec Generation Failed') {
        console.log('Swagger UI initialized successfully at /api-docs');
    } else {
        console.warn('Swagger UI initialized with fallback spec due to generation errors.');
    }
} 