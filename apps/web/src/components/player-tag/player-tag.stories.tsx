import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PlayerTag } from '~/components/player-tag';
import { PlayerActionsButton } from '~/components/player-tag/player-actions-button';
import { ButtonGroup } from '~/components/ui/button-group';
import {
  type EmojiReactionId,
  MAX_NAME_LENGTH,
  type PlayerName,
} from '~/types/entities';

const meta = {
  title: 'Player Tag',
  component: PlayerTag,
  args: {
    name: 'Frank' as PlayerName,
    color: 'cyan',
    isUser: false,
    isHost: false,
    isPlayersTurn: false,
  },
} satisfies Meta<typeof PlayerTag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const You: Story = { args: { isUser: true } };

export const Host: Story = { args: { isUser: true, isHost: true } };

export const CardCount: Story = { args: { cardCount: 5 } };

export const PlayersTurn: Story = {
  args: { cardCount: 5, isPlayersTurn: true },
};

export const EmojiReaction: Story = {
  args: { emojiReaction: { emoji: '🎉', id: 'reaction-1' as EmojiReactionId } },
};

export const LongestName: Story = {
  args: {
    name: 'W'.repeat(MAX_NAME_LENGTH) as PlayerName,
    isUser: true,
    isHost: true,
    cardCount: 5,
  },
};

/** A ⋮ joined to the tag, to open actions for the player. */
export const WithActionsButton: Story = {
  render: (args) => (
    <ButtonGroup>
      <PlayerTag {...args} />
      <PlayerActionsButton name={args.name} color={args.color} />
    </ButtonGroup>
  ),
};
