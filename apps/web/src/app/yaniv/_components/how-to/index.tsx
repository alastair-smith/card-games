'use client';

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClubIcon,
  DiamondIcon,
  HeartIcon,
  SpadeIcon,
} from 'lucide-react';
import type React from 'react';
import { Button } from '~/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '~/components/ui/carousel';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { PlayingCard } from '~/components/ui/playing-card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import {
  JOKER_RANK,
  JokerSuit,
  Rank,
  Suit,
  suitColorClass,
} from '~/types/cards';
import { cn } from '~/utils/cn';

function OverviewSlide() {
  return (
    <section className='flex flex-col gap-1'>
      <h3 className='text-base/relaxed font-semibold'>Summary</h3>
      <p>
        Yaniv is a fast card game where the smallest hand wins. Shed your cards,
        and draw carefully from the deck or discard pile to make your hand total
        as small as possible.
      </p>
      <p>
        The moment your hand drops to 7 or less, you can call &apos;Yaniv&apos;
        to signal the end of the round and score zero for the round. But call
        too soon and a rival with an even lower hand can steal the zero-points
        bonus and leave you with a penalty instead.
      </p>
      <p>
        Once a player reaches a total score over 100 the game ends and the
        player with the lowest total score wins!
      </p>
    </section>
  );
}

function CardValuesSlide() {
  return (
    <section className='flex flex-col gap-1'>
      <h3 className='text-base/relaxed font-semibold'>Card values</h3>
      <Table rootClassName='overflow-x-clip'>
        <TableCaption className='sr-only'>Points per card</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Card</TableHead>
            <TableHead className='text-center'>Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className='flex flex-wrap gap-2 items-center text-xs'>
              <PlayingCard
                card={{ rank: JOKER_RANK, suit: JokerSuit.RED }}
                border
              />
              <PlayingCard
                card={{ rank: JOKER_RANK, suit: JokerSuit.BLACK }}
                border
              />
            </TableCell>
            <TableCell className='text-center'>0</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='flex flex-wrap gap-2 items-center text-xs'>
              <PlayingCard
                card={{ rank: Rank.ACE, suit: Suit.DIAMONDS }}
                border
              />
              <PlayingCard card={{ rank: Rank.ACE, suit: Suit.CLUBS }} border />
              <PlayingCard
                card={{ rank: Rank.ACE, suit: Suit.HEARTS }}
                border
              />
              <PlayingCard
                card={{ rank: Rank.ACE, suit: Suit.SPADES }}
                border
              />
            </TableCell>
            <TableCell className='text-center'>1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='flex flex-wrap gap-2 items-center text-xs'>
              <PlayingCard card={{ rank: Rank.TWO, suit: Suit.CLUBS }} border />
              <PlayingCard
                card={{ rank: Rank.THREE, suit: Suit.DIAMONDS }}
                border
              />
              <PlayingCard
                card={{ rank: Rank.FOUR, suit: Suit.SPADES }}
                border
              />
              <PlayingCard
                card={{ rank: Rank.FIVE, suit: Suit.HEARTS }}
                border
              />
              <PlayingCard card={{ rank: Rank.SIX, suit: Suit.CLUBS }} border />
              <PlayingCard
                card={{ rank: Rank.SEVEN, suit: Suit.DIAMONDS }}
                border
              />
              <PlayingCard
                card={{ rank: Rank.EIGHT, suit: Suit.SPADES }}
                border
              />
              <PlayingCard
                card={{ rank: Rank.NINE, suit: Suit.HEARTS }}
                border
              />
              <PlayingCard card={{ rank: Rank.TEN, suit: Suit.CLUBS }} border />
            </TableCell>
            <TableCell className='text-center'>Face value</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className='flex flex-wrap gap-2 items-center text-xs'>
              <PlayingCard
                card={{ rank: Rank.JACK, suit: Suit.DIAMONDS }}
                border
              />
              <PlayingCard
                card={{ rank: Rank.QUEEN, suit: Suit.SPADES }}
                border
              />
              <PlayingCard
                card={{ rank: Rank.KING, suit: Suit.HEARTS }}
                border
              />
            </TableCell>
            <TableCell className='text-center'>10</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </section>
  );
}

