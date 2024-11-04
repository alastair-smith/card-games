"use client";

import { GameCode } from "@/components/game-code";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import debounce from "lodash/debounce";
import { playerNameSchema } from "@/app/api/auth/login/schema";
import { CrownIcon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

type Player = {
  id: string;
  name: string;
  isReady: boolean;
  isCurrentUser: boolean;
  isHost: boolean;
};

const InvitePlayers = ({ code }: { code: string }) => {
  return (
    <div className="flex gap-3">
      <GameCode code={code} />
      <Button className="h-auto">Copy Link</Button>
    </div>
  );
};

const PlayerTable = ({ players }: { players: Player[] }) => {
  const [currentPlayerReady, setCurrentPlayerReady] = useState(false);
  const { data, mutate: setReadyStatusMutation } =
    api.lobby.setReadyStatus.useMutation();
  const debounceUpdateReadyStatus = useMemo(
    () => debounce((ready: boolean) => setReadyStatusMutation({ ready }), 300),
    [setReadyStatusMutation],
  );

  const { data: user, mutate: nameMutation } = api.user.update.useMutation();
  const [currentPlayerName, setCurrentPlayerName] = useState(
    players.find(({ isCurrentUser }) => isCurrentUser)?.name ?? "",
  );
  const debounceUpdateName = useMemo(
    () => debounce((name: string) => nameMutation({ name }), 300),
    [nameMutation],
  );
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value;

    if (newName === "") {
      setCurrentPlayerName("");
    } else {
      const { error, data: validatedName } =
        playerNameSchema.safeParse(newName);

      if (!error) {
        setCurrentPlayerName(validatedName);
        debounceUpdateName(validatedName);
      }
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="sr-only w-[1ch]">Host</TableHead>
          <TableHead className="pl-7">Name</TableHead>
          <TableHead>Ready</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.id}>
            <TableCell className="w-[1ch]">
              {player.isHost ? <CrownIcon size={22} /> : ""}
            </TableCell>
            <TableCell className="flex gap-2">
              {player.isCurrentUser ? (
                <Input value={currentPlayerName} onChange={handleNameChange} />
              ) : (
                <span className="border border-transparent px-3">
                  {player.name}
                </span>
              )}
            </TableCell>
            <TableCell>
              <Switch
                disabled={!player.isCurrentUser}
                checked={
                  player.isCurrentUser ? currentPlayerReady : player.isReady
                }
                onCheckedChange={(ready) => {
                  setCurrentPlayerReady(ready);
                  debounceUpdateReadyStatus(ready);
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export function Players({ className }: { className?: string }) {
  const params = useParams<{ code: string }>();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Players</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <InvitePlayers code={params.code} />
        <PlayerTable
          players={[
            {
              name: "abc",
              isReady: false,
              id: "1234",
              isCurrentUser: true,
              isHost: true,
            },
            {
              name: "abc",
              isReady: true,
              id: "1235",
              isCurrentUser: false,
              isHost: false,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
