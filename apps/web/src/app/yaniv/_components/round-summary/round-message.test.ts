import { describe, expect, test } from 'vitest';
import { buildClientPlayer, buildRoundScore } from '~/test-utils/yaniv';
import type { PlayerName, UserId } from '~/types/entities';
import { getRoundMessage } from './round-message';

const USER_ID = '1' as UserId;

const buildPlayer = (id: string, name: string, points: number[]) =>
  buildClientPlayer({
    id: id as UserId,
    name: name as PlayerName,
    roundScores: points.map((point) => buildRoundScore({ original: point })),
  });

describe('getRoundMessage', () => {
  describe('round winner', () => {
    test('names the player who scored the fewest points', () => {
      const players = [
        buildPlayer('1', 'Alice', [12]),
        buildPlayer('2', 'Bob', [0]),
        buildPlayer('3', 'Charlie', [8]),
      ];
      expect(getRoundMessage(players, USER_ID)).toBe('Bob won the round!');
    });

    test('says you won when the current user scored the fewest points', () => {
      const players = [
        buildPlayer('1', 'Alice', [0]),
        buildPlayer('2', 'Bob', [9]),
      ];
      expect(getRoundMessage(players, USER_ID)).toBe('You won the round!');
    });

    test('names every player tied for the fewest points', () => {
      const players = [
        buildPlayer('1', 'Alice', [9]),
        buildPlayer('2', 'Bob', [0]),
        buildPlayer('3', 'Charlie', [0]),
      ];
      expect(getRoundMessage(players, USER_ID)).toBe(
        'Bob & Charlie won the round!',
      );
    });

    test('includes you when the current user tied for the fewest points', () => {
      const players = [
        buildPlayer('1', 'Alice', [0]),
        buildPlayer('2', 'Bob', [0]),
      ];
      expect(getRoundMessage(players, USER_ID)).toBe(
        'You & Bob won the round!',
      );
    });

    test('only considers the latest round', () => {
      const players = [
        buildPlayer('1', 'Alice', [0, 14]),
        buildPlayer('2', 'Bob', [20, 0]),
      ];
      expect(getRoundMessage(players, USER_ID)).toBe('Bob won the round!');
    });
  });
});
