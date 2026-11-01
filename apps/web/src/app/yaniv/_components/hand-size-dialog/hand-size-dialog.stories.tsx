import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, screen, userEvent, within } from 'storybook/test';
import { HandSizeDialog } from '.';

// Each play function leaves the dialog open, to show it
const meta = {
  title: 'Yaniv / Hand Size Dialog',
  component: HandSizeDialog,
  args: {
    className: 'm-4',
    isDealer: true,
    onChooseHandSize: fn(),
  },
} satisfies Meta<typeof HandSizeDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

const openDialog = (canvasElement: HTMLElement) =>
  userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Choose hand size' }),
  );

// The winner of the last hand is also dealing, so choosing deals the round.
export const Dealer: Story = {
  play: async ({ canvasElement }) => {
    await openDialog(canvasElement);
    screen.getByRole('slider', { name: 'Hand size' }).focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');

    await expect(
      screen.getByRole('button', { name: 'Deal 7 cards' }),
    ).toBeInTheDocument();
  },
};

// The choice is on its way to the server, so it can't be sent twice.
export const Pending: Story = {
  args: { isPending: true },
  play: async ({ canvasElement }) => {
    await openDialog(canvasElement);

    await expect(
      screen.getByRole('button', { name: 'Deal 5 cards' }),
    ).toBeDisabled();
  },
};

// The winner of the last hand chooses, then someone else deals.
export const NotDealer: Story = {
  args: { isDealer: false },
  play: async ({ canvasElement }) => {
    await openDialog(canvasElement);

    await expect(
      screen.getByRole('button', { name: 'Choose 5 cards' }),
    ).toBeInTheDocument();
  },
};
