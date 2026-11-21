import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import { Rank, type StandardPlayingCard, Suit } from '~/types/cards';
import { HandCard } from './hand-card';

const MAGIC_CARDS: StandardPlayingCard[] = [
  { suit: Suit.SPADES, rank: Rank.TWO },
  { suit: Suit.HEARTS, rank: Rank.FIVE },
  { suit: Suit.CLUBS, rank: Rank.SEVEN },
  { suit: Suit.DIAMONDS, rank: Rank.TEN },
];

const meta = {
  title: 'Shithead / Hand Card',
  component: HandCard,
  decorators: [
    (Story) => (
      <div className='text-2xl'>
        <Story />
      </div>
    ),
  ],
  args: {
    card: { suit: Suit.HEARTS, rank: Rank.TEN },
    isSelected: false,
    isSelectable: true,
    onClick: fn(),
  },
} satisfies Meta<typeof HandCard>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Each magic card's symbol: an eraser for the 2's reset, a ghost for the invisible 5, a downward arrow for the 7's lower and a bin for the 10's burn. */
export const MagicCards: Story = {
  render: (args) => (
    <div className='flex flex-wrap gap-2'>
      {MAGIC_CARDS.map((card) => (
        <HandCard key={card.rank} {...args} card={card} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole('button', { name: /, magic card$/ }),
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
  args: { card: { suit: Suit.HEARTS, rank: Rank.SEVEN } },
};

export const Ten: Story = {};

export const NotMagic: Story = {
  args: { card: { suit: Suit.CLUBS, rank: Rank.KING } },
};

export const Selected: Story = { args: { isSelected: true } };

/** Shown only, such as on another player's turn. */
export const NotSelectable: Story = { args: { isSelectable: false } };
