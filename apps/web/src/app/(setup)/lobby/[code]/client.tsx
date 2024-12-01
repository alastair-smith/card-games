"use client";

import { GameInfo } from "./game-info";
import { Players } from "./players";
import { type PlayerId } from "@/schemas/entities";

export default function LobbyClient({ joinCode, userId }: { joinCode: string, userId: PlayerId }) {
  return userId ? (
    <div className="flex w-full flex-wrap gap-6">
      <h1 className="sr-only">Lobby</h1>
      <GameInfo className="flex-1" gameCode={joinCode} />
      <Players className="flex-1" gameCode={joinCode} userId={userId} />
    </div>
  ) : (
    <div>Loading...</div>
  );
}
