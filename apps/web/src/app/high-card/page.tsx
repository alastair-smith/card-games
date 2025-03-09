'use server'

import { api } from "@/trpc/server"
import { GameType, gameURL } from "@/types/game"
import { redirect } from "next/navigation";

export default async function LobbyPage() {
  const { code } = await api.lobby.create({ gameType: GameType.HIGH_CARD });

  redirect(`${gameURL[GameType.HIGH_CARD]}/${code}`);
};
