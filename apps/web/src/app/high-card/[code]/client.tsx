'use client';

import { skipToken } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Lobby from '~/app/high-card/_components/lobby';
import { toast } from '~/components/ui/toast';
import { api } from '~/trpc/react';
import type { EmojiReactionId, UserId } from '~/types/entities';
import {
  type GameCode,
  GameStatus,
  GameUpdate,
  type Player,
  type ReactionEmoji,
} from '~/types/game';
import type { GameState } from '~/types/games/high-card';
import HighCardGameController from '../_components/game-controller';
import Loading from './loading';

export default function HighCard({ code }: { code: GameCode }) {
  const router = useRouter();

  const [status, setStatus] = useState<GameStatus>(GameStatus.LOADING);
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [state, setState] = useState<GameState | null>(null);
  const [reactions, setReactions] = useState<
    Record<UserId, { emoji: ReactionEmoji; id: EmojiReactionId }>
  >({});

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
            toast.warning('You have been removed from the game!');
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
            setState(newGameState.state);
            setStatus(GameStatus.FINISHED);
            return;

          case GameUpdate.LOBBY_UPDATE:
            setStatus(GameStatus.LOBBY);
            setPlayers(newGameState.players);
            return;

          case GameUpdate.GAME_STATE_UPDATE:
            setStatus(GameStatus.IN_PROGRESS);
            setState(newGameState.state);
            return;

          case GameUpdate.LOBBY_FULL:
            setStatus(GameStatus.FINISHED);
            toast.warning('The lobby is full!');
            router.push('/');
            return;

          case GameUpdate.EMOJI_REACTION: {
            const { targetPlayerId, ...reaction } = newGameState.payload;
            setReactions((prev) => ({
              ...prev,
              [targetPlayerId]: reaction,
            }));
            return;
          }

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

  if (status === GameStatus.LOADING) {
    return <Loading />;
  }

  if (status === GameStatus.LOBBY) {
    if (players === null) {
      return <Loading />;
    }
    return <Lobby code={code} players={players} />;
  }

  if (state === null) {
    return <Loading />;
  }

  return (
    <HighCardGameController code={code} state={state} reactions={reactions} />
  );
}
