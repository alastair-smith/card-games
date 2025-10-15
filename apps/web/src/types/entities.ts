import { z } from 'zod';
import type { Branded } from './brand';

export type UserId = Branded<string, 'UserId'>;

const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 12;

export const userIdSchema = z.uuid().transform((value) => value as UserId);

export const playerNameSchema = z
  .string()
  .min(MIN_NAME_LENGTH, `Should have at least ${MIN_NAME_LENGTH} character`)
  .max(MAX_NAME_LENGTH, `Should have up to ${MAX_NAME_LENGTH} characters`)
  .describe('The name of the player');

export type PlayerName = z.infer<typeof playerNameSchema>;
