import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { fn } from 'storybook/test';
import { toast } from '~/components/ui/toast';
import { Rank, type StandardPlayingCard, Suit } from '~/types/cards';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import { GameStage } from '~/types/games/high-card';
import Game from './game-view';

type GameProps = React.ComponentProps<typeof Game>;
type Player = GameProps['state']['players'][number];

const player = (
  id: string,
  name: string,
  card: StandardPlayingCard | null,
  isUser = false,
): Player => ({
  id: id as UserId,
  name: name as PlayerName,
  isUser,
  card,
});

const longName = Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
  '',
) as PlayerName;

const meta = {
  title: 'High Card / Game',
  component: Game,
  parameters: { isFullScreen: true },
  args: {
    onEmojiClick: fn(),
    reactions: {},
    pickupCard: () => {
      toast.success('Card picked up!');
    },
    state: {
      players: [
        player('1', 'Alice', null),
        player('2', 'Bob', null, true),
        player('3', 'Zoe', null),
      ],
      winners: [],
      stage: GameStage.IN_PROGRESS,
    },
  },
} satisfies Meta<typeof Game>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Turn1: Story = {};

// The user's card is picked up during the story, so it is held locally.
export const Turn2: Story = {
  render: ({ state, ...args }) => {
    const [userCard, setUserCard] = useState<StandardPlayingCard | null>(null);

    return (
      <Game
        {...args}
        pickupCard={() => {
          setUserCard({ suit: Suit.SPADES, rank: Rank.QUEEN });
          toast.success('Card picked up!');
        }}
        state={{
          ...state,
          players: [
            player('1', 'Alice', { suit: Suit.HEARTS, rank: Rank.THREE }),
            player('2', 'Bob', userCard, true),
            player('3', 'Zoe', null),
          ],
        }}
      />
    );
  },
};

export const Turn3: Story = {
  args: {
    state: {
      players: [
        player('1', 'Alice', { suit: Suit.HEARTS, rank: Rank.THREE }),
        player('2', 'Bob', { suit: Suit.SPADES, rank: Rank.QUEEN }, true),
        player('3', 'Zoe', null),
      ],
      winners: [],
      stage: GameStage.IN_PROGRESS,
    },
  },
};

export const Turn4: Story = {
  args: {
    state: {
      players: [
        player('1', 'Alice', { suit: Suit.HEARTS, rank: Rank.THREE }),
        player('2', 'Bob', { suit: Suit.SPADES, rank: Rank.QUEEN }, true),
        player('3', 'Zoe', { suit: Suit.CLUBS, rank: Rank.TEN }),
      ],
      winners: ['2'] as UserId[],
      stage: GameStage.FINISHED,
    },
  },
};

export const MaxPlayers: Story = {
  args: {
    state: {
      players: [
        player('1', 'Alice', { suit: Suit.HEARTS, rank: Rank.THREE }),
        player('2', 'Bob', { suit: Suit.SPADES, rank: Rank.QUEEN }, true),
        player('3', 'Carl', { suit: Suit.CLUBS, rank: Rank.TEN }),
        player('4', 'Denise', { suit: Suit.HEARTS, rank: Rank.TEN }),
        player('5', 'Ella', { suit: Suit.SPADES, rank: Rank.FOUR }),
        player('6', 'Freddie', { suit: Suit.CLUBS, rank: Rank.THREE }),
        player('7', 'Georgina', { suit: Suit.CLUBS, rank: Rank.SEVEN }),
        player('8', 'Henry', { suit: Suit.SPADES, rank: Rank.JACK }),
        player('9', 'Ian', { suit: Suit.DIAMONDS, rank: Rank.ACE }),
        player('10', 'John', { suit: Suit.CLUBS, rank: Rank.NINE }),
      ],
      winners: [],
      stage: GameStage.IN_PROGRESS,
    },
  },
};

export const LongName: Story = {
  args: {
    state: {
      players: [
        player('1', longName, null),
        player('2', longName, null, true),
        player('3', longName, null),
      ],
      winners: [],
      stage: GameStage.IN_PROGRESS,
    },
  },
};
