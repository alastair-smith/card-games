import { createEvent, fireEvent, render, screen } from '@testing-library/react';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import { Carousel, CarouselContent, CarouselItem } from '.';

// Embla reads media queries and watches slides as it starts up, neither of
// which jsdom has an answer for.
beforeAll(() => {
  vi.stubGlobal('matchMedia', (media: string) => ({
    media,
    matches: false,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );

  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterAll(() => {
  vi.unstubAllGlobals();
});

const pressArrowLeft = (element: HTMLElement) => {
  const event = createEvent.keyDown(element, { key: 'ArrowLeft' });
  fireEvent(element, event);
  return event;
};

describe('Carousel', () => {
  test('turns the page when an arrow key is pressed on a slide', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <button type='button'>Somewhere to focus</button>
          </CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    const event = pressArrowLeft(
      screen.getByRole('button', { name: 'Somewhere to focus' }),
    );

    expect(event.defaultPrevented).toBe(true);
  });

  test('leaves the arrow keys to a field being typed in', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <input aria-label='A score' />
          </CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    const event = pressArrowLeft(screen.getByLabelText('A score'));

    expect(event.defaultPrevented).toBe(false);
  });

  test('leaves the arrow keys to the icon inside a drag handle', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <button type='button' data-slot='reorder-handle'>
              <svg aria-label='Grip' role='img' />
            </button>
          </CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    const event = pressArrowLeft(screen.getByRole('img', { name: 'Grip' }));

    expect(event.defaultPrevented).toBe(false);
  });

  test('leaves the arrow keys to a row being reordered', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>
            <button type='button' data-slot='reorder-handle'>
              Reorder Ada
            </button>
          </CarouselItem>
        </CarouselContent>
      </Carousel>,
    );

    const event = pressArrowLeft(
      screen.getByRole('button', { name: 'Reorder Ada' }),
    );

    expect(event.defaultPrevented).toBe(false);
  });
});
