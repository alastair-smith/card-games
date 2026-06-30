import { z } from 'zod';
import { dataLayer } from '~/server/data/redis';
import { playerNameSchema, userIdSchema } from '~/types/entities';
import { type GameCode, gameCodeSchema, gameTypeSchema } from '~/types/game';
import { playerColorSchema } from '~/utils/player-color';

export const lobbySchema = z.object({
  code: gameCodeSchema,
  type: gameTypeSchema,
  host: userIdSchema,
  players: z.array(
    z.object({
      id: userIdSchema,
      name: playerNameSchema,
      color: playerColorSchema,
      isReady: z.boolean(),
    }),
  ),
});

export type Lobby = z.infer<typeof lobbySchema>;

export const {
  get: getLobby,
  set: setLobby,
  exists: lobbyExists,
} = dataLayer(({ code }: { code: GameCode }) => `lobby:${code}`, lobbySchema);
