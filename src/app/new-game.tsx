"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./_components/ui/card";
import Link from "next/link";

function Game({ name, href }: { name: string; href: string }) {
  return (
    <Link href={href}>
      <Card>
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>

        <CardContent></CardContent>
      </Card>
    </Link>
  );
}

export function NewGame() {
  return (
    <>
      <Game name="Yaniv" href="/yaniv" />
      <Game name="Blob" href="/blob" />
      <Game name="Shithead" href="/shithead" />
      <Game name="Fool" href="/fool" />
    </>
  );
}
