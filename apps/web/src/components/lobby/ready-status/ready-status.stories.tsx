import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ReadyStatus } from '.';

const meta = {
  title: 'Lobby / Ready Status',
  component: ReadyStatus,
  args: { isReady: true },
} satisfies Meta<typeof ReadyStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const NotReady: Story = { args: { isReady: false } };
