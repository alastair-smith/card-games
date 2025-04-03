import { z } from "zod";
import { Branded } from "./brand";

export enum GameType {
  HIGH_CARD = 'HIGH_CARD',
  BLOB = 'BLOB',
  SHITHEAD = 'SHITHEAD',
  FOOL = 'FOOL',
  YANIV = 'YANIV',
};

export const gameTypeSchema = z.nativeEnum(GameType);

export const gameURL = {
  HIGH_CARD: '/high-card',
  BLOB: '/blob',
  SHITHEAD: '/shithead',
  FOOL: '/fool',
  YANIV: '/yaniv',
} as const satisfies Record<GameType, string>;

export const gameDisplayName = {
  HIGH_CARD: 'High Card',
  BLOB: 'Blob',
  SHITHEAD: 'Shithead',
  FOOL: 'Fool',
  YANIV: 'Yaniv',
} as const satisfies Record<GameType, string>;

export type GameCode = Branded<string, 'GameCode'>;

export const GAME_CODE_LENGTH = 6;

export const gameCodeSchema = z.string()
  .trim()
  .length(GAME_CODE_LENGTH, `Code should be ${GAME_CODE_LENGTH} characters long.`)
  .toUpperCase()
  .regex(/^[A-NP-Z1-9]*$/, 'Code should only contain alphanumeric characters.')
  .transform((code: string) => code as GameCode);
