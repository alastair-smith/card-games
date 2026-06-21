import { fireEvent, render, screen } from '@testing-library/react';
import type { ComponentProps, ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { HowTo, HowToDialog } from '.';

vi.mock('~/components/ui/playing-card', () => ({
  PlayingCard: ({ card }: { card: { suit: string; rank: string } }) => (
    <span>{card.rank}</span>
  ),
}));

// Embla needs real layout, so stub the carousel with a context-backed fake that
// advances the selected slide synchronously when scrollPrev/scrollNext is called.
const SLIDE_TOTAL = 5;

vi.mock('~/components/ui/carousel', async () => {
  const { Children, createContext, useContext, useState } = await import(
    'react'
  );

  type CarouselContextValue = {
    scrollPrev: () => void;
    scrollNext: () => void;
    canScrollPrev: boolean;
    canScrollNext: boolean;
    selectedIndex: number;
    slideCount: number;
  };

  const Context = createContext<CarouselContextValue | null>(null);

  function useCarousel() {
    const context = useContext(Context);
    if (!context) {
      throw new Error('useCarousel must be used within a <Carousel />');
    }
    return context;
  }

  function Carousel({ children, ...props }: ComponentProps<'section'>) {
    const [index, setIndex] = useState(0);
    const value: CarouselContextValue = {
      selectedIndex: index,
      slideCount: SLIDE_TOTAL,
      canScrollPrev: index > 0,
      canScrollNext: index < SLIDE_TOTAL - 1,
      scrollPrev: () => setIndex((current) => Math.max(0, current - 1)),
      scrollNext: () =>
        setIndex((current) => Math.min(SLIDE_TOTAL - 1, current + 1)),
    };

    return (
      // aria-label is forwarded via props, making this a labelled region.
      <Context.Provider value={value}>
        <section {...props}>{children}</section>
      </Context.Provider>
    );
  }

  // Render only the selected slide, mirroring what the user actually sees, so
  // content assertions reflect the active slide rather than the whole deck.
  function CarouselContent({ children }: { children: ReactNode }) {
    const { selectedIndex } = useCarousel();
    return <div>{Children.toArray(children)[selectedIndex]}</div>;
  }

  return {
    Carousel,
    CarouselContent,
    CarouselItem: ({ children, ...props }: ComponentProps<'div'>) => (
      <div {...props}>{children}</div>
    ),
    useCarousel,
  };
});

describe('HowTo', () => {
  test('shows overview content on the first slide', () => {
    render(<HowTo />);
    expect(screen.getByText(/Yaniv is a fast card game/)).toBeInTheDocument();
  });

  test('shows slide counter starting at 1 of 5', () => {
    render(<HowTo />);
    expect(screen.getByText('1 of 5')).toBeInTheDocument();
  });

  test('does not show Previous button on the first slide', () => {
    render(<HowTo />);
    expect(
      screen.queryByRole('button', { name: 'Previous' }),
    ).not.toBeInTheDocument();
  });

  test('shows Next button on the first slide', () => {
    render(<HowTo />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  test('advances to second slide and updates counter when Next is clicked', () => {
    render(<HowTo />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Taking a turn')).toBeInTheDocument();
    expect(screen.getByText('2 of 5')).toBeInTheDocument();
  });

  test('shows Previous button after advancing past the first slide', () => {
    render(<HowTo />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(
      screen.getByRole('button', { name: 'Previous' }),
    ).toBeInTheDocument();
  });

  test('returns to the first slide when Previous is clicked', () => {
    render(<HowTo />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(screen.getByText(/Yaniv is a fast card game/)).toBeInTheDocument();
    expect(screen.getByText('1 of 5')).toBeInTheDocument();
  });

  test('does not show Next button on the last slide', () => {
    render(<HowTo />);
    // Advance to the last slide (slide 5)
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    }
    expect(screen.getByText('Scoring')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next' }),
    ).not.toBeInTheDocument();
  });

  test('announces the current slide position politely', () => {
    render(<HowTo />);
    expect(screen.getByText('1 of 5')).toHaveAttribute('aria-live', 'polite');
  });
});

describe('HowToDialog', () => {
  test('renders a How to play button as the trigger', () => {
    render(<HowToDialog />);
    expect(
      screen.getByRole('button', { name: 'How to play' }),
    ).toBeInTheDocument();
  });

  test('shows the first slide content when opened', () => {
    render(<HowToDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'How to play' }));
    expect(screen.getByText('How to play Yaniv')).toBeInTheDocument();
    expect(screen.getByText(/Yaniv is a fast card game/)).toBeInTheDocument();
  });

  test('shows Close instead of Next on the last slide', () => {
    render(<HowToDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'How to play' }));
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    }
    expect(
      screen.queryByRole('button', { name: 'Next' }),
    ).not.toBeInTheDocument();
    // The slide nav Close button appears alongside the dialog's built-in X close button
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2);
  });
});
