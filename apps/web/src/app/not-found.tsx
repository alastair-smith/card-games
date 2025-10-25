import { HouseIcon, RefreshCwIcon } from 'lucide-react';
import type { Metadata } from 'next';
import { CurrentUrlLink, CurrentUrlText } from '~/components/current-url';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '~/components/ui/card';
import {
  PlayingCard,
  ZeroPlayingCard,
} from '~/components/ui/playing-card/playing-card';
import { Suit } from '~/types/cards';

export const metadata: Metadata = {
  title: '404 Not Found',
};

export default function NotFound() {
  return (
    <div className='flex min-h-dvh justify-center text-dark-text pt-[10vh]'>
      <div className='flex h-full w-full max-w-xl flex-col items-center justify-center gap-6 p-4'>
        <div className='flex justify-between gap-3 transform scale-65 sm:scale-100 w-full'>
          <PlayingCard card={{ suit: Suit.DIAMONDS, rank: 4 }} />
          <ZeroPlayingCard suit={Suit.CLUBS} />
          <PlayingCard card={{ suit: Suit.HEARTS, rank: 4 }} />
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

          <CardFooter className='flex gap-3 justify-end'>
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
