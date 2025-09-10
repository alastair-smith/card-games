'use client';

import { skipToken } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Lobby from '~/app/high-card/[code]/_lobby/lobby';
import { toast } from '~/components/ui/toast';
import { api } from '~/trpc/react';
import {
  type GameCode,
  GameStatus,
  GameUpdate,
  type Player,
} from '~/types/game';
import HighCardGameController from './_game/game-controller';
import Loading from './loading';
import { GameState } from '~/types/games/high-card';

export default function HighCard({ code }: { code: GameCode }) {
  const router = useRouter();

  const [status, setStatus] = useState<GameStatus>(GameStatus.LOADING);
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [state, setState] = useState<GameState | null>(null);

  api.highCard.state.useSubscription(
    status === GameStatus.FINISHED ? skipToken : { code },
    {
      onStarted: () => {
        console.log(`Subscription to game ${code} started`);
      },
      onData: (newGameState) => {
        switch (newGameState.update) {
          case GameUpdate.KICKED:
            setStatus(GameStatus.FINISHED);
            toast.warning('You have been kicked from the game!');
            router.push('/');
            return;

          case GameUpdate.LEFT_GAME:
            setStatus(GameStatus.FINISHED);
            toast.info('You have left the game!');
            router.push('/');
            return;

          case GameUpdate.GAME_NOT_FOUND:
            setStatus(GameStatus.FINISHED);
            toast.warning('This game is not available!');
            router.push('/');
            return;

          case GameUpdate.FINISHED:
            setStatus(GameStatus.FINISHED);
            return;

          case GameUpdate.LOBBY_UPDATE:
            setStatus(GameStatus.LOBBY);
            setPlayers(newGameState.players);
            return;

          case GameUpdate.GAME_STATE_UPDATE:
            setState(newGameState.state);
            return;

          case GameUpdate.LOBBY_FULL:
            setStatus(GameStatus.FINISHED);
            toast.warning('The lobby is full!');
            router.push('/');
            return;

          default: {
            const exhaustiveCheck: never = newGameState;
            console.error(
              new Error(`Unexpected game update type: ${exhaustiveCheck}`),
            );
            return;
          }
        }
      },
      onError: (error) => {
        console.error(error);
      },
    },
  );

  if (status === GameStatus.LOADING || players === null) {
    return <Loading />;
  }

  if (status === GameStatus.LOBBY) {
    return <Lobby code={code} players={players} />;
  }

  return <HighCardGameController code={code} state={state} />;
}
