"use client";

import Link from "next/link";
import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";

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
    <Link href={href}>
      <Card>
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>

        <CardContent>
          <Image src={image} alt={name} width={300} height={200} />
        </CardContent>
      </Card>
    </Link>
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
        "grid grid-cols-[repeat(auto-fit,minmax(20rem,1fr))] gap-4",
        className,
      )}
    >
      {games.map((game) => (
        <Game key={game.name} {...game} />
      ))}
    </div>
  );
}
