import { useEffect, useRef } from 'react';

export function useLegacyPageRuntime(page, initInteractions) {
  const initInteractionsRef = useRef(initInteractions);
  initInteractionsRef.current = initInteractions;

  useEffect(() => {
    let cleanup;
    cleanup = initInteractionsRef.current?.();

    return () => {
      cleanup?.();
    };
  }, [page]);
}
