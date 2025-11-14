import { z } from 'zod';
import type { Player } from '~/server/data/high-card';
import { playerNameSchema, userIdSchema } from '~/types/entities';
import { jokerSchema, standardPlayingCardSchema } from '../cards';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;

export enum GameStage {
  LOBBY = 'LOBBY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export const gameStageSchema = z.enum(GameStage);

export type GamePlayer = Player & {
  isUser: boolean;
};

const validCardSchema = z.union([jokerSchema, standardPlayingCardSchema]);

export const gameStateSchema = z.object({
  players: z.array(
    z.object({
      id: userIdSchema,
      name: playerNameSchema,
      scoreHistory: z.array(z.number()),
      handSize: z.number(),
      isUser: z.boolean(),
      hasCalledYaniv: z.boolean(),
      isCurrentTurn: z.boolean(),
    }),
  ),
  discard: validCardSchema,
  userPlayerHand: z.array(validCardSchema),
  currentPlayer: z.object({
    playedCards: z.array(validCardSchema).nullable,
    id: userIdSchema,
    name: playerNameSchema,
    isUser: z.boolean(),
  }).nullable,
  stage: gameStageSchema,
  loser: userIdSchema,
});

export type GameState = z.infer<typeof gameStateSchema>;
