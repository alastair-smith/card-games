import { z } from 'zod';
import { dataLayer } from '~/server/data/redis';
import { playerNameSchema, userIdSchema } from '~/types/entities';
import { type GameCode, GameType, gameCodeSchema } from '~/types/game';
import { settingsSchema as yanivSettingsSchema } from '~/types/games/yaniv';
import { playerColorSchema } from '~/utils/player-color';

const lobbyFields = {
  code: gameCodeSchema,
  host: userIdSchema,
  players: z.array(
    z.object({
      id: userIdSchema,
      name: playerNameSchema,
      color: playerColorSchema,
      isReady: z.boolean(),
    }),
  ),
};

export const yanivLobbySchema = z.object({
  ...lobbyFields,
  type: z.literal(GameType.YANIV),
  settings: yanivSettingsSchema,
});

export const highCardLobbySchema = z.object({
  ...lobbyFields,
  type: z.literal(GameType.HIGH_CARD),
});

// A game brings its own settings, or none at all
export const lobbySchema = z.discriminatedUnion('type', [
  yanivLobbySchema,
  highCardLobbySchema,
]);

export type Lobby = z.infer<typeof lobbySchema>;

export type YanivLobby = z.infer<typeof yanivLobbySchema>;

export const {
  get: getLobby,
  set: setLobby,
  exists: lobbyExists,
} = dataLayer(({ code }: { code: GameCode }) => `lobby:${code}`, lobbySchema);
