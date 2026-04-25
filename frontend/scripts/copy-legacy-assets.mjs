import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(rootDir, 'dist');

const legacyPaths = [
  'assets',
  'components',
  'config',
  'layouts',
  'pages',
  'services',
  'state',
  'utils',
];

await mkdir(distDir, { recursive: true });

await Promise.all(
  legacyPaths.map((path) =>
    cp(resolve(rootDir, path), resolve(distDir, path), {
      recursive: true,
      force: true,
    }),
  ),
);
