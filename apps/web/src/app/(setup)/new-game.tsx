'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { toast } from '~/components/ui/toast';
import { api } from '~/trpc/react';
import { GameType, gameDisplayName, gameURL } from '~/types/game';
import { cn } from '~/utils/cn';

type GameProps = {
  gameType: GameType;
  image: string;
};

const games: GameProps[] = [
  {
    gameType: GameType.HIGH_CARD,
    image: 'https://placehold.co/300x200.png',
  },
  {
    gameType: GameType.YANIV,
    image: 'https://placehold.co/300x200.png',
  },
  {
    gameType: GameType.BLOB,
    image: 'https://placehold.co/300x200.png',
  },
  {
    gameType: GameType.SHITHEAD,
    image: 'https://placehold.co/300x200.png',
  },
  {
    gameType: GameType.FOOL,
    image: 'https://placehold.co/300x200.png',
  },
];

function Game({ gameType, image }: GameProps) {
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
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>

      <CardContent>
        <Image src={image} alt={name} width={300} height={200} />
      </CardContent>

      <CardFooter className='justify-end gap-3'>
        <Button variant='secondary' disabled>
          View Rules
        </Button>
        <Button
          disabled={true}
          isLoading={true}
          onClick={() => {
            setIsLoading(true);
            createGame({
              gameType,
            });
          }}
        >
          Launch Game
        </Button>
      </CardFooter>
    </Card>
  );
}

export function NewGame({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-6',
        className,
      )}
    >
      {games.map((game) => (
        <Game key={game.gameType} {...game} />
      ))}
    </div>
  );
}
