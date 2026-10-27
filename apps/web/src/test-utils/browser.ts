import { vi } from 'vitest';

class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

/**
 * Stands in for the browser APIs jsdom lacks, which media queries and
 * carousels need. Media queries match only those in `matchingQueries`.
 * Undo with `vi.unstubAllGlobals()`.
 */
export function stubBrowserApis({
  matchingQueries = [],
}: {
  matchingQueries?: string[];
} = {}) {
  vi.stubGlobal('ResizeObserver', NoopObserver);
  vi.stubGlobal('IntersectionObserver', NoopObserver);
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: matchingQueries.includes(query),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
}
