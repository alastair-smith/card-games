export const GAME_TYPE = {
  BLOB: "BLOB",
  FOOL: "FOOL",
  HIGH_CARD: "HIGH_CARD",
  SHITHEAD: "SHITHEAD",
  YANIV: "YANIV",
} as const;

export type GameType = keyof typeof GAME_TYPE;
