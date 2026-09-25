import { z } from 'zod';
import {
  JOKER_RANK,
  jokerSchema,
  Rank,
  standardPlayingCardSchema,
} from '~/types/cards';
import { playerNameSchema, userIdSchema } from '~/types/entities';
import { playerColorSchema } from '~/utils/player-color';

export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 5;
export const HAND_SIZE_OPTIONS = [5, 7] as const;
export const MINIMUM_RUN_SIZE = 3;
export const YANIV_CALL_THRESHOLD = 7;
export const YANIV_CALLER_PENALTY = 25;
export const GAME_OVER_SCORE = 100;

export const yanivPlayingCardSchema = z.union([
  jokerSchema,
  standardPlayingCardSchema,
]);

export type YanivPlayingCard = z.infer<typeof yanivPlayingCardSchema>;

export const handSizeSchema = z.literal(HAND_SIZE_OPTIONS);

export type HandSize = z.infer<typeof handSizeSchema>;

export const DEFAULT_HAND_SIZE: HandSize = 5;

/** Host-chosen settings, picked in the lobby before the game starts. */
export const settingsSchema = z.object({
  handSize: handSizeSchema,
});

export type Settings = z.infer<typeof settingsSchema>;

/** What a new Yaniv lobby starts with. */
export const DEFAULT_SETTINGS: Settings = { handSize: DEFAULT_HAND_SIZE };

export const YANIV_RANK_SCORE = {
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

export const YANIV_RANK_POSITION = {
  [JOKER_RANK]: 0,
  [Rank.ACE]: 1,
  [Rank.TWO]: 2,
  [Rank.THREE]: 3,
  [Rank.FOUR]: 4,
  [Rank.FIVE]: 5,
  [Rank.SIX]: 6,
  [Rank.SEVEN]: 7,
  [Rank.EIGHT]: 8,
  [Rank.NINE]: 9,
  [Rank.TEN]: 10,
  [Rank.JACK]: 11,
  [Rank.QUEEN]: 12,
  [Rank.KING]: 13,
} as const satisfies Record<YanivPlayingCard['rank'], number>;

export enum GameStage {
  LOBBY = 'LOBBY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export const gameStageSchema = z.enum(GameStage);

export enum GameStep {
  PLAY_CARDS = 'PLAY_CARDS',
  PICKUP_CARD = 'PICKUP_CARD',
  PROCEED = 'PROCEED', // end turn, optionally calling yaniv
  REDEAL = 'REDEAL', // only features after yaniv has been called and round is over
}

export const gameStepSchema = z.enum(GameStep);

export enum GameViewStage {
  WAITING_FOR_PLAYER = 'waiting-for-player',
  PICKING_CARDS = 'picking-cards',
  DRAWING_CARDS = 'drawing-cards',
  END_TURN = 'end-turn',
  END_OF_ROUND = 'end-of-round',
  WAITING_FOR_NEW_ROUND = 'waiting-for-new-round',
}

export const roundScoreSchema = z.object({
  original: z.number(),
  adjusted: z.number(),
  halvedBy: z.number(),
});

export type RoundScore = z.infer<typeof roundScoreSchema>;

const playerSchema = z.object({
  id: userIdSchema,
  color: playerColorSchema,
  cardCount: z.number(),
  hand: z.array(yanivPlayingCardSchema),
  isFiftyScoreHalved: z.boolean(),
  isHundredScoreHalved: z.boolean(),
  name: playerNameSchema,
  score: z.number(),
  roundScores: z.array(roundScoreSchema),
  isYanivCalled: z.boolean(),
});

export const gameStateSchema = z.discriminatedUnion('gameStage', [
  z.object({
    gameStage: z.literal(GameStage.LOBBY),
  }),
  z.object({
    gameStage: z.literal(GameStage.IN_PROGRESS),
    gameStep: gameStepSchema,
    handSize: handSizeSchema,
    players: z.array(playerSchema),
    playedCards: z.array(yanivPlayingCardSchema),
    topDiscardCard: yanivPlayingCardSchema.nullable().optional(),
    currentPlayerId: userIdSchema,
    drawnCard: yanivPlayingCardSchema.optional(),
    deckOnlyPickup: z.boolean().optional(),
  }),
  z.object({
    gameStage: z.literal(GameStage.FINISHED),
    players: z.array(playerSchema),
    winners: z.array(userIdSchema),
  }),
]);

export type GameState = z.infer<typeof gameStateSchema>;
