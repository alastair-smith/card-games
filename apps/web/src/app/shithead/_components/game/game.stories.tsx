import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { type ComponentProps, useState } from 'react';
import { fn } from 'storybook/test';
import { Button } from '~/components/ui/button';
import { buildClientPlayer, buildTableCards } from '~/test-utils/shithead';
import { Rank, type StandardPlayingCard, Suit } from '~/types/cards';
import {
  type EmojiReactionId,
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import { GameStage, MAX_PLAYERS } from '~/types/games/shithead';
import type { PlayerColor } from '~/utils/player-color';
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

// Stands in for the player's hand, which the game passes in
function HandPlaceholder() {
  return (
    <div className='grid flex-1 place-items-center rounded-lg border-2 border-dashed border-white/60 p-4 text-center'>
      Your hand
    </div>
  );
}

const meta = {
  title: 'Shithead / Game',
  component: Game,
  parameters: { isFullScreen: true },
  args: {
    gameStage: GameStage.IN_PROGRESS,
    players: buildPlayers(),
    deckSize: 30,
    visibleDiscardCards: [{ suit: Suit.HEARTS, rank: Rank.EIGHT }],
    hand: <HandPlaceholder />,
    onEmojiClick: fn(),
  },
} satisfies Meta<typeof Game>;

export default meta;

type Story = StoryObj<typeof meta>;

export const YourTurn: Story = {};

export const OtherPlayersTurn: Story = {
  args: { players: buildPlayers({ turnIndex: 2 }) },
};

export const TwoPlayers: Story = {
  args: { players: buildPlayers({ playerCount: 2 }) },
};

export const ThreePlayers: Story = {
  args: { players: buildPlayers({ playerCount: 3 }) },
};

export const Swapping: Story = {
  args: {
    gameStage: GameStage.SWAPPING,
    players: buildPlayers({ turnIndex: null }).map((player) => ({
      ...player,
      isSwapConfirmed: false,
    })),
  },
};

export const EmptyDiscardPile: Story = { args: { visibleDiscardCards: [] } };

/** The worst case for overlaps: 5 long names, every card on the table and the most cards the pile can show. */
export const LongestNamesAndPile: Story = {
  args: {
    players: longestNamePlayers,
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
