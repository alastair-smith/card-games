'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cn } from '~/utils/cn';
import {
  type PlayerColor,
  playerColorHighlight,
  playerColorValue,
} from '~/utils/player-color';

type CarouselApi = NonNullable<UseEmblaCarouselType[1]>;

type TabsContextValue = {
  carouselRef: UseEmblaCarouselType[0];
  value: string | undefined;
  isSwipeable: boolean;
};

const TabsContext = createContext<TabsContextValue>({
  carouselRef: () => {},
  value: undefined,
  isSwipeable: false,
});

/** Whether a panel sits in a TabsViewport, so it slides rather than swaps. */
const TabsViewportContext = createContext(false);

// Never matches, for tabs that swipe at every size
const NO_MEDIA_QUERY = 'not all';

/** The carousel's index for a tab, read from the panels it slides. */
function getSlideIndex(carouselApi: CarouselApi, value: string | undefined) {
  const index = carouselApi
    .slideNodes()
    .findIndex((slide) => slide.dataset.value === value);
  return Math.max(index, 0);
}

/**
 * Tabs that swap panels, or, with the panels in a TabsViewport, slide them
 * side by side: they follow your finger and snap back or on to the next
 * panel like a carousel, and tapping a tab slides to its panel.
 */
function Tabs({
  className,
  value,
  defaultValue,
  onValueChange,
  staticQuery = NO_MEDIA_QUERY,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root> & {
  /**
   * A media query at which the panels in a TabsViewport stop swiping, so the
   * caller can lay them out together instead, e.g. with `lg:contents` on the
   * viewport.
   */
  staticQuery?: string | undefined;
}) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const currentValue = value ?? uncontrolledValue;
  const currentValueRef = useRef(currentValue);
  currentValueRef.current = currentValue;

  const handleValueChange = useCallback(
    (nextValue: string) => {
      setUncontrolledValue(nextValue);
      onValueChange?.(nextValue);
    },
    [onValueChange],
  );

  const [carouselRef, carouselApi] = useEmblaCarousel({
    breakpoints: { [staticQuery]: { active: false } },
  });
  const [isSwipeable, setIsSwipeable] = useState(true);

  // Starts on the current tab, and catches up when swiping starts again
  // after being static, when the carousel doesn't follow the tabs. The
  // carousel applies staticQuery itself, so ask it whether it's swiping
  // rather than matching the query again
  useEffect(() => {
    if (!carouselApi) return;
    const handleInit = () => {
      setIsSwipeable(carouselApi.internalEngine().options.active);
      carouselApi.scrollTo(
        getSlideIndex(carouselApi, currentValueRef.current),
        true,
      );
    };
    handleInit();
    carouselApi.on('reInit', handleInit);
    return () => {
      carouselApi.off('reInit', handleInit);
    };
  }, [carouselApi]);

  useEffect(() => {
    if (!carouselApi) return;
    const index = getSlideIndex(carouselApi, currentValue);
    if (index === carouselApi.selectedScrollSnap()) return;
    const isMotionAllowed = matchMedia(
      '(prefers-reduced-motion: no-preference)',
    ).matches;
    carouselApi.scrollTo(index, !isMotionAllowed);
  }, [carouselApi, currentValue]);

  useEffect(() => {
    if (!carouselApi) return;
    const handleSelect = () => {
      const selectedValue =
        carouselApi.slideNodes()[carouselApi.selectedScrollSnap()]?.dataset
          .value;
      if (selectedValue !== undefined) handleValueChange(selectedValue);
    };
    carouselApi.on('select', handleSelect);
    return () => {
      carouselApi.off('select', handleSelect);
    };
  }, [carouselApi, handleValueChange]);

  return (
    <TabsContext.Provider
      value={{ carouselRef, value: currentValue, isSwipeable }}
    >
      <TabsPrimitive.Root
        data-slot='tabs'
        value={currentValue}
        onValueChange={handleValueChange}
        className={cn('flex flex-col gap-2', className)}
        {...props}
      />
    </TabsContext.Provider>
  );
}

/** Holds swipeable panels side by side, clipping all but the active one. */
function TabsViewport({
  className,
  trackClassName,
  children,
}: {
  className?: string;
  trackClassName?: string;
  children: ReactNode;
}) {
  const { carouselRef } = useContext(TabsContext);

  return (
    <TabsViewportContext.Provider value>
      <div
        ref={carouselRef}
        className={cn('relative flex-1 min-h-0 overflow-hidden', className)}
      >
        {/* Absolutely positioned so the panels' h-full resolves even when no
            ancestor has a fixed height */}
        <div
          className={cn('absolute inset-0 flex touch-pan-y', trackClassName)}
        >
          {children}
        </div>
      </div>
    </TabsViewportContext.Provider>
  );
}

function TabsList({
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot='tabs-list'
      className={cn(
        'bg-alt-background inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]',
        className,
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  style,
  children,
  actionColor,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger> & {
  /**
   * Marks the tab as holding the player's next move: it pulses in this
   * colour, with a dot beside its label.
   */
  actionColor?: PlayerColor | undefined;
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot='tabs-trigger'
      style={
        actionColor
          ? ({
              '--color-highlight': playerColorHighlight(actionColor),
              ...style,
            } as CSSProperties)
          : style
      }
      className={cn(
        "data-[state=active]:bg-card-background focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-dark-text data-[state=active]:text-light-text inline-flex flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        actionColor && 'motion-safe:animate-pulse-bg',
        className,
      )}
      {...props}
    >
      {children}
      {actionColor && (
        <>
          <span
            aria-hidden='true'
            style={{ backgroundColor: playerColorValue(actionColor) }}
            className='size-2.5 rounded-full border border-white'
          />
          <span className='sr-only'>, your move</span>
        </>
      )}
    </TabsPrimitive.Trigger>
  );
}

function TabsContent({
  className,
  value,
  ...props
}: ComponentProps<typeof TabsPrimitive.Content>) {
  const isInViewport = useContext(TabsViewportContext);
  const { value: activeValue, isSwipeable } = useContext(TabsContext);

  if (!isInViewport) {
    return (
      <TabsPrimitive.Content
        data-slot='tabs-content'
        value={value}
        className={cn('flex-1 outline-none', className)}
        {...props}
      />
    );
  }

  return (
    <TabsPrimitive.Content
      data-slot='tabs-content'
      // Lets the carousel match its slides to tabs
      data-value={value}
      value={value}
      // Every panel stays mounted so its neighbour shows while dragging, but
      // only the active one can be focused or clicked
      forceMount
      inert={isSwipeable && value !== activeValue}
      className={cn('min-w-0 flex-[0_0_100%] h-full outline-none', className)}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger, TabsViewport };
