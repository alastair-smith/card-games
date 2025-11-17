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

export enum PlayerStep {
  DEAL = 'DEAL',
  PLAY_CARDS = 'PLAY_CARDS',
  PICKUP_CARD = 'PICKUP_CARD',
  PROCEED = 'PROCEED',
}

export const playerStepSchema = z.enum(PlayerStep);

export type GamePlayer = Player & {
  isUser: boolean;
};

const validCardSchema = z.union([jokerSchema, standardPlayingCardSchema]);

export type ValidCard = z.infer<typeof validCardSchema>;

const scoreHistorySchema = z.array(
  z.object({
    number: z.number(),
    scoreHalved: z.boolean(),
    round: z.number(),
  }),
);

export type ScoreHistory = z.infer<typeof scoreHistorySchema>;

export const gameStateSchema = z.object({
  players: z.array(
    z.object({
      id: userIdSchema,
      name: playerNameSchema,
      scoreHistory: scoreHistorySchema,
      handSize: z.number(),
      isUser: z.boolean(),
      hasCalledYaniv: z.boolean(),
    }),
  ),
  discard: validCardSchema.nullable(),
  userHand: z.array(validCardSchema),
  currentPlayer: z.object({
    playedCards: z.array(validCardSchema),
    id: userIdSchema,
    name: playerNameSchema,
    isUser: z.boolean(),
    step: playerStepSchema,
  }),
  stage: gameStageSchema,
  loser: userIdSchema.nullable(),
});

export type GameState = z.infer<typeof gameStateSchema>;
