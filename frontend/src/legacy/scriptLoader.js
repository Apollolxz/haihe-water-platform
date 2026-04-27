import { resolveLegacyScriptSrc } from './routing.js';

const loadedLegacyScripts = new Set();

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

  if (scripts.length > 0) {
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }
}
