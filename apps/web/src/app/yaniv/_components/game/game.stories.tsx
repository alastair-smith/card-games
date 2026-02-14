import { action } from '@ladle/react';
import { Rank, Suit } from '~/types/cards';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import Game from '.';

export default {
  title: 'Yaniv / Game',
};

const defaultProps: React.ComponentProps<typeof Game> = {
  onEmojiClick: action('Emoji clicked'),
  onEndTurnClick: action('End turn clicked'),
  onYanivClick: action('Yaniv clicked'),
  onPlayCards: action('Play cards clicked'),
  stage: 'picking-cards',
  players: [
    {
      id: '1' as UserId,
      cardCount: 7,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Kevin' as PlayerName,
      score: 3,
      isYanivCalled: false,
    },
    {
      id: '2' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: true,
      isHundredScoreHalved: false,
      name: Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
        '',
      ) as PlayerName,
      score: 0,
      isYanivCalled: false,
    },
    {
      id: '3' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Paul' as PlayerName,
      score: 0,
      isYanivCalled: true,
    },
    {
      id: '4' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Viola' as PlayerName,
      score: 0,
      isYanivCalled: false,
    },
    {
      id: '5' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Duncan' as PlayerName,
      score: 0,
      isYanivCalled: false,
    },
    {
      id: '6' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Kathy' as PlayerName,
      score: 0,
      isYanivCalled: false,
    },
  ],
  cards: [
    {
      suit: Suit.CLUBS,
      rank: Rank.ACE,
    },
    {
      suit: Suit.HEARTS,
      rank: Rank.KING,
    },
    {
      suit: Suit.SPADES,
      rank: Rank.QUEEN,
    },
    {
      suit: Suit.DIAMONDS,
      rank: Rank.JACK,
    },
    {
      suit: Suit.CLUBS,
      rank: Rank.TEN,
    },
    {
      suit: Suit.HEARTS,
      rank: Rank.NINE,
    },
    {
      suit: Suit.SPADES,
      rank: Rank.EIGHT,
    },
  ],
  userId: '1' as UserId,
  playedCards: [
    {
      suit: Suit.HEARTS,
      rank: Rank.SEVEN,
    },
    {
      suit: Suit.DIAMONDS,
      rank: Rank.SEVEN,
    },
    {
      suit: Suit.SPADES,
      rank: Rank.SEVEN,
    },
  ],
  discardCard: {
    suit: Suit.CLUBS,
    rank: Rank.FOUR,
  },
};

const limitPlayers = (numberOfPlayers: number) => {
  const props = {
    ...defaultProps,
    players: defaultProps.players.slice(0, numberOfPlayers),
  };
  return () => <Game {...props} />;
};

export const SixPlayers = limitPlayers(6);
export const FivePlayers = limitPlayers(5);
export const FourPlayers = limitPlayers(4);
export const ThreePlayers = limitPlayers(3);
export const TwoPlayers = limitPlayers(2);

export const OtherPlayerTurn = () => (
  <Game
    {...defaultProps}
    playerTakingTurn={'Paul' as PlayerName}
    stage='waiting-for-player'
  />
);

export const EndTurn = () => <Game {...defaultProps} stage='end-turn' />;

export const BigHandPlayed = () => (
  <Game
    {...defaultProps}
    playedCards={[
      { suit: Suit.SPADES, rank: Rank.TWO },
      { suit: Suit.SPADES, rank: Rank.THREE },
      { suit: Suit.SPADES, rank: Rank.FOUR },
      { suit: Suit.SPADES, rank: Rank.FIVE },
      { suit: Suit.SPADES, rank: Rank.SIX },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
      { suit: Suit.SPADES, rank: Rank.EIGHT },
    ]}
  />
);
