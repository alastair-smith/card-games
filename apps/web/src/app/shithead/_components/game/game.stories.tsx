import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { type ComponentProps, useState } from 'react';
import { fn } from 'storybook/test';
import { Button } from '~/components/ui/button';
import { buildClientPlayer, buildTableCards } from '~/test-utils/shithead';
import {
  RANKS,
  Rank,
  type StandardPlayingCard,
  Suit,
  standardDeck,
} from '~/types/cards';
import {
  type EmojiReactionId,
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import { GameStage, MAX_PLAYERS } from '~/types/games/shithead';
import type { PlayerColor } from '~/utils/player-color';
import { Hand } from '../hand';
import Game from '.';

type GameProps = ComponentProps<typeof Game>;
type Player = GameProps['players'][number];

const LONGEST_NAME = Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
  '',
) as PlayerName;

const PLAYER_DETAILS = [
  { name: 'Al', color: 'red' },
  { name: 'Kevin', color: 'cyan' },
  { name: 'Paul', color: 'purple' },
  { name: 'Viola', color: 'green' },
  { name: LONGEST_NAME, color: 'fuchsia' },
] as const satisfies { name: string; color: PlayerColor }[];

const buildPlayers = ({
  turnIndex = 0,
  playerCount = MAX_PLAYERS,
}: {
  turnIndex?: number | null;
  playerCount?: number;
} = {}): Player[] =>
  PLAYER_DETAILS.slice(0, playerCount).map(({ name, color }, index) => ({
    ...buildClientPlayer({
      id: String(index + 1) as UserId,
      name: name as PlayerName,
      color,
      isUser: index === 0,
    }),
    isPlayersTurn: index === turnIndex,
  }));

const longestNamePlayers = buildPlayers().map((player) => ({
  ...player,
  name: LONGEST_NAME,
}));

// A Jack, a 5, a Jack, a 5, a Jack, a 5 and a 5, played in that order
const longestVisiblePile: StandardPlayingCard[] = [
  { suit: Suit.CLUBS, rank: Rank.FIVE },
  { suit: Suit.SPADES, rank: Rank.FIVE },
  { suit: Suit.HEARTS, rank: Rank.JACK },
  { suit: Suit.DIAMONDS, rank: Rank.FIVE },
  { suit: Suit.SPADES, rank: Rank.JACK },
  { suit: Suit.HEARTS, rank: Rank.FIVE },
  { suit: Suit.CLUBS, rank: Rank.JACK },
];

const handProps = {
  className: 'flex-1',
  color: 'red',
  gameStage: GameStage.IN_PROGRESS,
  cards: [
    { suit: Suit.CLUBS, rank: Rank.FOUR },
    { suit: Suit.HEARTS, rank: Rank.NINE },
    { suit: Suit.SPADES, rank: Rank.QUEEN },
  ],
  tableCards: buildTableCards(),
  isSwapConfirmed: true,
  isPlayersTurn: true,
  // What can go on the 8 on the pile, including the 2s and 5s that go on any card
  playableRanks: RANKS.filter(
    (rank) => rank >= Rank.EIGHT || rank === Rank.TWO || rank === Rank.FIVE,
  ),
  onSwapCards: fn(),
  onConfirmSwap: fn(),
  onPlayCards: fn(),
  onPickUpPile: fn(),
} satisfies ComponentProps<typeof Hand>;

const meta = {
  title: 'Shithead / Game',
  component: Game,
  parameters: { isFullScreen: true },
  args: {
    gameStage: GameStage.IN_PROGRESS,
    players: buildPlayers(),
    deckSize: 3,
    discardSize: 4,
    visibleDiscardCards: [{ suit: Suit.HEARTS, rank: Rank.EIGHT }],
    hand: <Hand {...handProps} />,
    onEmojiClick: fn(),
  },
} satisfies Meta<typeof Game>;

export default meta;

type Story = StoryObj<typeof meta>;

export const YourTurn: Story = {};

export const OtherPlayersTurn: Story = {
  args: {
    players: buildPlayers({ turnIndex: 2 }),
    hand: <Hand {...handProps} isPlayersTurn={false} />,
  },
};

/** Most of the deck in hand, after picking up a long pile. */
export const BiggestHand: Story = {
  args: {
    deckSize: 0,
    hand: <Hand {...handProps} cards={standardDeck.slice(2)} />,
  },
};

export const TwoPlayers: Story = {
  args: { players: buildPlayers({ playerCount: 2 }), deckSize: 30 },
};

export const ThreePlayers: Story = {
  args: { players: buildPlayers({ playerCount: 3 }), deckSize: 21 },
};

export const Swapping: Story = {
  args: {
    gameStage: GameStage.SWAPPING,
    players: buildPlayers({ turnIndex: null }).map((player) => ({
      ...player,
      isSwapConfirmed: false,
    })),
    hand: (
      <Hand
        {...handProps}
        gameStage={GameStage.SWAPPING}
        isSwapConfirmed={false}
        isPlayersTurn={false}
      />
    ),
  },
};

export const EmptyDiscardPile: Story = {
  args: { discardSize: 0, visibleDiscardCards: [] },
};

/** The worst case for overlaps: 5 long names, every card on the table and the most cards the pile can show. */
export const LongestNamesAndPile: Story = {
  args: {
    players: longestNamePlayers,
    deckSize: 0,
    discardSize: 7,
    visibleDiscardCards: longestVisiblePile,
  },
};

export const SomePlayersFinished: Story = {
  args: {
    deckSize: 0,
    players: buildPlayers({ turnIndex: 3 }).map((player, index) =>
      index === 1 || index === 2
        ? {
            ...player,
            cardCount: 0,
            tableCards: buildTableCards().map(() => ({
              faceUpCard: null,
              hasFaceDownCard: false,
            })),
            finishingPosition: index === 1 ? 1 : 2,
          }
        : player,
    ),
  },
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
            previousPlayers.map((player) =>
              player.isUser
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

/** Draw the last cards to see the 🫥 rain. */
export const DeckEmptying: Story = {
  args: { deckSize: 2 },
  render: function Render({ deckSize: initialDeckSize, ...args }) {
    const [deckSize, setDeckSize] = useState(initialDeckSize);

    return (
      <>
        <Game {...args} deckSize={deckSize} />
        {/* Fixed over the header, so it takes no space in the layout */}
        <div className='fixed top-1 left-1/2 z-50 -translate-x-1/2'>
          <Button
            size='sm'
            variant='secondary'
            disabled={deckSize === 0}
            onClick={() => setDeckSize((size) => Math.max(size - 1, 0))}
          >
            Draw a card
          </Button>
        </div>
      </>
    );
  },
};
