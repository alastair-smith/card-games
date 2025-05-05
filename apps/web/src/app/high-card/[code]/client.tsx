'use client';

import Lobby from "@/app/high-card/[code]/_lobby/lobby.view";
import { api } from "@/trpc/react";
import { useState } from "react";
import { skipToken } from "@tanstack/react-query";
import { GameCode, GameStage, GameUpdate } from "@/types/game";
import { toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import Loading from "./loading";

export default function HighCard({ code }: { code: GameCode }) {
  const router = useRouter();

  const [stage, setStage] = useState<GameStage>(GameStage.LOADING);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [state, setState] = useState<GameState | null>(null);

  const x = api.lobby.subscribe.useSubscription(stage === GameStage.FINISHED ? skipToken : { code }, {
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

        case GameUpdate.GAME_UNAVAILABLE:
          setStage(GameStage.FINISHED);
          toast.warning('This game is not available!');
          router.push('/');
          return;

        case GameUpdate.FINISHED:
          setStage(GameStage.FINISHED);
          return;

        case GameUpdate.LOBBY_UPDATE:
          setLobby(newGameState.lobby);
          return;

        case GameUpdate.GAME_STATE_UPDATE:
          setState(newGameState.state);
          return;

        default:
          console.error(new Error('Unexpected game update type.'))
          return;
      }
    },
    onError: (error) => {
      console.error(error);
    },
  });

  switch (stage) {
    case 'LOBBY': case 'FINISHED':
      return (<Lobby code={code} />);
    case 'IN_PROGRESS':
      return (<HighCardGame state={state} />);
    case 'LOADING':
      return <Loading />;
    default:
      return <div>Error</div>
  }
};
