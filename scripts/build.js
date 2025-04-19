import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

/**
 * Build configuration for the matchstick-solver package
 * Handles both ESM and CommonJS outputs and copies WASM files
 */

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Ensure web directory exists in dist
if (!fs.existsSync('dist/web')) {
  fs.mkdirSync('dist/web');
}

// Copy WASM files to dist
console.log('Copying WASM files...');
const wasmFiles = ['matchstick_wasm.js', 'matchstick_wasm.wasm'];
const sourcePath = path.join('src', 'web');
const destPath = path.join('dist', 'web');

// Check if source directory exists
if (fs.existsSync(sourcePath)) {
  wasmFiles.forEach(file => {
    const sourceFile = path.join(sourcePath, file);
    if (fs.existsSync(sourceFile)) {
      try {
        fs.copyFileSync(sourceFile, path.join(destPath, file));
        console.log(`Copied ${file} to dist/web`);
      } catch (error) {
        console.warn(`Warning: Failed to copy ${file}: ${error.message}`);
      }
    } else {
      console.warn(`Warning: Source file ${sourceFile} does not exist - skipping`);
    }
  });
} else {
  console.warn(`Warning: Source directory ${sourcePath} does not exist - skipping WASM file copy`);
}

// Also copy precomputed_equations.json to dist
if (fs.existsSync('precomputed_equations.json')) {
  try {
    fs.copyFileSync('precomputed_equations.json', path.join('dist', 'precomputed_equations.json'));
    console.log('Copied precomputed_equations.json to dist');
  } catch (error) {
    console.warn(`Warning: Failed to copy precomputed_equations.json: ${error.message}`);
  }
} else {
  console.warn('Warning: precomputed_equations.json not found - skipping copy');
}

// Build ESM version
console.log('Building ESM version...');
await esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node16',
    external: ['fs', 'path'],
    sourcemap: true,
  })
  .catch(error => {
    console.error('Error building ESM version:', error);
    process.exit(1);
  });

// Build CommonJS version
console.log('Building CommonJS version...');
await esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.cjs',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node16',
    external: ['fs', 'path', 'url'],
    sourcemap: true,
    banner: {
      js: `
      // Handle import.meta.url for CommonJS
      const importMetaUrl = require('url').pathToFileURL(__filename).toString();
      globalThis.importMetaUrl = importMetaUrl;
    `,
    },
    define: {
      'import.meta.url': 'globalThis.importMetaUrl',
    },
  })
  .catch(error => {
    console.error('Error building CommonJS version:', error);
    process.exit(1);
  });

// Add special handling for CJS file to ensure exports work correctly
try {
  const cjsPath = './dist/index.cjs';
  if (fs.existsSync(cjsPath)) {
    const cjsContent = fs.readFileSync(cjsPath, 'utf8');

    // To ensure named exports are properly exposed
    const updatedContent = `${cjsContent}
// Make all exports available directly from require()
if (module.exports.default) {
  Object.assign(module.exports.default, module.exports);
  module.exports = module.exports.default;
}
`;

    fs.writeFileSync(cjsPath, updatedContent, 'utf8');
  } else {
    console.warn(`Warning: CJS output file ${cjsPath} not found, skipping export fix`);
  }
} catch (error) {
  console.warn(`Warning: Failed to update CJS exports: ${error.message}`);
}

console.log('Build completed successfully');
