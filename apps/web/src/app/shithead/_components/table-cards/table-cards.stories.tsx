import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { buildTableCards } from '~/test-utils/shithead';
import { TableCards } from '.';

const meta = {
  title: 'Shithead / Table Cards',
  component: TableCards,
  args: { slots: buildTableCards() },
} satisfies Meta<typeof TableCards>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllCards: Story = {};

export const SomeFaceUpCardsPlayed: Story = {
  args: {
    slots: buildTableCards().map((slot, slotIndex) =>
      slotIndex === 1 ? { ...slot, faceUpCard: null } : slot,
    ),
  },
};

export const OnlyFaceDownCardsLeft: Story = {
  args: {
    slots: buildTableCards().map((slot) => ({ ...slot, faceUpCard: null })),
  },
};

export const OneFaceDownCardLeft: Story = {
  args: {
    slots: [
      { faceUpCard: null, hasFaceDownCard: false },
      { faceUpCard: null, hasFaceDownCard: true },
      { faceUpCard: null, hasFaceDownCard: false },
    ],
  },
};

export const NoCardsLeft: Story = {
  args: {
    slots: buildTableCards().map(() => ({
      faceUpCard: null,
      hasFaceDownCard: false,
    })),
  },
};
