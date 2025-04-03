"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useParams } from "next/navigation";
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
import { playerNameSchema, UserId } from "@/types/entities";

type Player = {
  id: UserId;
  name: string;
  isReady: boolean;
  isUser: boolean;
  isHost: boolean;
};

const FIELD_UPDATE_DELAY_MILLISECONDS = 500;

const copyUrlToClipboard = async () => {
  const { origin, pathname } = new URL(window.location.href);
  await navigator.clipboard.writeText(`${origin}${pathname}`);
  toast.success("Copied to clipboard.");
};

const InvitePlayers = ({ code }: { code: string }) => {
  return (
    <div className="flex gap-3">
      <Input
        placeholder="Code"
        className="h-20 min-w-60 max-w-80 text-center font-mono text-4xl uppercase"
        name="code"
        value={code}
        readOnly
      />
      <Button
        className="h-auto"
        onClick={() => {
          void copyUrlToClipboard();
        }}
      >
        Copy Link
      </Button>
    </div>
  );
};

const PlayerTable = ({ players, userIsReady, userName, userNameError, userIsHost, handleNameChange, handleReadyChange }: { players: Player[], userIsReady: boolean, userName: string; userNameError: string | null; userIsHost: boolean; handleNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void; handleReadyChange: (isReady: boolean) => void }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="sr-only w-[1ch]">Host</TableHead>
          <TableHead className="pl-7">Name</TableHead>
          <TableHead>Ready</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.id}>
            <TableCell className="w-[1ch]">
              {player.isHost ? (
                <>
                  <CrownIcon size={22} />
                  <span className="sr-only">Is host</span>
                </>
              ) : (
                ""
              )}
            </TableCell>
            <TableCell className="flex gap-2">
              {player.isUser ? (
                <Input value={userName} onChange={handleNameChange} />
              ) : (
                <span className="border border-transparent px-3">
                  {player.name}
                </span>
              )}
            </TableCell>
            <TableCell>
              <Switch
                disabled={!player.isUser}
                checked={
                  player.isUser ? userIsReady : player.isReady
                }
                onCheckedChange={handleReadyChange}
              />
            </TableCell>
            <TableCell>
              <PlayerDropdown player={player} userIsHost={userIsHost} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

function PlayerDropdown({ player, userIsHost }: { player: Player; userIsHost: boolean }) {
  const showLeave = player.isUser;
  const showKick = userIsHost && !player.isUser;
  const showMakeHost = userIsHost && !player.isHost;

  if (!showLeave && !showKick && !showMakeHost) {
    return null;
  }

  return (
    <DropdownMenu>
      <Button asChild variant="secondary" size="sm">
        <DropdownMenuTrigger>
          <EllipsisVertical />
        </DropdownMenuTrigger>
      </Button>
      <DropdownMenuContent>
        {showLeave &&
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Leave
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to leave the game?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You can rejoin by re-visiting the url.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>}

        {showKick && <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Kick
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Kick{" "}
                <span className="font-semibold">{player.name}</span>{" "}
                from the game?
              </AlertDialogTitle>
              <AlertDialogDescription>
                They will be able to rejoin by re-visiting the url.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>}

        {showMakeHost && <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Make Host
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Make{" "}
                <span className="font-semibold">{player.name}</span>{" "}
                the new host?
              </AlertDialogTitle>
              <AlertDialogDescription>
                You will remain in the game, but lose host powers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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
