import {
  JOKER_RANK,
  type PictureCardRank,
  type PlayingCardValue,
  pictureCardRank,
  RANK_FULL_NAME,
} from '~/types/cards';
export const isPictureCard = (
  card: PlayingCardValue,
): card is PlayingCardValue & { rank: PictureCardRank } => {
  return pictureCardRank.some(
    (pictureCardRank) => pictureCardRank === card.rank,
  );
};

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Returns a human-readable label for a playing card, e.g. "Ace of Spades" or "Red Joker". */
export function cardAriaLabel(card: PlayingCardValue | null): string {
  if (!card) return 'Facedown card';
  if (card.rank === JOKER_RANK) {
    return `${capitalize(card.suit)} Joker`;
  }
  return `${RANK_FULL_NAME[card.rank]} of ${capitalize(card.suit)}`;
}

export const shuffle = <T>(deck: T[]): T[] => {
  const newDeck = [...deck];

  for (
    let currentIndex = newDeck.length - 1;
    currentIndex > 0;
    currentIndex--
  ) {
    const randomIndex = Math.floor(Math.random() * (currentIndex + 1));

    const currentCard = newDeck[currentIndex];
    const randomCard = newDeck[randomIndex];

    if (currentCard === undefined || randomCard === undefined) {
      throw new Error('Shuffling error: undefined card found');
    }

    [newDeck[currentIndex], newDeck[randomIndex]] = [randomCard, currentCard];
  }

  return newDeck;
};
