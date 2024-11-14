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
import { GameType } from "@repo/database";
import { toast } from "@/components/ui/toast";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { login } from "@/app/api/auth/login/client";
import { useState } from "react";

type GameProps = {
  name: string;
  gameType: GameType;
  image: string;
};

const games: GameProps[] = [
  {
    name: "Yaniv",
    gameType: GameType.YANIV,
    image: "https://placehold.co/300x200.png",
  },
  {
    name: "Blob",
    gameType: GameType.BLOB,
    image: "https://placehold.co/300x200.png",
  },
  {
    name: "Shithead",
    gameType: GameType.SHITHEAD,
    image: "https://placehold.co/300x200.png",
  },
  {
    name: "Fool",
    gameType: GameType.FOOL,
    image: "https://placehold.co/300x200.png",
  },
];

function Game({ name, gameType, image }: GameProps) {
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

  const launchAction = async () => {
    setIsLoading(true);
    await login();
    create({ gameType });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>

      <CardContent>
        <Image src={image} alt={name} width={300} height={200} />
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button variant="secondary">View Rules</Button>
        <Button
          onClick={() => {
            void launchAction();
          }}
          disabled={isLoading}
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
