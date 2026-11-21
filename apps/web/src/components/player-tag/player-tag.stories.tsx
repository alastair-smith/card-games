import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ReadyStatus } from '~/components/lobby/ready-status';
import {
  PlayerTag,
  PlayerTagCardCount,
  PlayerTagHostIcon,
  PlayerTagName,
  PlayerTagReaction,
  PlayerTagUserIcon,
} from '~/components/player-tag';
import { PlayerActionsButton } from '~/components/player-tag/player-actions-button';
import { ButtonGroup } from '~/components/ui/button-group';
import {
  type EmojiReactionId,
  MAX_NAME_LENGTH,
  type PlayerName,
} from '~/types/entities';
import { type PlayerColor, playerColorSchema } from '~/utils/player-color';

type PlayerTagStoryProps = {
  name: PlayerName;
  color: PlayerColor;
  cardCount?: number | null;
  isUser: boolean;
  isHost: boolean;
  isPlayersTurn: boolean;
  isReady?: boolean;
  emojiReaction?: { emoji: string; id: EmojiReactionId };
};

function PlayerTagStory({
  name,
  color,
  cardCount,
  isUser,
  isHost,
  isPlayersTurn,
  isReady,
  emojiReaction,
}: PlayerTagStoryProps) {
  return (
    <PlayerTag color={color} isPlayersTurn={isPlayersTurn}>
      {isHost && <PlayerTagHostIcon />}
      {isUser && <PlayerTagUserIcon />}
      <PlayerTagName>{name}</PlayerTagName>
      {cardCount !== undefined && <PlayerTagCardCount count={cardCount} />}
      {isReady !== undefined && <ReadyStatus isReady={isReady} />}
      <PlayerTagReaction reaction={emojiReaction} />
    </PlayerTag>
  );
}

const meta = {
  title: 'Player Tag',
  component: PlayerTagStory,
  // Storybook doesn't infer these from PlayerTagStory's props
  argTypes: {
    color: { control: 'select', options: playerColorSchema.options },
    cardCount: { control: 'number' },
    isReady: { control: 'boolean' },
    emojiReaction: { control: 'object' },
  },
  args: {
    name: 'Frank' as PlayerName,
    color: 'cyan',
    isUser: false,
    isHost: false,
    isPlayersTurn: false,
  },
} satisfies Meta<PlayerTagStoryProps>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const You: Story = { args: { isUser: true } };

export const Host: Story = { args: { isUser: true, isHost: true } };

export const CardCount: Story = { args: { cardCount: 5 } };

/** Keeps the card's space while the count is hidden. */
export const HiddenCardCount: Story = { args: { cardCount: null } };

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

/** A lobby tag, with whether the player is ready after their name. */
export const ReadyStatusInLobby: Story = { args: { isReady: true } };

export const LongestNameReadyStatusInLobby: Story = {
  args: {
    name: 'W'.repeat(MAX_NAME_LENGTH) as PlayerName,
    isUser: true,
    isHost: true,
    isReady: false,
  },
};

/** A ⋮ joined to the tag, to open actions for the player. */
export const WithActionsButton: Story = {
  render: (args) => (
    <ButtonGroup>
      <PlayerTagStory {...args} />
      <PlayerActionsButton name={args.name} color={args.color} />
    </ButtonGroup>
  ),
};
