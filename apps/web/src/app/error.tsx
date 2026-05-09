'use client';

import {
  HouseIcon,
  MessageCircleQuestionMarkIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { CurrentUrlLink } from '~/components/current-url';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '~/components/ui/card';
import { PlayingCard } from '~/components/ui/playing-card';
import { recordClientError } from '~/telemetry/errors';
import { Suit, ZERO_RANK } from '~/types/cards';

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    recordClientError(error, 'error.boundary');
  }, [error]);

  return (
    <div className='flex min-h-dvh justify-center text-dark-text pt-[5vh]'>
      <div className='flex h-full w-full max-w-xl flex-col items-center justify-center gap-6 p-4'>
        <div className='flex justify-between gap-3 w-full'>
          <PlayingCard
            card={{ suit: Suit.SPADES, rank: 5 }}
            className='text-[clamp(1rem,7vw,2.7rem)]'
          />
          <PlayingCard
            card={{ suit: Suit.HEARTS, rank: ZERO_RANK }}
            className='text-[clamp(1rem,7vw,2.7rem)]'
          />
          <PlayingCard
            card={{ suit: Suit.CLUBS, rank: ZERO_RANK }}
            className='text-[clamp(1rem,7vw,2.7rem)]'
          />
        </div>

        <Card className='w-full'>
          <CardHeader className='text-4xl font-semibold'>
            Internal Server Error
          </CardHeader>
          <CardContent className='flex gap-3 flex-col'>
            <p>Sorry, we encountered an unexpected error on our end!</p>

            <p>
              Please try again. If that doesn't work then unfortunately you may
              need to start a new game.
            </p>

            <p>
              We do monitor for these sort of errors to try and fix the root
              cause, but please reach out if you are encountering repeated
              issues that are stopping you from playing!
            </p>
          </CardContent>

          <CardFooter className='flex flex-wrap gap-3 justify-end'>
            <Button variant='secondary' asChild>
              <a href='/contact'>
                <MessageCircleQuestionMarkIcon /> Contact Us
              </a>
            </Button>
            <Button asChild variant='secondary'>
              <a href='/'>
                <HouseIcon />
                Go Home
              </a>
            </Button>
            <CurrentUrlLink variant='default'>
              <RefreshCwIcon />
              Try Again
            </CurrentUrlLink>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
