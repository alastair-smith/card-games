'use client';

import Lobby from "@/app/high-card/[code]/_lobby/lobby";
import { api } from "@/trpc/react";
import { useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { GameCode, GameStage, GameUpdate, Player } from "@/types/game";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import Loading from "./loading";
import HighCardGameController from "./_game/game-controller";
import { GameState } from "@/server/state/game/high-card";

export default function HighCard({ code }: { code: GameCode }) {
  const router = useRouter();

  const [stage, setStage] = useState<GameStage>(GameStage.LOADING);
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [state, setState] = useState<GameState | null>(null);

  api.highCard.state.useSubscription(stage === GameStage.FINISHED ? skipToken : { code }, {
    onStarted: () => {
      console.log(`Subscription to game ${code} started`)
    },
    onData: (newGameState) => {
      switch (newGameState.update) {
        case GameUpdate.KICKED:
          setStage(GameStage.FINISHED);
          toast.warning('You have been kicked from the game!');
          router.push('/');
          return;

        case GameUpdate.LEFT_GAME:
          setStage(GameStage.FINISHED);
          toast.info('You have left the game!');
          router.push('/');
          return;

        case GameUpdate.GAME_NOT_FOUND:
          setStage(GameStage.FINISHED);
          toast.warning('This game is not available!');
          router.push('/');
          return;

        case GameUpdate.FINISHED:
          setStage(GameStage.FINISHED);
          return;

        case GameUpdate.LOBBY_UPDATE:
          setPlayers(newGameState.players);
          return;

        case GameUpdate.GAME_STATE_UPDATE:
          setState(newGameState.state);
          return;

        case GameUpdate.LOBBY_FULL:
          setStage(GameStage.FINISHED);
          toast.warning('The lobby is full!');
          router.push('/');
          return;

        default:
          const exhaustiveCheck: never = newGameState;
          console.error(new Error(`Unexpected game update type: ${exhaustiveCheck}`))
          return;
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });

  if (stage === GameStage.LOADING || players === null || state === null) {
    return <Loading />;
  }

  if (stage === GameStage.LOBBY) {
    return <Lobby code={code} players={players} />;
  }

  return <HighCardGameController code={code} state={state} />
};
