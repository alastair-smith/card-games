"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/utils/cn";
import { useState } from "react";
import { GameCode } from "@/components/game-code";
import Link from "next/link";

export function JoinGame({ className }: { className?: string }) {
  const [code, setCode] = useState("");

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Join Game</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-center">
        <form className="flex flex-col items-center gap-4">
          <label className="flex flex-col gap-1.5">
            <span>Game Code</span>
            <GameCode code={code} setCode={setCode} />
          </label>

          <Button asChild>
            <Link href={`/lobby/${code}`}>Join</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
