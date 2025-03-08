export enum GameType {
  HIGH_CARD = 'HIGH_CARD',
  BLOB = 'BLOB',
  SHITHEAD = 'SHITHEAD',
  FOOL = 'FOOL',
  YANIV = 'YANIV',
};

export const gameURL = {
  HIGH_CARD: '/high-card',
  BLOB: '/blob',
  SHITHEAD: '/shithead',
  FOOL: '/fool',
  YANIV: '/yaniv',
} as const satisfies Record<GameType, string>;

export const gameDisplayName = {
  HIGH_CARD: 'High Card',
  BLOB: 'Blob',
  SHITHEAD: 'Shithead',
  FOOL: 'Fool',
  YANIV: 'Yaniv',
} as const satisfies Record<GameType, string>;
