import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { spec } from './openapi';

export function setupSwagger(app: Express): void {
    try {
        // Generate JSON Schema from validation metadata
        const schemas = validationMetadatasToSchemas();

        // Merge with our existing OpenAPI spec
        const mergedSpec = {
            ...spec,
            components: {
                ...spec.components,
                schemas: {
                    ...spec.components?.schemas,
                    ...schemas
                }
            }
        };

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
            res.json(mergedSpec);
        });

        // Serve Swagger UI
        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(mergedSpec, options));

        console.log('Swagger UI initialized successfully at /api-docs');
    } catch (error) {
        console.warn('Failed to initialize Swagger UI with validation schemas, falling back to basic spec');
        
        // Fallback to basic spec without validation schemas
        app.get('/api-docs.json', (req, res) => {
            res.json(spec);
        });

        app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(spec, {
            swaggerOptions: {
                url: '/api-docs.json'
            }
        }));
    }
} 