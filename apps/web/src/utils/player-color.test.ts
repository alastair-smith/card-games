import { describe, expect, test } from 'vitest';
import {
  DEFAULT_PLAYER_COLOR,
  getRandomPlayerColor,
  PLAYER_COLOR_OPTIONS,
  PLAYER_COLORS,
  type PlayerColor,
  playerColorHighlight,
  playerColorSchema,
  playerColorValue,
} from './player-color';

const ALL_KEYS = PLAYER_COLOR_OPTIONS.map((option) => option.key);

describe('playerColorValue', () => {
  test('resolves a colour key to its CSS value', () => {
    expect(playerColorValue('red')).toBe(PLAYER_COLORS.red.value);
  });
});

describe('playerColorHighlight', () => {
  test('builds a translucent tint from the colour value', () => {
    const highlight = playerColorHighlight('red');
    expect(highlight).toContain(PLAYER_COLORS.red.value);
    expect(highlight).toContain('color-mix');
    expect(highlight).toContain('transparent');
  });
});

describe('playerColorSchema', () => {
  test('accepts a known colour key', () => {
    expect(playerColorSchema.parse('cyan')).toBe('cyan');
  });

  test('rejects a value outside the palette', () => {
    expect(() => playerColorSchema.parse('hsl(210 70% 48%)')).toThrow();
    expect(() => playerColorSchema.parse('turquoise')).toThrow();
  });
});

describe('getRandomPlayerColor', () => {
  test('always returns a colour from the palette', () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      expect(ALL_KEYS).toContain(getRandomPlayerColor());
    }
  });

  test('avoids colours already taken in the lobby', () => {
    const taken = ALL_KEYS.filter((key) => key !== 'brown');
    for (let attempt = 0; attempt < 50; attempt++) {
      expect(getRandomPlayerColor(taken)).toBe('brown');
    }
  });

  test('never repeats a taken colour while options remain', () => {
    const taken: PlayerColor[] = ['red', 'cyan', 'green'];
    for (let attempt = 0; attempt < 50; attempt++) {
      expect(taken).not.toContain(getRandomPlayerColor(taken));
    }
  });

  test('falls back to the full palette once every colour is taken', () => {
    for (let attempt = 0; attempt < 50; attempt++) {
      expect(ALL_KEYS).toContain(getRandomPlayerColor(ALL_KEYS));
    }
  });
});

describe('DEFAULT_PLAYER_COLOR', () => {
  test('is a colour from the palette', () => {
    expect(ALL_KEYS).toContain(DEFAULT_PLAYER_COLOR);
  });
});
