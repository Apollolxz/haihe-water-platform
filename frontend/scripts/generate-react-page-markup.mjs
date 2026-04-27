import { readdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = resolve(rootDir, 'pages');
const outputPath = resolve(rootDir, 'src', 'legacyPageMarkup.js');

function extract(pattern, source, fallback = '') {
  return source.match(pattern)?.[1]?.trim() || fallback;
}

function normalizeBody(body) {
  return body
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/\sonclick="logout\(\)"/g, ' data-logout-link')
    .replace(
      /href="((?:index|dashboard|sandbox|knowledge-graph|chat|profile|login|register|forgot-password|boxplot-analysis|correlation-analysis|province-comparison|trend-analysis)\.html)"/g,
      'href="$1" data-page-link="$1"',
    )
    .trim();
}

const pageFiles = (await readdir(pagesDir)).filter((file) => file.endsWith('.html')).sort();
const pages = {};

for (const file of pageFiles) {
  const source = await readFile(resolve(pagesDir, file), 'utf8');
  pages[file] = {
    title: extract(/<title>([\s\S]*?)<\/title>/i, source, basename(file, '.html')),
    markup: normalizeBody(extract(/<body[^>]*>([\s\S]*?)<\/body>/i, source)),
  };
}

await writeFile(
  outputPath,
  `const legacyPages = ${JSON.stringify(pages, null, 2)};\n\nexport default legacyPages;\n`,
  'utf8',
);
