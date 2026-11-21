import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { Rank, type StandardPlayingCard, Suit } from '~/types/cards';
import { ShitheadPlayingCard } from '.';

const MAGIC_CARDS: StandardPlayingCard[] = [
  { suit: Suit.SPADES, rank: Rank.TWO },
  { suit: Suit.HEARTS, rank: Rank.FIVE },
  { suit: Suit.CLUBS, rank: Rank.SEVEN },
  { suit: Suit.DIAMONDS, rank: Rank.TEN },
];

const meta = {
  title: 'Shithead / Playing Card',
  component: ShitheadPlayingCard,
  args: {
    className: 'text-2xl',
    card: { suit: Suit.DIAMONDS, rank: Rank.TEN },
    border: true,
    isPressed: false,
  },
} satisfies Meta<typeof ShitheadPlayingCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Each magic card's symbol: an eraser for the 2's reset, a ghost for the invisible 5, a downward arrow for the 7's lower and a bin for the 10's burn. */
export const MagicCards: Story = {
  render: (args) => (
    <div className='flex flex-wrap gap-2'>
      {MAGIC_CARDS.map((card) => (
        <ShitheadPlayingCard key={card.rank} {...args} card={card} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole('img', { name: /, magic card$/ }),
    ).toHaveLength(4);
  },
};

export const Two: Story = {
  args: { card: { suit: Suit.SPADES, rank: Rank.TWO } },
};

export const Five: Story = {
  args: { card: { suit: Suit.HEARTS, rank: Rank.FIVE } },
};

export const Seven: Story = {
  args: { card: { suit: Suit.CLUBS, rank: Rank.SEVEN } },
};

export const Ten: Story = {};

export const NotMagic: Story = {
  args: { card: { suit: Suit.CLUBS, rank: Rank.KING } },
};

export const FaceDown: Story = { args: { card: null } };

/** One the player can choose, such as on their turn. */
export const Clickable: Story = { args: { onClick: fn() } };

/** Chosen, such as to play. */
export const Pressed: Story = { args: { isPressed: true, onClick: fn() } };
