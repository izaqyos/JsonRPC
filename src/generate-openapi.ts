import { dump } from 'js-yaml';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { spec } from './openapi';

// Ensure the openapi directory exists
const openapiDir = join(__dirname, '../openapi');
if (!existsSync(openapiDir)) {
    mkdirSync(openapiDir);
}

// Convert the OpenAPI spec to YAML and save it
const yamlContent = dump(spec, {
    indent: 2,
    lineWidth: -1, // Don't wrap lines
    noRefs: true   // Inline all references
});

const yamlPath = join(openapiDir, 'openapi.yaml');
writeFileSync(yamlPath, yamlContent, 'utf8');
console.log(`OpenAPI specification generated at: ${yamlPath}`); 