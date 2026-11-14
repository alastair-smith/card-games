import type { FinishingPosition } from '~/types/games/shithead';

export const FINISHING_POSITIONS = {
  1: { label: '1st', medal: '🥇' },
  2: { label: '2nd', medal: '🥈' },
  3: { label: '3rd', medal: '🥉' },
  4: { label: '4th', medal: null },
  5: { label: '5th', medal: null },
} as const satisfies Record<
  FinishingPosition,
  { label: string; medal: string | null }
>;
