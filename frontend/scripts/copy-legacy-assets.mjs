import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(rootDir, 'dist');
const pagesDir = resolve(rootDir, 'pages');

const staticPaths = ['assets/data'];

await mkdir(distDir, { recursive: true });

await Promise.all(
  staticPaths.map(async (path) => {
    const target = resolve(distDir, path);
    await mkdir(dirname(target), { recursive: true });
    await cp(resolve(rootDir, path), target, {
      recursive: true,
      force: true,
    });
  }),
);

const appShell = await readFile(resolve(distDir, 'index.html'), 'utf8');
const pageFiles = (await readdir(pagesDir)).filter((file) => file.endsWith('.html'));
const distPagesDir = resolve(distDir, 'pages');

await mkdir(distPagesDir, { recursive: true });
await Promise.all(
  pageFiles.map((file) => writeFile(resolve(distPagesDir, file), appShell, 'utf8')),
);
