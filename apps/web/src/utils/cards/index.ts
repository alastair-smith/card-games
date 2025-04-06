import { JOKER_RANK, JokerRank, pictureCardRank, PictureCardRank, PlayingCardValue, Rank, Suit } from "@/types/cards";

export const isPictureCard = (card: PlayingCardValue): card is PlayingCardValue & { rank: PictureCardRank } => {
  return pictureCardRank.some((pictureCardRank) => pictureCardRank === card.rank);
}
