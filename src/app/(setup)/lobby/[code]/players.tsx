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
import { useMemo, useState } from "react";
import debounce from "lodash/debounce";
import { playerNameSchema } from "@/app/api/auth/login/schema";
import { CrownIcon, EllipsisVertical } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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

type Player = {
  id: string;
  name: string;
  isReady: boolean;
  isCurrentUser: boolean;
  isHost: boolean;
};

const copyToClipboard = async (text: string) => {
  await navigator.clipboard.writeText(text);
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
          void copyToClipboard(code);
        }}
      >
        Copy Link
      </Button>
    </div>
  );
};

const PlayerTable = ({ players }: { players: Player[] }) => {
  const [currentPlayerReady, setCurrentPlayerReady] = useState(false);
  const { mutate: setReadyStatusMutation } =
    api.lobby.setReadyStatus.useMutation();
  const debounceUpdateReadyStatus = useMemo(
    () => debounce((ready: boolean) => setReadyStatusMutation({ ready }), 300),
    [setReadyStatusMutation],
  );

  const { mutate: nameMutation } = api.user.update.useMutation();
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
            <TableCell>
              <DropdownMenu>
                <Button asChild variant="secondary" size="sm">
                  <DropdownMenuTrigger>
                    <EllipsisVertical />
                  </DropdownMenuTrigger>
                </Button>
                <DropdownMenuContent>
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
                  </AlertDialog>

                  <AlertDialog>
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
                  </AlertDialog>

                  <AlertDialog>
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
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
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
        <Button disabled>Start Game</Button>
      </CardContent>
    </Card>
  );
}
