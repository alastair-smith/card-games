"use client";

import { GameCode } from "@/components/game-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";

const InvitePlayers = ({ code }: { code: string }) => {
  return (
    <div className="flex gap-2">
      <GameCode code={code} />
      <Button className="h-auto">Copy Link</Button>
    </div>
  );
};

const PlayerTable = () => {
  return <div>Plahyers</div>;
};

export function Players({ className }: { className?: string }) {
  const params = useParams<{ code: string }>();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Players</CardTitle>
      </CardHeader>
      <CardContent>
        <InvitePlayers code={params.code} />
        <PlayerTable />
      </CardContent>
    </Card>
  );
}
