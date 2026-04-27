import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pagesDir = resolve(rootDir, 'pages');
const outputDir = resolve(rootDir, 'src', 'generated');
const outputPath = resolve(outputDir, 'LegacyPages.jsx');

const pageLinkPattern =
  /href="((?:index|dashboard|sandbox|knowledge-graph|chat|profile|login|register|forgot-password|boxplot-analysis|correlation-analysis|province-comparison|trend-analysis)\.html)"/g;

const voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

function extract(pattern, source, fallback = '') {
  return source.match(pattern)?.[1]?.trim() || fallback;
}

function toComponentName(file) {
  return `${basename(file, '.html')
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join('')}Page`;
}

function toStyleObject(styleText) {
  const entries = styleText
    .split(';')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const separator = entry.indexOf(':');
      if (separator === -1) return null;

      const rawName = entry.slice(0, separator).trim();
      const value = entry.slice(separator + 1).trim();
      if (!rawName || !value) return null;

      const name = rawName.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      return `${JSON.stringify(name)}: ${JSON.stringify(value)}`;
    })
    .filter(Boolean);

  return `{{ ${entries.join(', ')} }}`;
}

function convertAttributes(markup) {
  return markup
    .replace(/\sclass=/g, ' className=')
    .replace(/\sfor=/g, ' htmlFor=')
    .replace(/\stabindex=/g, ' tabIndex=')
    .replace(/\scolspan=/g, ' colSpan=')
    .replace(/\srowspan=/g, ' rowSpan=')
    .replace(/\smaxlength=/g, ' maxLength=')
    .replace(/\sminlength=/g, ' minLength=')
    .replace(/\sreadonly(?=[\s>])/g, ' readOnly')
    .replace(/\sautocomplete=/g, ' autoComplete=')
    .replace(/\scontenteditable=/g, ' contentEditable=')
    .replace(/\sstyle="([^"]*)"/g, (_, styleText) => ` style=${toStyleObject(styleText)}`);
}

function selfCloseVoidTags(markup) {
  return voidTags.reduce(
    (current, tag) => current.replace(new RegExp(`<(${tag})(\\b[^>]*?)(?<!/)>(?!</${tag}>)`, 'gi'), `<$1$2 />`),
    markup,
  );
}

function normalizeBody(body) {
  return selfCloseVoidTags(
    convertAttributes(
      body
        .replace(/<script\b[\s\S]*?<\/script>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\son[a-z]+="[^"]*"/gi, '')
        .replace(pageLinkPattern, 'href="$1" data-page-link="$1"')
        .trim(),
    ),
  );
}

function extractStyles(source) {
  return [...source.matchAll(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi)]
    .map((match) => match[1].trim())
    .filter(Boolean)
    .join('\n\n');
}

function extractScripts(source) {
  return [...source.matchAll(/<script\b[^>]*src=["']([^"']+)["'][^>]*><\/script>/gi)]
    .map((match) => match[1])
    .filter((src) => !/tailwindcss\.com|echarts@|font-awesome|assets\/js\/nav-search\.js/i.test(src));
}

function normalizeScripts(file, scripts) {
  if (file !== 'chat.html') return scripts;

  const removedChatRuntime = new Set([
    '../services/chatService.js',
    '../utils/chatUtils.js',
    '../components/ChatMessage.js',
    '../layouts/layout.js',
    '../assets/js/chat-page.js',
  ]);

  return scripts.filter((src) => !removedChatRuntime.has(src.split('?')[0]));
}

async function extractLinkedLocalStyles(source) {
  const localStyles = [];
  const matches = source.matchAll(/<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi);

  for (const match of matches) {
    const href = match[1];
    if (/^https?:\/\//i.test(href)) continue;

    const cleanHref = href.split('?')[0];
    const stylesheetPath = resolve(pagesDir, cleanHref);

    try {
      localStyles.push(await readFile(stylesheetPath, 'utf8'));
    } catch (error) {
      console.warn(`Unable to inline stylesheet ${href}:`, error.message);
    }
  }

  return localStyles.join('\n\n');
}

const pageFiles = (await readdir(pagesDir)).filter((file) => file.endsWith('.html')).sort();
const components = [];
const registry = [];

for (const file of pageFiles) {
  const source = await readFile(resolve(pagesDir, file), 'utf8');
  const title = extract(/<title>([\s\S]*?)<\/title>/i, source, basename(file, '.html'));
  const linkedStyles = await extractLinkedLocalStyles(source);
  const styles = [linkedStyles, extractStyles(source)].filter(Boolean).join('\n\n');
  const scripts = normalizeScripts(file, extractScripts(source));
  const body = extract(/<body[^>]*>([\s\S]*?)<\/body>/i, source);
  const jsx = normalizeBody(body);
  const componentName = toComponentName(file);
  const styleBlock = styles ? `      <style>{${JSON.stringify(styles)}}</style>\n` : '';

  components.push(`function ${componentName}() {\n  return (\n    <>\n${styleBlock}${jsx}\n    </>\n  );\n}`);
  registry.push(
    `  ${JSON.stringify(file)}: { title: ${JSON.stringify(title)}, scripts: ${JSON.stringify(scripts)}, Component: ${componentName} }`,
  );
}

await mkdir(outputDir, { recursive: true });
await writeFile(
  outputPath,
  `/* eslint-disable react/no-unknown-property */\n${components.join('\n\n')}\n\nconst legacyPages = {\n${registry.join(',\n')},\n};\n\nexport default legacyPages;\n`,
  'utf8',
);
