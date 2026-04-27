import { resolveLegacyScriptSrc } from './routing.js';

const loadedLegacyScripts = new Set();
const executedInlineScriptPages = new Set();

function loadScript(src) {
  const resolvedSrc = resolveLegacyScriptSrc(src);
  const key = resolvedSrc.split('?')[0];

  if (loadedLegacyScripts.has(key)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = resolvedSrc;
    script.async = false;
    if (src.includes('type="module"')) {
      script.type = 'module';
    }
    script.dataset.legacyPageScript = 'true';
    script.onload = () => {
      loadedLegacyScripts.add(key);
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${resolvedSrc}`));
    document.body.appendChild(script);
  });
}

export async function loadLegacyScripts(page) {
  const scripts = page.scripts || [];
  for (const src of scripts) {
    await loadScript(src);
  }

  const inlineScripts = page.inlineScripts || [];
  if (inlineScripts.length > 0 && !executedInlineScriptPages.has(page.title)) {
    inlineScripts.forEach((source, index) => {
      const script = document.createElement('script');
      script.text = source;
      script.dataset.legacyInlineScript = `${page.title}:${index}`;
      document.body.appendChild(script);
    });
    executedInlineScriptPages.add(page.title);
  }

  if (scripts.length > 0 || inlineScripts.length > 0) {
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }
}
