"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./_components/ui/card";
import { cn } from "@/utils/cn";

export function JoinGame({ className }: { className?: string }) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader>
        <CardTitle>Join Game</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-center">
        <form className="flex flex-col items-center gap-4">
          <label className="flex flex-col gap-1.5">
            <span>Game Code</span>
            <Input
              placeholder="Code"
              className="h-20 min-w-60 max-w-80 text-center font-mono text-4xl uppercase"
              name="code"
              data-1p-ignore
              autoComplete="off"
            />
          </label>

          <Button>Join</Button>
        </form>
      </CardContent>
    </Card>
  );
}
