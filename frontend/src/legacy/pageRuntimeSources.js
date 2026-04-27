import dashboardScreenSource from '../../assets/js/dashboard-screen.js?raw';
import knowledgeGraphSource from '../../assets/js/knowledge-graph-page.js?raw';
import sandboxValidationSource from '../../assets/js/sandbox-validation.js?raw';

const runtimeSources = new Map([
  ['../assets/js/dashboard-screen.js', dashboardScreenSource],
  ['../assets/js/knowledge-graph-page.js', knowledgeGraphSource],
  ['../assets/js/sandbox-validation.js', sandboxValidationSource],
]);

export function getBundledRuntimeSource(src) {
  const cleanSrc = String(src || '').split('?')[0];
  return runtimeSources.get(cleanSrc);
}
