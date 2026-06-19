import type { ReactNode } from 'react';
import { cn } from '~/utils/cn';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '.';

const SLIDES = [1, 2, 3, 4, 5];

// Padding leaves room for the prev/next buttons, which sit outside the content.
function StoryFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex justify-center px-16 py-10', className)}>
      {children}
    </div>
  );
}

function Slide({ label }: { label: string }) {
  return (
    <div className='flex aspect-square items-center justify-center rounded-lg border border-border bg-card-background text-4xl font-semibold text-light-text'>
      {label}
    </div>
  );
}

export function Horizontal() {
  return (
    <StoryFrame>
      <Carousel className='w-full max-w-xs'>
        <CarouselContent>
          {SLIDES.map((slide) => (
            <CarouselItem key={slide}>
              <Slide label={String(slide)} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </StoryFrame>
  );
}

export function Vertical() {
  return (
    <StoryFrame className='py-16'>
      <Carousel
        orientation='vertical'
        opts={{ align: 'start' }}
        className='w-full max-w-xs'
      >
        <CarouselContent className='h-[300px]'>
          {SLIDES.map((slide) => (
            <CarouselItem key={slide} className='basis-1/2'>
              <Slide label={String(slide)} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </StoryFrame>
  );
}

export function MultipleVisible() {
  return (
    <StoryFrame>
      <Carousel opts={{ align: 'start' }} className='w-full max-w-sm'>
        <CarouselContent>
          {SLIDES.map((slide) => (
            <CarouselItem key={slide} className='basis-1/3'>
              <Slide label={String(slide)} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </StoryFrame>
  );
}

export function Looping() {
  return (
    <StoryFrame>
      <Carousel opts={{ loop: true }} className='w-full max-w-xs'>
        <CarouselContent>
          {SLIDES.map((slide) => (
            <CarouselItem key={slide}>
              <Slide label={String(slide)} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </StoryFrame>
  );
}
