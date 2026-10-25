import { type RefObject, useEffect, useState } from 'react';

type RenderedSize = { width: number; height: number };

// Storybook renders the story element after this hook first runs, so wait for
// it to appear before observing its size
export const useRenderedSize = (
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
) => {
  const [size, setSize] = useState<RenderedSize>();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.target.getBoundingClientRect();
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    let observedElement: Element | null = null;

    const observeElement = () => {
      const element = container.querySelector(selector);
      if (!element || element === observedElement) return;
      resizeObserver.disconnect();
      resizeObserver.observe(element);
      observedElement = element;
    };
    const mutationObserver = new MutationObserver(observeElement);
    mutationObserver.observe(container, { childList: true, subtree: true });
    observeElement();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [containerRef, selector]);

  return size;
};
