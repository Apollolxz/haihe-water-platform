export function definePage(page, Component) {
  return {
    ...page,
    Component,
  };
}
