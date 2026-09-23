import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { buildClientPlayer } from '~/test-utils/yaniv';
import { Rank, Suit } from '~/types/cards';
import {
  type EmojiReactionId,
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import { DEFAULT_HAND_SIZE, GameViewStage } from '~/types/games/yaniv';
import Game from '.';

type GameProps = React.ComponentProps<typeof Game>;

const roundScore = (
  original: number,
  adjusted = original,
  isScoreHalved = false,
) => ({ original, adjusted, isScoreHalved });

const players: GameProps['players'] = [
  {
    ...buildClientPlayer({
      id: '1' as UserId,
      color: 'red',
      cardCount: 7,
      name: 'Kevin' as PlayerName,
      score: 9,
      roundScores: [roundScore(9), roundScore(5, 0)],
    }),
    isPlayersTurn: true,
  },
  buildClientPlayer({
    id: '2' as UserId,
    isFiftyScoreHalved: true,
    name: Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
      '',
    ) as PlayerName,
    score: 25,
    roundScores: [roundScore(38), roundScore(12, 12, true)],
  }),
  buildClientPlayer({
    id: '3' as UserId,
    color: 'purple',
    name: 'Paul' as PlayerName,
    score: 36,
    roundScores: [roundScore(11), roundScore(7, 25)],
    isYanivCalled: true,
  }),
  buildClientPlayer({
    id: '4' as UserId,
    color: 'green',
    name: 'Viola' as PlayerName,
    score: 10,
    roundScores: [roundScore(6), roundScore(4)],
  }),
  buildClientPlayer({
    id: '5' as UserId,
    color: 'indigo',
    name: 'Duncan' as PlayerName,
    score: 13,
    roundScores: [roundScore(2, 0), roundScore(13)],
  }),
  buildClientPlayer({
    id: '6' as UserId,
    color: 'fuchsia',
    name: 'Kathy' as PlayerName,
    score: 25,
    roundScores: [roundScore(15), roundScore(10)],
  }),
];

const meta = {
  title: 'Yaniv / Game',
  component: Game,
  parameters: { isFullScreen: true },
  args: {
    onEmojiClick: fn(),
    onEndTurnClick: fn(),
    onYanivClick: fn(),
    onPlayCards: fn(),
    stage: GameViewStage.PICKING_CARDS,
    handSize: DEFAULT_HAND_SIZE,
    players,
    cards: [
      { suit: Suit.CLUBS, rank: Rank.ACE },
      { suit: Suit.HEARTS, rank: Rank.KING },
      { suit: Suit.SPADES, rank: Rank.QUEEN },
      { suit: Suit.DIAMONDS, rank: Rank.JACK },
      { suit: Suit.CLUBS, rank: Rank.TEN },
      { suit: Suit.HEARTS, rank: Rank.NINE },
      { suit: Suit.SPADES, rank: Rank.EIGHT },
    ],
    userId: '1' as UserId,
    playedCards: [
      { suit: Suit.HEARTS, rank: Rank.SEVEN },
      { suit: Suit.DIAMONDS, rank: Rank.SEVEN },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
    ],
    discardCard: { suit: Suit.CLUBS, rank: Rank.FOUR },
  },
  argTypes: {
    stage: { control: 'select', options: Object.values(GameViewStage) },
    handSize: { control: 'inline-radio', options: [5, 7] },
  },
} satisfies Meta<typeof Game>;

export default meta;

type Story = StoryObj<typeof meta>;

const withPlayerCount = (numberOfPlayers: number): Story => ({
  args: { players: players.slice(0, numberOfPlayers) },
});

export const SixPlayers: Story = withPlayerCount(6);
export const FivePlayers: Story = withPlayerCount(5);
export const FourPlayers: Story = withPlayerCount(4);
export const ThreePlayers: Story = withPlayerCount(3);
export const TwoPlayers: Story = withPlayerCount(2);

export const OtherPlayerTurn: Story = {
  args: {
    players: players.map((player, index) => {
      if (index === 0) return { ...player, isPlayersTurn: false };
      if (index === 2) return { ...player, isPlayersTurn: true };
      return player;
    }),
    stage: GameViewStage.WAITING_FOR_PLAYER,
  },
};

export const PickupCard: Story = {
  args: { stage: GameViewStage.DRAWING_CARDS },
};

export const EndTurn: Story = { args: { stage: GameViewStage.END_TURN } };

export const SingleCardPlayed: Story = {
  args: { playedCards: [{ suit: Suit.DIAMONDS, rank: Rank.NINE }] },
};

export const BigHandPlayed: Story = {
  args: {
    playedCards: [
      { suit: Suit.SPADES, rank: Rank.TWO },
      { suit: Suit.SPADES, rank: Rank.THREE },
      { suit: Suit.SPADES, rank: Rank.FOUR },
      { suit: Suit.SPADES, rank: Rank.FIVE },
      { suit: Suit.SPADES, rank: Rank.SIX },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
      { suit: Suit.SPADES, rank: Rank.EIGHT },
    ],
  },
};

export const EndOfRound: Story = {
  args: { stage: GameViewStage.END_OF_ROUND },
};

export const EmojiReaction: Story = {
  render: ({ players: initialPlayers, onEmojiClick, ...args }) => {
    const [reactingPlayers, setReactingPlayers] = useState(initialPlayers);

    return (
      <Game
        {...args}
        players={reactingPlayers}
        onEmojiClick={(emoji) => {
          setReactingPlayers((previousPlayers) =>
            previousPlayers.map((player, index) =>
              index === 0
                ? {
                    ...player,
                    emojiReaction: {
                      emoji,
                      id: crypto.randomUUID() as EmojiReactionId,
                    },
                  }
                : player,
            ),
          );
          onEmojiClick(emoji);
        }}
      />
    );
  },
};

export const CallYaniv: Story = {
  args: { stage: GameViewStage.END_TURN },
  render: ({ players: initialPlayers, onYanivClick, ...args }) => {
    const [yanivPlayers, setYanivPlayers] = useState(initialPlayers);

    const handleYaniv = () => {
      setYanivPlayers((previousPlayers) =>
        previousPlayers.map((player, index) =>
          index === 0 ? { ...player, isYanivCalled: true } : player,
        ),
      );
      onYanivClick();
    };

    return <Game {...args} players={yanivPlayers} onYanivClick={handleYaniv} />;
  },
};

export const InstaPlayCard: Story = {
  args: {
    stage: GameViewStage.END_TURN,
    drawnCard: { suit: Suit.SPADES, rank: Rank.ACE },
    onAutoPlayDrawnCard: fn(),
    canAutoPlay: true,
  },
};

export const NotInstaPlayCard: Story = {
  args: {
    stage: GameViewStage.END_TURN,
    drawnCard: { suit: Suit.SPADES, rank: Rank.ACE },
    onAutoPlayDrawnCard: fn(),
    canAutoPlay: false,
  },
};
