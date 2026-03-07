import { z } from 'zod';
import {
  JOKER_RANK,
  jokerSchema,
  Rank,
  standardPlayingCardSchema,
} from '~/types/cards';
import { playerNameSchema, userIdSchema } from '~/types/entities';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;

export const yanivPlayingCardSchema = z.union([
  jokerSchema,
  standardPlayingCardSchema,
]);

export type YanivPlayingCard = z.infer<typeof yanivPlayingCardSchema>;

export const YANIV_RANK_VALUE = {
  [Rank.TWO]: 2,
  [Rank.THREE]: 3,
  [Rank.FOUR]: 4,
  [Rank.FIVE]: 5,
  [Rank.SIX]: 6,
  [Rank.SEVEN]: 7,
  [Rank.EIGHT]: 8,
  [Rank.NINE]: 9,
  [Rank.TEN]: 10,
  [Rank.JACK]: 10,
  [Rank.QUEEN]: 10,
  [Rank.KING]: 10,
  [Rank.ACE]: 1,
  [JOKER_RANK]: 0,
} as const satisfies Record<YanivPlayingCard['rank'], number>;

export enum GameStage {
  LOBBY = 'LOBBY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export const gameStageSchema = z.enum(GameStage);

export enum GameStep {
  INITIAL_DEAL = 'INITIAL_DEAL',
  PLAY_CARDS = 'PLAY_CARDS',
  PICKUP_CARD = 'PICKUP_CARD',
  PROCEED = 'PROCEED',
  REDEAL = 'REDEAL',
}

export const gameStepSchema = z.enum(GameStep);

const playerSchema = z.object({
  id: userIdSchema,
  cardCount: z.number(),
  isFiftyScoreHalved: z.boolean(),
  isHundredScoreHalved: z.boolean(),
  name: playerNameSchema,
  score: z.number(),
  isYanivCalled: z.boolean(),
});

export const gameStateSchema = z.discriminatedUnion('gameStage', [
  z.object({
    gameStage: z.literal(GameStage.LOBBY),
  }),
  z.object({
    gameStage: z.literal(GameStage.IN_PROGRESS),
    gameStep: gameStepSchema,
    players: z.array(playerSchema),
    playedCards: z.array(yanivPlayingCardSchema),
    currentPlayerId: userIdSchema,
    hands: z.record(userIdSchema, z.array(yanivPlayingCardSchema)),
  }),
  z.object({
    gameStage: z.literal(GameStage.FINISHED),
    players: z.array(playerSchema),
    winners: z.array(userIdSchema),
    hands: z.record(userIdSchema, z.array(yanivPlayingCardSchema)),
  }),
]);
