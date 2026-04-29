import { copyFile, cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(rootDir, 'dist');

const staticPaths = ['assets'];
const pageFiles = [
  'boxplot-analysis.html',
  'chat.html',
  'correlation-analysis.html',
  'dashboard.html',
  'forgot-password.html',
  'index.html',
  'knowledge-graph.html',
  'login.html',
  'profile.html',
  'province-comparison.html',
  'register.html',
  'sandbox.html',
  'trend-analysis.html',
];

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
const distPagesDir = resolve(distDir, 'pages');

await mkdir(distPagesDir, { recursive: true });
await Promise.all(
  pageFiles.map((file) => writeFile(resolve(distPagesDir, file), appShell, 'utf8')),
);

const assetCompatCopies = [
  ['assets/index.js', 'assets/index-BBlpru4q.js'],
  ['assets/index.js', 'assets/index-Bz8TrIkx.js'],
  ['assets/index.js', 'assets/index-CCDCRtyq.js'],
  ['assets/index.css', 'assets/index-D754j2Se.css'],
  ['assets/index.css', 'assets/index-B9TnSaMy.css'],
];

await Promise.all(
  assetCompatCopies.map(([source, target]) => copyFile(resolve(distDir, source), resolve(distDir, target))),
);
