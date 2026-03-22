import {
  type PictureCardRank,
  type PlayingCardValue,
  pictureCardRank,
} from '~/types/cards';
export const isPictureCard = (
  card: PlayingCardValue,
): card is PlayingCardValue & { rank: PictureCardRank } => {
  return pictureCardRank.some(
    (pictureCardRank) => pictureCardRank === card.rank,
  );
};

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
