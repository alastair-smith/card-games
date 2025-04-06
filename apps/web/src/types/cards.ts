export enum Suit {
  clubs = 'clubs',
  diamonds = 'diamonds',
  hearts = 'hearts',
  spades = 'spades'
};

export const suitSymbol = {
  [Suit.clubs]: '♣️',
  [Suit.diamonds]: '♦️',
  [Suit.hearts]: '♥️',
  [Suit.spades]: '♠️'
} as const satisfies Record<Suit, string>;

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export const ranks: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export type Joker = {
  suit: 'black' | 'red';
  rank: 'Joker';
};

export type Card = {
  suit: Suit;
  rank: Rank;
} | Joker;
