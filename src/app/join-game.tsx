"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./_components/ui/card";

export function JoinGame() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Join Game</CardTitle>
      </CardHeader>

      <CardContent>
        <form className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span>Game Code</span>
            <Input
              placeholder="Code"
              className="w-[10rem] text-center font-mono uppercase"
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
