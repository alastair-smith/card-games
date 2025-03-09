import { type GameCode, gameCodeSchema, GameType, gameTypeSchema } from '@/types/game';
import { z } from 'zod';
import { dataLayer } from '@/server/service/data/redis';
import { userIdSchema } from '@/types/entities';

export const { get: getLobby, set: setLobby, exists: lobbyExists } = dataLayer(
  ({ code }: { code: GameCode }) => `lobby:${code}`,
  z.object({
    code: gameCodeSchema,
    type: gameTypeSchema,
    host: userIdSchema,
  })
);
