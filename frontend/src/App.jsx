import { useEffect } from 'react';
import { wireLegacyInteractions } from './legacy/interactions.js';
import { ensureRuntimeBridge } from './legacy/runtimeBridge.js';
import { getCurrentPage, getLegacyPage } from './legacy/routing.js';
import './styles.css';

export default function App() {
  ensureRuntimeBridge();

  const pageName = getCurrentPage();
  const page = getLegacyPage(pageName);
  const Page = page.Component;

  useEffect(() => {
    document.title = page.title;
    return wireLegacyInteractions(pageName);
  }, [page.title, pageName]);

  return <Page key={pageName} page={page} pageName={pageName} />;
}
