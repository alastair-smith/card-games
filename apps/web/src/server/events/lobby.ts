import type { z } from 'zod';
import { lobbySchema } from '~/server/data/lobby';
import type { GameCode } from '~/types/game';
import emitter from './emitter';

export const getLobbyChannel = (
  code: GameCode | '*',
): `lobby:${GameCode | '*'}` => `lobby:${code}`;

export const publishLobbyState = async (
  code: GameCode,
  state: z.infer<typeof lobbySchema>,
) => {
  const validatedState = lobbySchema.parse(state);

  emitter.emit(getLobbyChannel(code), validatedState);
};
