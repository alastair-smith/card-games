import { describe, expect, test } from 'vitest';
import { buildPlayer } from '~/test-utils/shithead';
import type { UserId } from '~/types/entities';
import { GameStage, gameStateSchema } from './shithead';

const FIRST_PLAYER_ID = '3f2b8c1e-7a4d-4e9b-9c6f-1d2e3a4b5c6d' as UserId;
const LAST_PLAYER_ID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d' as UserId;

describe('gameStateSchema', () => {
  describe('finished game', () => {
    test('accepts a game where every player has a finishing position', () => {
      const result = gameStateSchema.safeParse({
        gameStage: GameStage.FINISHED,
        players: [
          buildPlayer({ id: FIRST_PLAYER_ID, finishingPosition: 1 }),
          buildPlayer({ id: LAST_PLAYER_ID, finishingPosition: 2 }),
        ],
      });

      expect(result.success).toBe(true);
    });

    test('rejects a game where a player has no finishing position', () => {
      const result = gameStateSchema.safeParse({
        gameStage: GameStage.FINISHED,
        players: [
          buildPlayer({ id: FIRST_PLAYER_ID, finishingPosition: 1 }),
          buildPlayer({ id: LAST_PLAYER_ID, finishingPosition: null }),
        ],
      });

      expect(result.success).toBe(false);
    });
  });
});