function TakingATurnSlide() {
  return (
    <section className='flex flex-col gap-1'>
      <h3 className='text-base/relaxed font-semibold'>Taking a turn</h3>
      <ol className='list-decimal list-inside flex flex-col gap-1'>
        <li>
          <span className='font-medium'>
            Play one or more cards from your hand.
          </span>
          <ul className='list-disc list-inside ml-4 mt-0.5 flex flex-col gap-0.5'>
            <li>Any single card.</li>
            <li>
              Multiple cards of the same number. For example:{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.hearts,
                )}
              >
                7
                <HeartIcon fill='currentColor' size={12} aria-label='hearts' />
              </span>
              ,{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.clubs,
                )}
              >
                7
                <ClubIcon fill='currentColor' size={12} aria-label='clubs' />
              </span>
              ,{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.diamonds,
                )}
              >
                7
                <DiamondIcon
                  fill='currentColor'
                  size={12}
                  aria-label='diamonds'
                />
              </span>
              .
            </li>
            <li>
              A run of 3 or more cards with matching suit. For example:{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.hearts,
                )}
              >
                8
                <HeartIcon fill='currentColor' size={12} aria-label='hearts' />
              </span>
              ,{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.hearts,
                )}
              >
                9
                <HeartIcon fill='currentColor' size={12} aria-label='hearts' />
              </span>
              ,{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.hearts,
                )}
              >
                10
                <HeartIcon fill='currentColor' size={12} aria-label='hearts' />
              </span>
              .
            </li>
            <li>
              A run can be bridged by using jokers inside of it. But they
              can&apos;t be used on the ends. For example:{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.clubs,
                )}
              >
                4
                <ClubIcon fill='currentColor' size={12} aria-label='clubs' />
              </span>
              ,{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.clubs,
                )}
              >
                Joker
              </span>
              ,{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.clubs,
                )}
              >
                6
                <ClubIcon fill='currentColor' size={12} aria-label='clubs' />
              </span>
            </li>
            <li>
              A run of 2 cards can be played when extending from the discard
              card. For example:{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.spades,
                )}
              >
                3
                <SpadeIcon fill='currentColor' size={12} aria-label='spades' />
              </span>
              ,{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.spades,
                )}
              >
                2
                <SpadeIcon fill='currentColor' size={12} aria-label='spades' />
              </span>
              when the discard card is{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.spades,
                )}
              >
                A
                <SpadeIcon fill='currentColor' size={12} aria-label='spades' />
              </span>
              .
            </li>
          </ul>
        </li>
        <li>
          <span className='font-medium'>
            Draw a card from either the top of the deck or discard pile.
          </span>
          <ul className='list-disc list-inside ml-4 mt-0.5'>
            <li>
              If you play a card matching the number of the top discard, you may
              skip drawing entirely. For example, if the top discard is{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.diamonds,
                )}
              >
                4
                <DiamondIcon
                  fill='currentColor'
                  size={12}
                  aria-label='diamonds'
                />
              </span>{' '}
              and you play a{' '}
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-bold',
                  suitColorClass.clubs,
                )}
              >
                4
                <ClubIcon fill='currentColor' size={12} aria-label='clubs' />
              </span>
              , you may end your turn immediately.
            </li>
            <li>
              If you draw a card that matches the number of the last card you
              played, you can instantly play the card.
            </li>
          </ul>
        </li>
      </ol>
    </section>
  );
}

