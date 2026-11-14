'use client';

import { context as otelContext, propagation, trace } from '@opentelemetry/api';
import { skipToken } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Lobby from '~/app/shithead/_components/lobby';
import { toast } from '~/components/ui/toast';
import { setGameAttributes } from '~/telemetry/attributes';
import { recordClientError } from '~/telemetry/errors';
import { api } from '~/trpc/react';
import type { UserId } from '~/types/entities';
import {
  type GameCode,
  GameStatus,
  GameUpdate,
  type Player,
} from '~/types/game';
import Loading from './loading';

const clientTracer = trace.getTracer('card-games-web');

function remoteContextFromTraceparent(traceparent: string | undefined) {
  if (!traceparent) return otelContext.active();
  return propagation.extract(otelContext.active(), { traceparent });
}

export default function ShitheadClient({
  code,
  userId,
}: {
  code: GameCode;
  userId: UserId | undefined;
}) {
  const router = useRouter();

  const [status, setStatus] = useState<GameStatus>(GameStatus.LOADING);
  const [players, setPlayers] = useState<Player[] | null>(null);

  const leaveWithMessage = (showMessage: () => void) => {
    setStatus(GameStatus.FINISHED);
    showMessage();
    router.push('/');
  };

  api.shithead.state.useSubscription(
    status === GameStatus.FINISHED ? skipToken : { code },
    {
      onData: (update) => {
        const remoteCtx = remoteContextFromTraceparent(update._trace);
        clientTracer.startActiveSpan(
          'subscription.receive',
          {},
          remoteCtx,
          (span) => {
            try {
              switch (update.update) {
                case GameUpdate.KICKED:
                  leaveWithMessage(() =>
                    toast.warning('You have been removed from the game!'),
                  );
                  return;

                case GameUpdate.LEFT_GAME:
                  leaveWithMessage(() => toast.info('You have left the game!'));
                  return;

                case GameUpdate.GAME_NOT_FOUND:
                  leaveWithMessage(() =>
                    toast.warning('This game is not available!'),
                  );
                  return;

                case GameUpdate.LOBBY_FULL:
                  leaveWithMessage(() => toast.warning('The lobby is full!'));
                  return;

                case GameUpdate.LOBBY_UPDATE:
                  setStatus(GameStatus.LOBBY);
                  setPlayers(update.players);
                  return;

                default: {
                  const exhaustiveCheck: never = update;
                  console.error(
                    new Error(
                      `Unexpected game update type: ${exhaustiveCheck}`,
                    ),
                  );
                  return;
                }
              }
            } finally {
              void setGameAttributes(span, code, userId)
                .catch((error: unknown) => {
                  recordClientError(error, 'subscription.attributes.error');
                  console.error(error);
                })
                .finally(() => span.end());
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

  if (status !== GameStatus.LOBBY || players === null) {
    return <Loading />;
  }

  return <Lobby code={code} players={players} />;
}
