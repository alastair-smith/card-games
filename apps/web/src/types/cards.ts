import { z } from 'zod';

/* [---------------- Suits ----------------] */

export enum Suit {
  CLUBS = 'clubs',
  DIAMONDS = 'diamonds',
  HEARTS = 'hearts',
  SPADES = 'spades',
}

export const SUITS = [
  Suit.CLUBS,
  Suit.DIAMONDS,
  Suit.HEARTS,
  Suit.SPADES,
] as const satisfies Suit[];

export const suitSchema = z.enum(Suit);

export enum JokerSuit {
  RED = 'red',
  BLACK = 'black',
}

export const JOKER_SUITS = [
  JokerSuit.RED,
  JokerSuit.BLACK,
] as const satisfies JokerSuit[];

export const jokerSuitSchema = z.enum(JokerSuit);

export const suitColor = {
  [Suit.SPADES]: '#12212E',
  [Suit.HEARTS]: '#ff0000',
  [Suit.DIAMONDS]: '#ff0000',
  [Suit.CLUBS]: '#12212E',
} as const satisfies Record<Suit, string>;

/* [---------------- Ranks ----------------] */

export enum Rank {
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
  SIX = 6,
  SEVEN = 7,
  EIGHT = 8,
  NINE = 9,
  TEN = 10,
  JACK = 11,
  QUEEN = 12,
  KING = 13,
  ACE = 14,
}

export const RANK_DISPLAY = {
  [Rank.TWO]: '2',
  [Rank.THREE]: '3',
  [Rank.FOUR]: '4',
  [Rank.FIVE]: '5',
  [Rank.SIX]: '6',
  [Rank.SEVEN]: '7',
  [Rank.EIGHT]: '8',
  [Rank.NINE]: '9',
  [Rank.TEN]: '10',
  [Rank.JACK]: 'J',
  [Rank.QUEEN]: 'Q',
  [Rank.KING]: 'K',
  [Rank.ACE]: 'A',
} as const satisfies Record<Rank, string>;

export const RANK_FULL_NAME = {
  [Rank.TWO]: 'Two',
  [Rank.THREE]: 'Three',
  [Rank.FOUR]: 'Four',
  [Rank.FIVE]: 'Five',
  [Rank.SIX]: 'Six',
  [Rank.SEVEN]: 'Seven',
  [Rank.EIGHT]: 'Eight',
  [Rank.NINE]: 'Nine',
  [Rank.TEN]: 'Ten',
  [Rank.JACK]: 'Jack',
  [Rank.QUEEN]: 'Queen',
  [Rank.KING]: 'King',
  [Rank.ACE]: 'Ace',
};

export const rankSchema = z.enum(Rank);

export const RANKS = [
  Rank.TWO,
  Rank.THREE,
  Rank.FOUR,
  Rank.FIVE,
  Rank.SIX,
  Rank.SEVEN,
  Rank.EIGHT,
  Rank.NINE,
  Rank.TEN,
  Rank.JACK,
  Rank.QUEEN,
  Rank.KING,
  Rank.ACE,
] as const satisfies Rank[];

export const pictureCardRank = [
  Rank.JACK,
  Rank.QUEEN,
  Rank.KING,
  Rank.ACE,
] as const satisfies Rank[];

export type PictureCardRank = (typeof pictureCardRank)[number];

export const numberCardRank = [
  Rank.TWO,
  Rank.THREE,
  Rank.FOUR,
  Rank.FIVE,
  Rank.SIX,
  Rank.SEVEN,
  Rank.EIGHT,
  Rank.NINE,
  Rank.TEN,
] as const satisfies Rank[];

export type NumberCardRank = (typeof numberCardRank)[number];

export const JOKER_RANK = 'JOKER';

export const jokerRankSchema = z.literal(JOKER_RANK);

export type JokerRank = z.infer<typeof jokerRankSchema>;

/* [---------------- Cards ----------------] */

export const standardPlayingCardSchema = z.object({
  suit: suitSchema,
  rank: rankSchema,
});

export type StandardPlayingCard = z.infer<typeof standardPlayingCardSchema>;

export const JokerSchema = z.object({
  suit: jokerSuitSchema,
  rank: jokerRankSchema,
});

export type Joker = z.infer<typeof JokerSchema>;

export const playingCardValueSchema = z.union([
  standardPlayingCardSchema,
  JokerSchema,
]);

export type PlayingCardValue = z.infer<typeof playingCardValueSchema>;

/* [---------------- Decks ----------------] */

export const standardDeck = SUITS.flatMap((suit) =>
  RANKS.map((rank) => ({
    suit,
    rank,
  })),
);
export type StandardDeck = typeof standardDeck;

export const deckWithJokers = [
  ...standardDeck,
  { suit: JokerSuit.RED, rank: JOKER_RANK },
  { suit: JokerSuit.BLACK, rank: JOKER_RANK },
];
export type DeckWithJokers = typeof deckWithJokers;
