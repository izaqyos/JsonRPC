import request from 'supertest';
// Import the configured app instance from server.ts
import { app } from '../../src/server'; // Adjust path if needed

describe('Swagger UI Setup', () => {
    it('should serve OpenAPI specification at /api-docs.json', async () => {
        // Pass the imported app directly to supertest
        const response = await request(app)
            .get('/api-docs.json')
            .expect('Content-Type', /json/)
            .expect(200);

        expect(response.body).toHaveProperty('openapi');
        expect(response.body).toHaveProperty('info');
        expect(response.body).toHaveProperty('paths');
    });

    it('should serve Swagger UI HTML at /api-docs/', async () => {
        // Pass the imported app directly to supertest
        const response = await request(app)
            .get('/api-docs/')
            .expect('Content-Type', /html/)
            .expect(200);

        // Verify it's actually Swagger UI
        expect(response.text).toContain('<title>Swagger UI</title>');
        expect(response.text).toContain('swagger-ui-standalone-preset');
    });

    // Add more tests if needed, e.g., check specific spec content
}); 