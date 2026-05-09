import { ClubIcon, DiamondIcon, HeartIcon } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
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

export function HowTo({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex flex-col gap-2 items-start justify-start', className)}
    >
      <section>
        <p>
          Yaniv is a card game where you want the lowest-value hand possible.
          Each turn you discard cards and draw replacements — when your hand
          totals 7 or less you can call &apos;Yaniv&apos; to end the round and
          score zero.
        </p>
      </section>

      <section className='flex flex-col gap-1'>
        <h3 className='text-base/relaxed font-semibold'>Card values</h3>
        <Table rootClassName='overflow-x-clip'>
          <TableCaption>Points per card</TableCaption>
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
                <PlayingCard
                  card={{ rank: Rank.ACE, suit: Suit.CLUBS }}
                  border
                />
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
                <PlayingCard
                  card={{ rank: Rank.TWO, suit: Suit.CLUBS }}
                  border
                />
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
                <PlayingCard
                  card={{ rank: Rank.SIX, suit: Suit.CLUBS }}
                  border
                />
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
                <PlayingCard
                  card={{ rank: Rank.TEN, suit: Suit.CLUBS }}
                  border
                />
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

      <section className='flex flex-col gap-1'>
        <h3 className='text-base/relaxed font-semibold'>Taking a turn</h3>
        <ol className='list-decimal list-inside flex flex-col gap-1'>
          <li>
            <span className='font-medium'>
              Play one or more cards from your hand.
            </span>
            <ul className='list-disc list-inside ml-4 mt-0.5 flex flex-col gap-0.5'>
              <li>
                Play multiple cards of the same number at once. For example:{' '}
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-bold',
                    suitColorClass.hearts,
                  )}
                >
                  7
                  <HeartIcon
                    fill='currentColor'
                    size={12}
                    aria-label='hearts'
                  />
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
                Play a straight flush of 3 or more consecutive cards. For
                example:{' '}
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-bold',
                    suitColorClass.hearts,
                  )}
                >
                  8
                  <HeartIcon
                    fill='currentColor'
                    size={12}
                    aria-label='hearts'
                  />
                </span>
                ,{' '}
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-bold',
                    suitColorClass.hearts,
                  )}
                >
                  9
                  <HeartIcon
                    fill='currentColor'
                    size={12}
                    aria-label='hearts'
                  />
                </span>
                ,{' '}
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-bold',
                    suitColorClass.hearts,
                  )}
                >
                  10
                  <HeartIcon
                    fill='currentColor'
                    size={12}
                    aria-label='hearts'
                  />
                </span>
                .
              </li>
            </ul>
          </li>
          <li>
            <span className='font-medium'>
              Draw a card from the deck or discard pile.
            </span>
            <ul className='list-disc list-inside ml-4 mt-0.5'>
              <li>
                If you play a card matching the number of the top discard, you
                may skip drawing entirely. For example, if the top discard is{' '}
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

      <section className='flex flex-col gap-1'>
        <h3 className='text-base/relaxed font-semibold'>Calling Yaniv</h3>
        <p>
          At the end of your turn, if your hand totals 7 or less, you can call
          &apos;Yaniv&apos; to signal the end the round. Every other player then
          gets one final turn and may also call &apos;Yaniv&apos; if their hand
          is 7 or less.
        </p>
      </section>

      <section className='flex flex-col gap-1'>
        <h3 className='text-base/relaxed font-semibold'>Scoring</h3>
        <ul className='list-disc list-inside flex flex-col gap-1'>
          <li>
            Each player scores the total value of cards left in their hand.
          </li>
          <li>
            The Yaniv caller with the lowest value scores 0. Other players who
            also called Yaniv score 25 instead.
          </li>
          <li>
            If your total hits exactly 50 it drops to 25; the same happens at
            exactly 100.
          </li>
          <li>
            The game ends when any player reaches 100 or more. And the player
            with the lowest total score wins.
          </li>
        </ul>
      </section>
    </div>
  );
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
        className='sm:max-w-4xl max-h-[90dvh] grid-rows-[auto_1fr_auto] overflow-hidden'
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle>How to play Yaniv</DialogTitle>
        </DialogHeader>

        <HowTo className='overflow-y-auto min-h-0' />

        <DialogFooter>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
