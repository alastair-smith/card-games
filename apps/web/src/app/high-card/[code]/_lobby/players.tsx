"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import { CrownIcon, EllipsisVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { GameCode } from "@/types/game";
import { PlayerName, playerNameSchema, UserId } from "@/types/entities";

type Player = {
  id: UserId;
  name: PlayerName;
  isReady: boolean;
  isUser: boolean;
  isHost: boolean;
};

const FIELD_UPDATE_DELAY_MILLISECONDS = 500;

export function Players({
  className,
  code,
}: {
  className?: string;
  code: GameCode;
}) {
  const [players, setPlayers] = useState<Player[]>([]);

  const [userIsReady, setUserIsReady] = useState(false);
  const [userName, setUserName] = useState('');
  const [userNameError, setUserNameError] = useState<string | null>(null)

  const { data: playerData } = api.lobby.getPlayers.useQuery({ code }, { refetchOnWindowFocus: true });
  const updatePlayer = api.lobby.updatePlayer.useMutation();

  const debounceNameChange = useCallback(debounce((name: string) => {
    const { data, error } = playerNameSchema.safeParse(name);

    if (error) {
      setUserNameError(error.message)
    } else {
      updatePlayer.mutate({ field: 'name', value: data, code })
    }
  }, FIELD_UPDATE_DELAY_MILLISECONDS), []);

  const handleNameChange = ({ target: { value: name } }: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(name);
    debounceNameChange(name);
  }

  const debounceReadyChange = useCallback(debounce((ready: boolean) => {
    updatePlayer.mutate({ field: 'isReady', value: ready, code })
  }, FIELD_UPDATE_DELAY_MILLISECONDS), []);

  const handleReadyChange = (isReady: boolean) => {
    setUserIsReady(isReady);
    debounceReadyChange(isReady);
  }

  // initial player state
  useEffect(() => {
    if (playerData) {
      setPlayers(playerData);
      setUserName(playerData.find(({ isUser }) => isUser)?.name ?? '');
      setUserIsReady(playerData.find(({ isUser }) => isUser)?.isReady ?? false);
    }
  }, [playerData]);

  // stream of updated player state
  api.lobby.subscribe.useSubscription({ code }, {
    enabled: !!players,
    onData: ({ players }) => {
      setPlayers(players)
    },
  })

  const userIsHost = useMemo(() => players.some(({ isHost, isUser }) => isHost && isUser), [players]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Players</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        <InvitePlayers code={code} />
        <PlayerTable players={players} userIsReady={userIsReady} userName={userName} userNameError={userNameError} userIsHost={userIsHost} handleNameChange={handleNameChange} handleReadyChange={handleReadyChange} />
        <Button disabled>Start Game</Button>
      </CardContent>
    </Card>
  );
}
