import { z } from 'zod';
import { CANDIDATE_PLAYER_COLORS } from '~/components/ui/color-picker/candidate-colors';

/** The fixed list of colours a player can have, as CSS colour strings. */
export const PLAYER_COLORS = CANDIDATE_PLAYER_COLORS.map(({ value }) => value);

export const DEFAULT_PLAYER_COLOR = PLAYER_COLORS[0] ?? 'hsl(0 70% 50%)';

export const playerColorSchema = z.string();

/**
 * A translucent tint of a player colour for highlighting interactive areas.
 * The colour is lightened first so darker hues (e.g. red) stay visible against
 * the dark felt, then made translucent so content beneath remains legible.
 */
export const playerColorHighlight = (color: string): string =>
  `color-mix(in srgb, color-mix(in srgb, ${color}, white 30%) 55%, transparent)`;

/**
 * Pick a random player colour, preferring one not already taken in the lobby so
 * players are visually distinct. Falls back to the full palette once every colour
 * is in use.
 */
export const getRandomPlayerColor = (takenColors: string[] = []): string => {
  const available = PLAYER_COLORS.filter(
    (color) => !takenColors.includes(color),
  );
  const pool = available.length > 0 ? available : PLAYER_COLORS;
  return pool[Math.floor(Math.random() * pool.length)] ?? DEFAULT_PLAYER_COLOR;
};
