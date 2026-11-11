import { z } from 'zod';
import { standardPlayingCardSchema } from '~/types/cards';
import { playerNameSchema, userIdSchema } from '~/types/entities';
import { playerColorSchema } from '~/utils/player-color';

export enum GameStage {
  LOBBY = 'LOBBY',
  SWAPPING = 'SWAPPING',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export const gameStageSchema = z.enum(GameStage);

const storedTableCardSlotSchema = z.object({
  faceUpCard: standardPlayingCardSchema.nullable(),
  faceDownCard: standardPlayingCardSchema.nullable(),
});

export const tableCardSlotSchema = z.object({
  faceUpCard: standardPlayingCardSchema.nullable(),
  hasFaceDownCard: z.boolean(),
});

export type TableCardSlot = z.infer<typeof tableCardSlotSchema>;

export const finishingPositionSchema = z.literal([1, 2, 3, 4, 5]);

export type FinishingPosition = z.infer<typeof finishingPositionSchema>;

const playerSchema = z.object({
  id: userIdSchema,
  name: playerNameSchema,
  color: playerColorSchema,
  hand: z.array(standardPlayingCardSchema),
  tableCards: z.array(storedTableCardSlotSchema),
  isSwapConfirmed: z.boolean(),
  finishingPosition: finishingPositionSchema.nullable(),
});

export const gameStateSchema = z.discriminatedUnion('gameStage', [
  z.object({
    gameStage: z.literal(GameStage.LOBBY),
  }),
  z.object({
    gameStage: z.literal(GameStage.SWAPPING),
    players: z.array(playerSchema),
  }),
  z.object({
    gameStage: z.literal(GameStage.IN_PROGRESS),
    players: z.array(playerSchema),
    currentPlayerId: userIdSchema,
  }),
  z.object({
    gameStage: z.literal(GameStage.FINISHED),
    players: z.array(playerSchema),
  }),
]);

export type GameState = z.infer<typeof gameStateSchema>;

export type SwappingState = Extract<
  GameState,
  { gameStage: GameStage.SWAPPING }
>;
export type InProgressState = Extract<
  GameState,
  { gameStage: GameStage.IN_PROGRESS }
>;
export type FinishedState = Extract<
  GameState,
  { gameStage: GameStage.FINISHED }
>;
export type ActiveGameState = SwappingState | InProgressState | FinishedState;

export type Player = z.infer<typeof playerSchema>;
