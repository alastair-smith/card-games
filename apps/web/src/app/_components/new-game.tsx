'use client';

import { ClockIcon, UsersIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import Image from '~/components/ui/image';
import { toast } from '~/components/ui/toast';
import { api } from '~/trpc/react';
import { GameType, gameDisplayName, gameURL } from '~/types/game';
import { MAX_PLAYERS, MIN_PLAYERS } from '~/types/games/high-card';
import { cn } from '~/utils/cn';

enum GameLength {
  short = 'Fast Game',
  medium = 'Average Game',
  long = 'Longer Game',
}

type GameProps = {
  gameType: GameType;
  image: string;
  players: {
    min: number;
    max: number;
  };
  length: GameLength;
  summary: string;
  disabled?: boolean;
  preloadImage?: boolean;
};

// TODO update min + max players
const games: GameProps[] = [
  {
    gameType: GameType.HIGH_CARD,
    image: '/images/high-card.square.png',
    players: {
      min: MIN_PLAYERS,
      max: MAX_PLAYERS,
    },
    length: GameLength.short,
    summary: 'Draw the highest card to win the game.',
    preloadImage: true,
  },
  {
    gameType: GameType.YANIV,
    image: '/images/yaniv.square.png',
    players: {
      min: 2,
      max: 5,
    },
    length: GameLength.medium,
    summary: 'Win hands hands worth under 7 points and call Yaniv!',
    disabled: true,
    preloadImage: true,
  },
  {
    gameType: GameType.BLOB,
    image: '/images/blob.square.png',
    players: {
      min: 3,
      max: 6,
    },
    length: GameLength.long,
    summary: 'Predict how many hands you will win in this trumps-like game.',
    disabled: true,
  },
  {
    gameType: GameType.SHITHEAD,
    image: '/images/shithead.square.png',
    players: {
      min: 2,
      max: 4,
    },
    length: GameLength.short,
    summary:
      'Play your cards and hope you have enough magic to avoid picking up too many.',
    disabled: true,
  },
  {
    gameType: GameType.FOOL,
    image: '/images/fool.square.png',
    players: {
      min: 2,
      max: 4,
    },
    length: GameLength.medium,
    summary: 'Gang up on other players to rid yourself of all your cards.',
    disabled: true,
  },
];

function Game({
  className,
  gameType,
  image,
  players,
  length,
  summary,
  disabled = false,
  preloadImage = false,
}: GameProps & { className?: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: createGame } = api.lobby.create.useMutation({
    onSuccess: ({ code }) => {
      router.push(`${gameURL[gameType]}/${code}`);
    },
    onError: (err) => {
      setIsLoading(false);
      toast.error(err.message);
    },
  });
  const name = gameDisplayName[gameType];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>

      <CardContent className='flex gap-6'>
        <div className='flex flex-col gap-3 justify-between w-full'>
          <GameStats players={players} length={length} />

          <Image
            className='block sm:hidden self-center rounded-lg'
            src={image}
            alt={name}
            width={250}
            height={250}
            priority={preloadImage}
          />

          <p className='flex-1'>{summary}</p>

          <Button
            isLoading={isLoading}
            onClick={() => {
              setIsLoading(true);
              createGame({
                gameType,
              });
            }}
            disabled={disabled}
          >
            {disabled ? 'Coming Soon!' : 'Create Game'}
          </Button>
        </div>

        <Image
          className='hidden sm:block rounded-lg'
          src={image}
          alt={`Image of ${name} game`}
          width={250}
          height={250}
          priority={preloadImage}
        />
      </CardContent>
    </Card>
  );
}

function GameStats({
  className,
  players,
  length,
}: {
  className?: string;
  players: { min: number; max: number };
  length: GameLength;
}) {
  return (
    <div className={cn('flex gap-3 font-light justify-around', className)}>
      <div className='flex gap-1 items-center'>
        <UsersIcon size='18' />
        <span>
          {players.min}-{players.max} Players
        </span>
      </div>

      <div className='flex gap-1 items-center'>
        <ClockIcon size='18' />
        <span>{length}</span>
      </div>
    </div>
  );
}

export function NewGame({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid gap-6 sm:grid-cols-[repeat(auto-fit,minmax(37.5rem,1fr))]',
        className,
      )}
    >
      {games.map((game) => (
        <Game className='max-w-2xl' key={game.gameType} {...game} />
      ))}
    </div>
  );
}
