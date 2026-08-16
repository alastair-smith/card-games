'use client';

import { ClockIcon, UsersIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { toast } from '~/components/ui/toast';
import { api } from '~/trpc/react';
import { GameType, gameDisplayName, gameURL } from '~/types/game';
import { MAX_PLAYERS, MIN_PLAYERS } from '~/types/games/high-card';
import { cn } from '~/utils/cn';
import { HighCardThumbnail } from './thumbnails/high-card';
import { YanivThumbnail } from './thumbnails/yaniv';

enum GameLength {
  short = 'Fast Game',
  medium = 'Average Game',
  long = 'Longer Game',
}

type GameProps = {
  gameType: GameType;
  thumbnail: ReactNode;
  players: {
    min: number;
    max: number;
  };
  length: GameLength;
  summary: string;
  disabled?: boolean;
  /** Where to keep score for a game played in person, where there is one. */
  scoreboardURL?: string;
};

// TODO update min + max players
const games: GameProps[] = [
  {
    gameType: GameType.HIGH_CARD,
    thumbnail: <HighCardThumbnail />,
    players: {
      min: MIN_PLAYERS,
      max: MAX_PLAYERS,
    },
    length: GameLength.short,
    summary:
      'High Card is a simple luck-based game where the player with the highest card wins.',
  },
  {
    gameType: GameType.YANIV,
    thumbnail: <YanivThumbnail />,
    players: {
      min: 2,
      max: 5,
    },
    length: GameLength.medium,
    summary: 'Win hands of 7 points or under and call Yaniv!',
    scoreboardURL: `${gameURL[GameType.YANIV]}/scoreboard`,
  },
  // {
  //   gameType: GameType.BLOB,
  //   thumbnail: <BlobThumbnail />,
  //   players: {
  //     min: 3,
  //     max: 6,
  //   },
  //   length: GameLength.long,
  //   summary: 'Predict how many hands you will win in this trumps-like game.',
  //   disabled: true,
  // },
  // {
  //   gameType: GameType.SHITHEAD,
  //   thumbnail: <ShitheadThumbnail />,
  //   players: {
  //     min: 2,
  //     max: 4,
  //   },
  //   length: GameLength.short,
  //   summary:
  //     'Play your cards and hope you have enough magic to avoid picking up too many.',
  //   disabled: true,
  // },
  // {
  //   gameType: GameType.FOOL,
  //   thumbnail: <FoolThumbnail />,
  //   players: {
  //     min: 2,
  //     max: 4,
  //   },
  //   length: GameLength.medium,
  //   summary: 'Gang up on other players to rid yourself of all your cards.',
  //   disabled: true,
  // },
];

function Game({
  className,
  gameType,
  thumbnail,
  players,
  length,
  summary,
  disabled = false,
  scoreboardURL,
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

          <div
            aria-hidden='true'
            className='flex sm:hidden items-center justify-center self-center rounded-lg bg-main-background h-[250px] w-[250px]'
          >
            {thumbnail}
          </div>

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

          {scoreboardURL && (
            <Button variant='secondary' asChild>
              <a href={scoreboardURL}>Score Sheet</a>
            </Button>
          )}
        </div>

        <div className='hidden sm:flex items-center justify-center rounded-lg bg-main-background h-[250px] w-[250px] shrink-0'>
          {thumbnail}
        </div>
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
