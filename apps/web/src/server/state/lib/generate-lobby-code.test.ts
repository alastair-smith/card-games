import { describe, expect, test } from 'vitest';
import { GAME_CODE_CHARSET, GAME_CODE_LENGTH } from '~/types/game';
import { generateLobbyCode } from './generate-lobby-code';

describe('generateLobbyCode', () => {
  test('generates a code of the correct length', () => {
    const code = generateLobbyCode();
    expect(code).toHaveLength(GAME_CODE_LENGTH);
  });

  test('generates a code using only valid charset characters', () => {
    const code = generateLobbyCode();
    for (const char of code) {
      expect(GAME_CODE_CHARSET).toContain(char);
    }
  });

  test('generates different codes on successive calls', () => {
    const codes = new Set(
      Array.from({ length: 20 }, () => generateLobbyCode()),
    );
    expect(codes.size).toBeGreaterThan(1);
  });
});
