import { action } from '@ladle/react';
import { useState } from 'react';
import { Rank, Suit } from '~/types/cards';
import {
  type EmojiReactionId,
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import { GameViewStage } from '~/types/games/yaniv';
import Game from '.';

export default {
  title: 'Yaniv / Game',
};

const defaultProps: React.ComponentProps<typeof Game> = {
  onEmojiClick: action('Emoji clicked'),
  onEndTurnClick: action('End turn clicked'),
  onYanivClick: action('Yaniv clicked'),
  onPlayCards: action('Play cards clicked'),
  stage: GameViewStage.PICKING_CARDS,
  players: [
    {
      id: '1' as UserId,
      cardCount: 7,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Kevin' as PlayerName,
      score: 0,
      roundScore: { original: 5, adjusted: 0 },
      isYanivCalled: false,
      isPlayersTurn: true,
    },
    {
      id: '2' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: true,
      isHundredScoreHalved: false,
      name: Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
        '',
      ) as PlayerName,
      score: 12,
      roundScore: { original: 12, adjusted: 12 },
      isYanivCalled: false,
    },
    {
      id: '3' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Paul' as PlayerName,
      score: 14,
      roundScore: { original: 7, adjusted: 25 },
      isYanivCalled: true,
    },
    {
      id: '4' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Viola' as PlayerName,
      score: 0,
      roundScore: { original: 4, adjusted: 4 },
      isYanivCalled: false,
    },
    {
      id: '5' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Duncan' as PlayerName,
      score: 0,
      roundScore: { original: 13, adjusted: 13 },
      isYanivCalled: false,
    },
    {
      id: '6' as UserId,
      cardCount: 0,
      isFiftyScoreHalved: false,
      isHundredScoreHalved: false,
      name: 'Kathy' as PlayerName,
      score: 0,
      roundScore: { original: 10, adjusted: 10 },
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
    players={defaultProps.players.map((player, i) => {
      if (i === 0) {
        return { ...player, isPlayersTurn: false };
      }
      if (i === 2) {
        return { ...player, isPlayersTurn: true };
      }
      return player;
    })}
    stage={GameViewStage.WAITING_FOR_PLAYER}
  />
);

export const PickupCard = () => (
  <Game {...defaultProps} stage={GameViewStage.DRAWING_CARDS} />
);

export const EndTurn = () => (
  <Game {...defaultProps} stage={GameViewStage.END_TURN} />
);

export const SingleCardPlayed = () => (
  <Game
    {...defaultProps}
    playedCards={[{ suit: Suit.DIAMONDS, rank: Rank.NINE }]}
  />
);

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

export const EndOfRound = () => (
  <Game {...defaultProps} stage={GameViewStage.END_OF_ROUND} />
);

export const EmojiReaction = () => {
  const [players, setPlayers] = useState(defaultProps.players);

  return (
    <Game
      {...defaultProps}
      players={players}
      onEmojiClick={(emoji) => {
        setPlayers((prevPlayers) =>
          prevPlayers.map((player, i) =>
            i === 0
              ? {
                  ...player,
                  emojiReaction: {
                    emoji: emoji,
                    id: crypto.randomUUID() as EmojiReactionId,
                  },
                }
              : player,
          ),
        );
      }}
    />
  );
};

export const CallYaniv = () => {
  const [players, setPlayers] = useState(defaultProps.players);

  const handleYaniv = () => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player, i) =>
        i === 0 ? { ...player, isYanivCalled: true } : player,
      ),
    );
  };

  return (
    <Game
      {...defaultProps}
      players={players}
      stage={GameViewStage.END_TURN}
      onYanivClick={handleYaniv}
    />
  );
};
