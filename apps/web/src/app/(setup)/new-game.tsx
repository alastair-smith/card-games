"use client";

import Image from "next/image";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { gameDisplayName, GameType, gameURL } from "@/types/game";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

type GameProps = {
  gameType: GameType;
  image: string;
};

const games: GameProps[] = [
  {
    gameType: GameType.HIGH_CARD,
    image: "https://placehold.co/300x200.png",
  },
  {
    gameType: GameType.YANIV,
    image: "https://placehold.co/300x200.png",
  },
  {
    gameType: GameType.BLOB,
    image: "https://placehold.co/300x200.png",
  },
  {
    gameType: GameType.SHITHEAD,
    image: "https://placehold.co/300x200.png",
  },
  {
    gameType: GameType.FOOL,
    image: "https://placehold.co/300x200.png",
  },
];

function Game({ gameType, image }: GameProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { mutate: create } = api.lobby.create.useMutation({
    onSuccess: ({ code }) => {
      router.push(`/lobby/${code}`);
    },
    onError: (err) => {
      setIsLoading(false);
      toast.error(err.message);
    },
  });
  const name = gameDisplayName[gameType];
  const url = gameURL[gameType];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>

      <CardContent>
        <Image src={image} alt={name} width={300} height={200} />
      </CardContent>

      <CardFooter className="justify-end gap-3">
        <Button variant="secondary">View Rules</Button>
        <Button asChild disabled={isLoading}>
          <Link href={url}>
            Launch Game
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function NewGame({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-6",
        className,
      )}
    >
      {games.map((game) => (
        <Game key={game.name} {...game} />
      ))}
    </div>
  );
}
