"use client";

import Link from "next/link";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { Button } from "./_components/ui/button";

function Game({
  name,
  href,
  image,
}: {
  name: string;
  href: string;
  image: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
      </CardHeader>

      <CardContent>
        <Image src={image} alt={name} width={300} height={200} />
      </CardContent>

      <CardFooter className="justify-end gap-2">
        <Button asChild variant="secondary">
          <Link href={href}>View Rules</Link>
        </Button>
        <Button asChild>
          <Link href={href}>Launch Game</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

const games = [
  { name: "Yaniv", href: "/yaniv", image: "https://placehold.co/300x200.png" },
  { name: "Blob", href: "/blob", image: "https://placehold.co/300x200.png" },
  {
    name: "Shithead",
    href: "/shithead",
    image: "https://placehold.co/300x200.png",
  },
  { name: "Fool", href: "/fool", image: "https://placehold.co/300x200.png" },
];

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
