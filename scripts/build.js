import esbuild from 'esbuild';
import fs from 'fs/promises';

const TARGET = 'es2020';

// Define the build configurations
const buildConfigs = [
  {
    format: 'esm',
    outfile: './dist/index.js',
    target: TARGET,
  },
  {
    format: 'cjs',
    outfile: './dist/index.cjs',
    target: TARGET,
  },
];

// Run all the builds
async function runBuilds() {
  try {
    const buildPromises = buildConfigs.map(config => {
      return esbuild.build({
        entryPoints: ['./src/index.ts'],
        bundle: true,
        outfile: config.outfile,
        format: config.format,
        target: config.target,
        platform: 'neutral',
        sourcemap: true,
        external: [],
        banner: {
          js: config.format === 'cjs' ? '' : '',
        },
      });
    });

    await Promise.all(buildPromises);

    // Add special handling for CJS exports
    await fixCjsFile();

    console.log('🎉 Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Special handling for CJS file to ensure exports work correctly
async function fixCjsFile() {
  const cjsPath = './dist/index.cjs';
  const cjsContent = await fs.readFile(cjsPath, 'utf8');

  // To ensure named exports are properly exposed
  const updatedContent = `${cjsContent}
// Make all exports available directly from require()
if (module.exports.default) {
  Object.assign(module.exports.default, module.exports);
  module.exports = module.exports.default;
}
`;

  await fs.writeFile(cjsPath, updatedContent, 'utf8');
}

// Run the builds
runBuilds();
