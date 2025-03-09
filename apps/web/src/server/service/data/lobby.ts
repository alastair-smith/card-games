import { type GameCode, gameCodeSchema, GameType, gameTypeSchema } from '@/types/game';
import { z } from 'zod';
import { dataLayer } from '@/server/service/data/redis';
import { playerNameSchema, userIdSchema } from '@/types/entities';

export const { get: getLobbySummary, set: setLobbySummary, exists: lobbyExists } = dataLayer(
  ({ code }: { code: GameCode }) => `lobby:${code}:summary`,
  z.object({
    code: gameCodeSchema,
    type: gameTypeSchema,
  })
);

export const { get: getLobbyPlayers, set: setLobbyPlayers } = dataLayer(
  ({ code }: { code: GameCode }) => `lobby:${code}`,
  z.object({
    host: userIdSchema,
    players: z.array(z.object({
      id: userIdSchema,
      name: playerNameSchema,
      ready: z.boolean()
    }))
  }));
