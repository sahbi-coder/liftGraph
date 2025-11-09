/* eslint-env node */
const esbuild = require('esbuild');
const path = require('path');

const watch = process.argv.includes('--watch');

const buildOptions = {
  entryPoints: [path.join(__dirname, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node22',
  outfile: path.join(__dirname, 'build/index.js'),
  external: ['firebase-admin', 'firebase-functions'],
  format: 'cjs',
  sourcemap: true,
  minify: false,
};

if (watch) {
  esbuild
    .context(buildOptions)
    .then((ctx) => {
      ctx.watch();
      console.log('Watching for changes...');
    })
    .catch(() => process.exit(1));
} else {
  esbuild.build(buildOptions).catch(() => process.exit(1));
}
