import { HouseIcon, RefreshCwIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { connection } from 'next/server';
import { CurrentUrlLink, CurrentUrlText } from '~/components/current-url';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '~/components/ui/card';
import { PlayingCard } from '~/components/ui/playing-card';
import { Suit, ZERO_RANK } from '~/types/cards';

export const metadata: Metadata = {
  title: '404 Not Found',
};

export default async function NotFound() {
  await connection();

  return (
    <div className='flex min-h-dvh justify-center text-dark-text pt-[5vh]'>
      <div className='flex h-full w-full max-w-xl flex-col items-center justify-center gap-6 p-4'>
        <div className='flex justify-between gap-3 w-full'>
          <PlayingCard
            card={{ suit: Suit.DIAMONDS, rank: 4 }}
            className='text-[clamp(1rem,7vw,2.7rem)]'
          />
          <PlayingCard
            card={{ suit: Suit.SPADES, rank: ZERO_RANK }}
            className='text-[clamp(1rem,7vw,2.7rem)]'
          />
          <PlayingCard
            card={{ suit: Suit.HEARTS, rank: 4 }}
            className='text-[clamp(1rem,7vw,2.7rem)]'
          />
        </div>

        <Card className='w-full'>
          <CardHeader className='text-4xl font-semibold'>Not Found</CardHeader>
          <CardContent className='flex gap-3 flex-col'>
            <p>Sorry, we couldn't find the page you are looking for.</p>

            <p>
              If you've copied the URL from somewhere please check it is
              correct.
            </p>

            <CurrentUrlText />
          </CardContent>

          <CardFooter className='flex flex-wrap gap-3 justify-end'>
            <CurrentUrlLink variant='secondary'>
              <RefreshCwIcon />
              Refresh
            </CurrentUrlLink>
            <Button asChild>
              <a href='/'>
                <HouseIcon />
                Go Home
              </a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
