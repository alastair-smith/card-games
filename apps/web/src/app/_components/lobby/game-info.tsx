"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GameCode } from "@/types/game";

export function GameInfo({
  className,
  code,
}: {
  className?: string;
  code: GameCode;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Game Info</CardTitle>
      </CardHeader>
      <CardContent></CardContent>
    </Card>
  );
}
