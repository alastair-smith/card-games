'use client';

import { context as otelContext, propagation, trace } from '@opentelemetry/api';
import { skipToken } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import YanivGameController from '~/app/yaniv/_components/game-controller';
import Lobby from '~/app/yaniv/_components/lobby';
import { toast } from '~/components/ui/toast';
import type { ClientGameState } from '~/server/state/game/yaniv/get-game-state';
import { setGameAttributes } from '~/telemetry/attributes';
import { recordClientError } from '~/telemetry/errors';
import { api } from '~/trpc/react';
import type { EmojiReactionId, UserId } from '~/types/entities';
import {
  type GameCode,
  GameStatus,
  GameUpdate,
  type Player,
  type ReactionEmoji,
  type SystemEmoji,
} from '~/types/game';
import Loading from './loading';

const clientTracer = trace.getTracer('card-games-web');

function remoteContextFromTraceparent(traceparent: string | undefined) {
  if (!traceparent) return otelContext.active();
  return propagation.extract(otelContext.active(), { traceparent });
}

export default function YanivClient({
  code,
  userId,
}: {
  code: GameCode;
  userId?: UserId;
}) {
  const router = useRouter();

  const [status, setStatus] = useState<GameStatus>(GameStatus.LOADING);
  const [players, setPlayers] = useState<Player[] | null>(null);
  const [gameState, setGameState] = useState<ClientGameState | null>(null);
  const [reactions, setReactions] = useState<
    Record<UserId, { emoji: ReactionEmoji | SystemEmoji; id: EmojiReactionId }>
  >({});

  api.yaniv.state.useSubscription(
    status === GameStatus.FINISHED ? skipToken : { code },
    {
      onStarted: () => {
        console.log(`Subscription to game ${code} started`);
      },
      onData: async (newGameState) => {
        const remoteCtx = remoteContextFromTraceparent(newGameState._trace);
        await clientTracer.startActiveSpan(
          'subscription.receive',
          {},
          remoteCtx,
          async (span) => {
            try {
              await setGameAttributes(span, code, userId);

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

                case GameUpdate.LOBBY_FULL:
                  setStatus(GameStatus.FINISHED);
                  toast.warning('The lobby is full!');
                  router.push('/');
                  return;

                case GameUpdate.LOBBY_UPDATE:
                  setStatus(GameStatus.LOBBY);
                  setPlayers(newGameState.players);
                  return;

                case GameUpdate.GAME_STATE_UPDATE:
                  setStatus(GameStatus.IN_PROGRESS);
                  setGameState(newGameState.state);
                  return;

                case GameUpdate.FINISHED:
                  setGameState(newGameState.state);
                  setStatus(GameStatus.FINISHED);
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
                    new Error(
                      `Unexpected game update type: ${exhaustiveCheck}`,
                    ),
                  );
                  return;
                }
              }
            } finally {
              span.end();
            }
          },
        );
      },
      onError: (error) => {
        recordClientError(error, 'subscription.error');
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

  if (gameState === null) {
    return <Loading />;
  }

  return (
    <YanivGameController
      code={code}
      gameState={gameState}
      reactions={reactions}
    />
  );
}
