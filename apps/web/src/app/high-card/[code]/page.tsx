'use server';

import Lobby from "@/components/lobby/lobby";
import { api } from "@/trpc/server";
import HighCardGameController from "./game/game-controller";

type GameStage = 'LOBBY' | 'IN_PROGRESS' | 'FINISHED';

export default async function HighCardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const game = await api.lobby.getSummary({ code });

  // TODO get from state
  const gameStage = 'IN_PROGRESS' as GameStage;

  switch (gameStage) {
    case 'LOBBY':
      await api.lobby.join({ code });
      return (<Lobby type={game.type} code={game.code} />);
    case 'IN_PROGRESS':
      return (<HighCardGameController code={game.code} />);
    default:
      return <div>Error</div>
  }
};