function CallingYanivSlide() {
  return (
    <section className='flex flex-col gap-1'>
      <h3 className='text-base/relaxed font-semibold'>Calling Yaniv</h3>
      <p>
        At the end of your turn, if your hand totals 7 or less, you can call
        &apos;Yaniv&apos; to signal the end of the round. Every other player
        then gets one final turn.
      </p>
      <p>
        Be careful calling &apos;Yaniv&apos; with a high hand total as you will
        get penalised if someone else calls it with a lower total.
      </p>
    </section>
  );
}

function ScoringSlide() {
  return (
    <section className='flex flex-col gap-1'>
      <h3 className='text-base/relaxed font-semibold'>Scoring</h3>
      <ul className='list-disc list-inside flex flex-col gap-1'>
        <li>
          At the end of each round each player scores the total value of cards
          left in their hand.
        </li>
        <li>
          The Yaniv caller with the lowest value scores 0. Other players who
          also called Yaniv score 25 instead.
        </li>
        <li>
          The first time your total score reaches exactly 50 it halves to 25.
          The same happens for when you first get exactly 100.
        </li>
        <li>
          The game ends when any player reaches 100 or more. And the player with
          the lowest total score wins.
        </li>
      </ul>
    </section>
  );
}

const SLIDE_COMPONENTS: Array<() => React.JSX.Element> = [
  OverviewSlide,
  TakingATurnSlide,
  CardValuesSlide,
  CallingYanivSlide,
  ScoringSlide,
];

const SLIDE_COUNT = SLIDE_COMPONENTS.length;

function SlideNav({ lastSlideAction }: { lastSlideAction?: React.ReactNode }) {
  const { scrollPrev, scrollNext, canScrollPrev, selectedIndex } =
    useCarousel();

  const isLast = selectedIndex === SLIDE_COUNT - 1;

  return (
    // Fixed thirds so the counter stays centred as the side buttons come and go.
    <div className='grid grid-cols-3 items-center w-full'>
      <div className='justify-self-start'>
        {canScrollPrev && (
          <Button variant='secondary' size='sm' onClick={scrollPrev}>
            <ArrowLeftIcon /> Previous
          </Button>
        )}
      </div>
      <span
        aria-live='polite'
        className='justify-self-center text-sm text-muted-foreground'
      >
        {selectedIndex + 1} of {SLIDE_COUNT}
      </span>
      <div className='justify-self-end'>
        {isLast ? (
          lastSlideAction
        ) : (
          <Button variant='secondary' size='sm' onClick={scrollNext}>
            Next <ArrowRightIcon />
          </Button>
        )}
      </div>
    </div>
  );
}

function SlideDeck({
  className,
  lastSlideAction,
}: {
  className?: string | undefined;
  lastSlideAction?: React.ReactNode;
}) {
  return (
    <Carousel
      aria-label='How to play Yaniv'
      className={cn('flex flex-col gap-4 w-full min-h-0', className)}
    >
      <div className='flex-1 min-h-0 overflow-y-auto'>
        <CarouselContent>
          {SLIDE_COMPONENTS.map((SlideContent, index) => (
            <CarouselItem
              key={SlideContent.name}
              aria-label={`${index + 1} of ${SLIDE_COUNT}`}
            >
              <SlideContent />
            </CarouselItem>
          ))}
        </CarouselContent>
      </div>
      <SlideNav lastSlideAction={lastSlideAction} />
    </Carousel>
  );
}

export function HowTo({ className }: { className?: string }) {
  return <SlideDeck className={className} />;
}

export function HowToDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size='sm' variant='secondary'>
          How to play
        </Button>
      </DialogTrigger>
      <DialogContent
        className='sm:max-w-4xl max-h-[90dvh] flex flex-col overflow-hidden'
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>How to play Yaniv</DialogTitle>
        </DialogHeader>

        <SlideDeck
          className='flex-1'
          lastSlideAction={
            <DialogClose asChild>
              <Button size='sm'>Close</Button>
            </DialogClose>
          }
        />
      </DialogContent>
    </Dialog>
  );
}
