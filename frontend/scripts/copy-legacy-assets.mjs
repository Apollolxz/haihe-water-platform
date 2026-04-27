import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(rootDir, 'dist');
const pagesDir = resolve(rootDir, 'pages');

const legacyPaths = [
  'assets',
  'components',
  'config',
  'layouts',
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

const appShell = await readFile(resolve(distDir, 'index.html'), 'utf8');
const pageFiles = (await readdir(pagesDir)).filter((file) => file.endsWith('.html'));
const distPagesDir = resolve(distDir, 'pages');

await mkdir(distPagesDir, { recursive: true });
await Promise.all(
  pageFiles.map((file) => writeFile(resolve(distPagesDir, file), appShell, 'utf8')),
);
