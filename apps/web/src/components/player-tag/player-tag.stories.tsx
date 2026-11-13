import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, screen, userEvent, within } from 'storybook/test';
import { PlayerTag } from '~/components/player-tag';
import {
  PlayerActionsButton,
  PlayerActionsMenu,
} from '~/components/player-tag/player-actions-menu';
import { ButtonGroup } from '~/components/ui/button-group';
import { buildPlayer } from '~/test-utils/lobby';
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

/** The host's menu for another player, from a ⋮ joined to their tag. */
export const ActionsForHost: Story = {
  render: (args) => (
    <ButtonGroup>
      <PlayerTag {...args} />
      <PlayerActionsMenu
        player={buildPlayer({
          name: args.name,
          color: args.color,
          isUser: args.isUser,
          isHost: args.isHost ?? false,
        })}
        isUserHost
        onLeave={fn()}
        onKick={fn()}
        onMakeHost={fn()}
      >
        <PlayerActionsButton name={args.name} color={args.color} />
      </PlayerActionsMenu>
    </ButtonGroup>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Actions for Frank' }),
    );

    await expect(
      screen.getByRole('menuitem', { name: 'Kick' }),
    ).toBeInTheDocument();
    await expect(
      screen.getByRole('menuitem', { name: 'Make Host' }),
    ).toBeInTheDocument();
  },
};

/** Your own menu, to leave the game. */
export const ActionsForYou: Story = {
  ...ActionsForHost,
  args: { isUser: true, isHost: true },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Actions for Frank' }),
    );

    await expect(
      screen.getByRole('menuitem', { name: 'Leave' }),
    ).toBeInTheDocument();
  },
};
