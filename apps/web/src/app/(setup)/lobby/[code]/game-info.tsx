'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { useState } from "react";

export function GameInfo({ className, gameCode }: { className?: string, gameCode: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Game Info</CardTitle>
      </CardHeader>
      <CardContent>
      </CardContent>
    </Card>
  );
}
