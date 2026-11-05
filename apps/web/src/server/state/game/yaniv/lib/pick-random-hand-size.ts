import type { HandSize, HandSizeRange } from '~/types/games/yaniv';

/** Picks a hand size within the range, both ends included. */
export const pickRandomHandSize = ({ min, max }: HandSizeRange): HandSize =>
  min + Math.floor(Math.random() * (max - min + 1));
