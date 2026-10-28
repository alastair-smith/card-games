'use client';

import useEmblaCarousel from 'embla-carousel-react';
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Tabs, TabsContent } from '~/components/ui/tabs';
import { cn } from '~/utils/cn';

type SwipeableTabsContextValue = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  value: string;
  isSwipeable: boolean;
};

const SwipeableTabsContext = createContext<SwipeableTabsContextValue | null>(
  null,
);

function useSwipeableTabs() {
  const context = useContext(SwipeableTabsContext);
  if (!context) {
    throw new Error('useSwipeableTabs must be used within <SwipeableTabs />');
  }
  return context;
}

// Never matches, for tabs that swipe at every size
const NO_MEDIA_QUERY = 'not all';

type SwipeableTabsProps = Omit<
  ComponentProps<typeof Tabs>,
  'value' | 'defaultValue' | 'onValueChange'
> & {
  /** Every tab's value, in the order the panels sit side by side. */
  values: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
  /**
   * A media query at which the panels stop swiping, so the caller can lay
   * them out together instead, e.g. with `lg:contents` on the viewport.
   */
  staticQuery?: string | undefined;
};

/**
 * Tabs whose panels sit side by side and follow your finger, snapping back or
 * on to the next panel like a carousel. Tapping a tab slides to its panel.
 */
function SwipeableTabs({
  values,
  value,
  onValueChange,
  staticQuery = NO_MEDIA_QUERY,
  children,
  ...props
}: SwipeableTabsProps) {
  const [carouselRef, carouselApi] = useEmblaCarousel({
    startIndex: Math.max(values.indexOf(value), 0),
    breakpoints: { [staticQuery]: { active: false } },
  });
  const [isSwipeable, setIsSwipeable] = useState(true);

  // The carousel applies staticQuery itself, so ask it whether it's swiping
  // rather than matching the query again
  useEffect(() => {
    if (!carouselApi) return;
    const updateIsSwipeable = () =>
      setIsSwipeable(carouselApi.internalEngine().options.active);
    updateIsSwipeable();
    carouselApi.on('reInit', updateIsSwipeable);
    return () => {
      carouselApi.off('reInit', updateIsSwipeable);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    const index = values.indexOf(value);
    if (index === carouselApi.selectedScrollSnap()) return;
    const isMotionAllowed = matchMedia(
      '(prefers-reduced-motion: no-preference)',
    ).matches;
    carouselApi.scrollTo(index, !isMotionAllowed);
  }, [carouselApi, values, value]);

  useEffect(() => {
    if (!carouselApi) return;
    const handleSelect = () => {
      const selectedValue = values[carouselApi.selectedScrollSnap()];
      if (selectedValue !== undefined) onValueChange(selectedValue);
    };
    // The carousel doesn't follow the tabs while it's static, so catch up
    // when it starts swiping again
    const handleReInit = () =>
      carouselApi.scrollTo(Math.max(values.indexOf(value), 0), true);
    carouselApi.on('select', handleSelect);
    carouselApi.on('reInit', handleReInit);
    return () => {
      carouselApi.off('select', handleSelect);
      carouselApi.off('reInit', handleReInit);
    };
  }, [carouselApi, values, value, onValueChange]);

  return (
    <SwipeableTabsContext.Provider value={{ carouselRef, value, isSwipeable }}>
      <Tabs value={value} onValueChange={onValueChange} {...props}>
        {children}
      </Tabs>
    </SwipeableTabsContext.Provider>
  );
}

/** Holds the panels, clipping all but the active one. */
function SwipeableTabsViewport({
  className,
  trackClassName,
  children,
}: {
  className?: string;
  trackClassName?: string;
  children: ReactNode;
}) {
  const { carouselRef } = useSwipeableTabs();

  return (
    <div
      ref={carouselRef}
      className={cn('relative flex-1 min-h-0 overflow-hidden', className)}
    >
      {/* Absolutely positioned so the panels' h-full resolves even when no
          ancestor has a fixed height */}
      <div className={cn('absolute inset-0 flex touch-pan-y', trackClassName)}>
        {children}
      </div>
    </div>
  );
}

function SwipeableTabsContent({
  className,
  value,
  ...props
}: Omit<ComponentProps<typeof TabsContent>, 'forceMount'>) {
  const { value: activeValue, isSwipeable } = useSwipeableTabs();

  return (
    <TabsContent
      value={value}
      // Every panel stays mounted so its neighbour shows while dragging, but
      // only the active one can be focused or clicked
      forceMount
      inert={isSwipeable && value !== activeValue}
      className={cn('min-w-0 flex-[0_0_100%] h-full', className)}
      {...props}
    />
  );
}

export { SwipeableTabs, SwipeableTabsContent, SwipeableTabsViewport };
