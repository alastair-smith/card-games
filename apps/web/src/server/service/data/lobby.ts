import { type GameCode, GameType } from '@/types/game';
import { z } from 'zod';
import { GAME_CODE_LENGTH } from '../state/game/high-card';
import { dataLayer } from './redis';


export const { get: getLobby, set: setLobby } = dataLayer(
  ({ code }: { code: GameCode }) => `lobby:${code}`,
  z.object({
    code: z.string().length(GAME_CODE_LENGTH),
    type: z.nativeEnum(GameType),
  })
);