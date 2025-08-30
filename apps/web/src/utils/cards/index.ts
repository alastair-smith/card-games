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
