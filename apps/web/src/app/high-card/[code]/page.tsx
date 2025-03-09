'use server';

import Lobby from "@/components/lobby/lobby";
import { api } from "@/trpc/server";

export default async function HighCardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const game = await api.lobby.getSummary({ code });

  // TODO get from state
  const gameStage = 'LOBBY';

  await api.lobby.join({ code })

  return <Lobby type={game.type} code={game.code} />
}
