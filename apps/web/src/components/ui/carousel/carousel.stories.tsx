import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader } from '~/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { cn } from '~/utils/cn';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  useCarousel,
} from '.';

type CarouselStoryProps = ComponentProps<typeof Carousel> & {
  frameClassName?: string;
  contentClassName?: string;
  itemBasis?: string;
};

const meta: Meta<CarouselStoryProps> = {
  title: 'UI Components / Carousel',
  component: Carousel,
  args: {
    orientation: 'horizontal',
    className: 'w-full max-w-xs',
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
  },
  render: ({ frameClassName, contentClassName, itemBasis, ...args }) => (
    <StoryFrame className={frameClassName}>
      <Carousel {...args}>
        <CarouselContent className={contentClassName}>
          {SLIDES.map((slide) => (
            <CarouselItem key={slide} className={itemBasis}>
              <Slide label={String(slide)} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </StoryFrame>
  ),
};

export default meta;

type Story = StoryObj<CarouselStoryProps>;

const SLIDES = [1, 2, 3, 4, 5];

// Padding leaves room for the prev/next buttons, which sit outside the content.
function StoryFrame({
  children,
  className,
}: {
  children: ReactNode;
  className?: string | undefined;
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

function Example({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='flex flex-col gap-2'>
      <h3 className='text-lg font-medium text-dark-text'>{title}</h3>
      {children}
    </section>
  );
}

export const Horizontal: Story = {};

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className='flex flex-col gap-8 p-8'>
      <Card className='max-w-2xl'>
        <CardHeader className='text-2xl font-medium'>Carousel</CardHeader>
        <CardContent className='flex flex-col gap-4'>
          <p>
            A slide / scroll container built on{' '}
            <a
              href='https://www.embla-carousel.com'
              className='underline'
              target='_blank'
              rel='noreferrer'
            >
              Embla Carousel
            </a>
            . Compose it from the parts below and navigate with either the
            built-in arrow buttons or your own controls via the{' '}
            <code className='font-mono'>useCarousel</code> hook.
          </p>

          <Table className='w-full'>
            <TableCaption>Parts</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className='font-mono'>Carousel</TableCell>
                <TableCell>
                  The root. Sets up Embla and the keyboard arrow navigation.
                  Accepts <code className='font-mono'>opts</code> (Embla
                  options), <code className='font-mono'>orientation</code>, and{' '}
                  <code className='font-mono'>setApi</code>.
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='font-mono'>CarouselContent</TableCell>
                <TableCell>
                  The scrolling viewport that wraps the slides.
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='font-mono'>CarouselItem</TableCell>
                <TableCell>
                  A single slide. Defaults to full width — set a{' '}
                  <code className='font-mono'>basis-*</code> class to show
                  several at once.
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='font-mono'>
                  CarouselPrevious / CarouselNext
                </TableCell>
                <TableCell>
                  Optional floating arrow buttons. Omit them and build your own
                  when you need labelled controls or a counter.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>

          <Table className='w-full'>
            <TableCaption>
              useCarousel() — call inside a Carousel to build custom controls
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Value</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className='font-mono'>
                  scrollPrev / scrollNext
                </TableCell>
                <TableCell>Move to the previous / next slide.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='font-mono'>
                  canScrollPrev / canScrollNext
                </TableCell>
                <TableCell>
                  Whether there is a slide to move to — use to disable or hide
                  controls at the ends.
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='font-mono'>selectedIndex</TableCell>
                <TableCell>
                  The zero-based index of the current slide.
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='font-mono'>slideCount</TableCell>
                <TableCell>The total number of slides.</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className='font-mono'>api</TableCell>
                <TableCell>
                  The underlying Embla instance, for advanced use.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Example title='Horizontal — floating buttons'>
        <HorizontalExample />
      </Example>
      <Example title='Multiple visible'>
        <MultipleVisibleExample />
      </Example>
      <Example title='Looping'>
        <LoopingExample />
      </Example>
      <Example title='Vertical'>
        <VerticalExample />
      </Example>
      <Example title='Custom buttons via useCarousel'>
        <CustomButtonsExample />
      </Example>
    </div>
  ),
};

function HorizontalExample() {
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

function VerticalExample() {
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

function MultipleVisibleExample() {
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

function LoopingExample() {
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

// Builds its own labelled controls and counter from the useCarousel hook
// instead of the floating CarouselPrevious / CarouselNext buttons.
function CustomNav() {
  const {
    scrollPrev,
    scrollNext,
    canScrollPrev,
    canScrollNext,
    selectedIndex,
    slideCount,
  } = useCarousel();

  return (
    <div className='mt-4 flex items-center justify-between gap-4'>
      <Button
        variant='secondary'
        size='sm'
        onClick={scrollPrev}
        disabled={!canScrollPrev}
      >
        <ArrowLeftIcon /> Previous
      </Button>
      <span className='text-sm text-dark-text'>
        {selectedIndex + 1} of {slideCount}
      </span>
      <Button
        variant='secondary'
        size='sm'
        onClick={scrollNext}
        disabled={!canScrollNext}
      >
        Next <ArrowRightIcon />
      </Button>
    </div>
  );
}

function CustomButtonsExample() {
  return (
    <StoryFrame className='px-8'>
      <Carousel className='w-full max-w-xs'>
        <CarouselContent>
          {SLIDES.map((slide) => (
            <CarouselItem key={slide}>
              <Slide label={String(slide)} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CustomNav />
      </Carousel>
    </StoryFrame>
  );
}

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    opts: { align: 'start' },
    frameClassName: 'py-16',
    contentClassName: 'h-[300px]',
    itemBasis: 'basis-1/2',
  },
};

export const MultipleVisible: Story = {
  args: {
    opts: { align: 'start' },
    className: 'w-full max-w-sm',
    itemBasis: 'basis-1/3',
  },
};

export const Looping: Story = { args: { opts: { loop: true } } };

// Builds its own labelled controls from the useCarousel hook instead of the
// floating CarouselPrevious / CarouselNext buttons.
export const CustomButtons: Story = {
  parameters: { controls: { disable: true } },
  render: () => <CustomButtonsExample />,
};
