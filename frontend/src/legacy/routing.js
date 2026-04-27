import legacyPages from '../generated/LegacyPages.jsx';

export const basePath = import.meta.env.BASE_URL || '/';
export const normalizedBasePath = basePath.replace(/\/$/, '');
export const pageBase = `${normalizedBasePath}/pages/`;

export function getCurrentPage() {
  const pathname = window.location.pathname;
  const withoutBase =
    normalizedBasePath && pathname.startsWith(normalizedBasePath)
      ? pathname.slice(normalizedBasePath.length)
      : pathname;
  const match = withoutBase.match(/\/pages\/([^/]+\.html)$/);

  if (match?.[1] && legacyPages[match[1]]) {
    return match[1];
  }

  return 'index.html';
}

export function getLegacyPage(pageName) {
  return legacyPages[pageName] || legacyPages['index.html'];
}

export function resolveLegacyScriptSrc(src) {
  if (/^https?:\/\//i.test(src)) return src;

  const cleanSrc = src.replace(/^\.\.\//, '').replace(/^\.\//, '');
  return `${normalizedBasePath}/${cleanSrc}`.replace(/\/{2,}/g, '/');
}
