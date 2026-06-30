import { z } from 'zod';

/**
 * Players can choose from these colours to change their colour preference.
 */
export const PLAYER_COLORS = {
  red: { name: 'Red', value: 'hsl(0 70% 50%)' },
  amber: { name: 'Amber', value: 'hsl(42 85% 44%)' },
  lime: { name: 'Lime', value: 'hsl(75 52% 40%)' },
  vermilion: { name: 'Vermilion', value: 'hsl(15 75% 48%)' },
  cyan: { name: 'Cyan', value: 'hsl(190 70% 40%)' },
  indigo: { name: 'Indigo', value: 'hsl(235 62% 52%)' },
  purple: { name: 'Purple', value: 'hsl(275 55% 52%)' },
  green: { name: 'Green', value: 'hsl(140 55% 38%)' },
  rose: { name: 'Rose', value: 'hsl(345 70% 55%)' },
  plum: { name: 'Plum', value: 'hsl(295 55% 50%)' },
  fuchsia: { name: 'Fuchsia', value: 'hsl(328 68% 48%)' },
  brown: { name: 'Brown', value: 'hsl(25 35% 42%)' },
} as const satisfies Record<
  string,
  { name: string; value: `hsl(${number} ${number}% ${number}%)` }
>;

export type PlayerColor = keyof typeof PLAYER_COLORS;

const PLAYER_COLOR_KEYS = Object.keys(PLAYER_COLORS) as [
  PlayerColor,
  ...PlayerColor[],
];

export const playerColorSchema = z.enum(PLAYER_COLOR_KEYS);

export const DEFAULT_PLAYER_COLOR: PlayerColor = 'red';

/** The palette as a list, for rendering the colour picker. */
export const PLAYER_COLOR_OPTIONS = PLAYER_COLOR_KEYS.map((key) => ({
  key,
  ...PLAYER_COLORS[key],
}));

/** Resolve a colour key to its CSS colour string. */
export const playerColorValue = (color: PlayerColor): string =>
  PLAYER_COLORS[color].value;

/**
 * A translucent tint of a player colour for highlighting interactive areas.
 * The colour is lightened first so darker hues (e.g. red) stay visible against
 * the dark felt, then made translucent so content beneath remains legible.
 */
export const playerColorHighlight = (color: PlayerColor): string => {
  const value = PLAYER_COLORS[color].value;
  return `color-mix(in srgb, color-mix(in srgb, ${value}, white 30%) 55%, transparent)`;
};

/**
 * Pick a random player colour, preferring one not already taken in the lobby so
 * players are visually distinct. Falls back to the full palette once every colour
 * is in use.
 */
export const getRandomPlayerColor = (
  takenColors: readonly PlayerColor[] = [],
): PlayerColor => {
  const available = PLAYER_COLOR_KEYS.filter(
    (color) => !takenColors.includes(color),
  );
  const pool = available.length > 0 ? available : PLAYER_COLOR_KEYS;
  return pool[Math.floor(Math.random() * pool.length)] ?? DEFAULT_PLAYER_COLOR;
};
