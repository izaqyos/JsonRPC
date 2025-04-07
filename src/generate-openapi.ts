import 'reflect-metadata'; // Still needed for decorators metadata
import { dump } from 'js-yaml';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
// Import the spec generation function from the compiled swagger module
// Adjust path based on your 'outDir' in tsconfig.json
import { getOpenApiSpec } from './swagger';

// Import the controller file BEFORE importing the spec generator
// This registers the metadata needed by routing-controllers
import './server';

// Generate the spec object
const spec = getOpenApiSpec();

// Ensure the openapi directory exists (relative to project root)
const openapiDir = join(__dirname, '..', 'openapi'); // Go up one level from dist/src
if (!existsSync(openapiDir)) {
    mkdirSync(openapiDir, { recursive: true });
}

// Convert the spec object to YAML
const yamlContent = dump(spec, {
    indent: 2,
    lineWidth: -1, // Don't wrap lines
});

// Define the path for the output YAML file
const yamlPath = join(openapiDir, 'openapi.yaml');

// Write the YAML content to the file
try {
    writeFileSync(yamlPath, yamlContent, 'utf8');
    console.log(`✅ OpenAPI specification generated successfully at: ${yamlPath}`);
} catch (error) {
    console.error(`❌ Failed to write OpenAPI specification to ${yamlPath}:`, error);
    process.exit(1); // Exit with error code if writing fails
} 