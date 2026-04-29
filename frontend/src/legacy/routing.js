import nativePages from '../pages/nativePages.js';

export const basePath = import.meta.env.BASE_URL || '/';
export const normalizedBasePath = basePath.replace(/\/$/, '');
export const pageBase = `${normalizedBasePath}/pages/`;
export const appPages = nativePages;

export function getCurrentPage() {
  const pathname = window.location.pathname;
  const withoutBase =
    normalizedBasePath && pathname.startsWith(normalizedBasePath)
      ? pathname.slice(normalizedBasePath.length)
      : pathname;
  const match = withoutBase.match(/\/pages\/([^/]+\.html)$/);

  if (match?.[1] && appPages[match[1]]) {
    return match[1];
  }

  return 'index.html';
}

export function getLegacyPage(pageName) {
  return appPages[pageName] || appPages['index.html'];
}
