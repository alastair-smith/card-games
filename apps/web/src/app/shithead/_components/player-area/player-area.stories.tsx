import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { buildTableCards } from '~/test-utils/shithead';
import type { EmojiReactionId, PlayerName } from '~/types/entities';
import type { PlayerColor } from '~/utils/player-color';
import { type FinishingPosition, PlayerArea } from '.';

const emptyTableCards = buildTableCards().map(() => ({
  faceUpCard: null,
  hasFaceDownCard: false,
}));

const meta = {
  title: 'Shithead / Player Area',
  component: PlayerArea,
  args: {
    name: 'Kevin' as PlayerName,
    color: 'cyan',
    cardCount: 3,
    isUser: false,
    isPlayersTurn: false,
    tableCards: buildTableCards(),
    finishingPosition: null,
  },
} satisfies Meta<typeof PlayerArea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllCardsOnTheTable: Story = {};

export const You: Story = { args: { isUser: true } };

export const PlayersTurn: Story = { args: { isPlayersTurn: true } };

export const EmojiReaction: Story = {
  args: {
    emojiReaction: { emoji: '💀', id: 'reaction-1' as EmojiReactionId },
  },
};

export const SomeFaceUpCardsPlayed: Story = {
  args: {
    tableCards: buildTableCards().map((slot, slotIndex) =>
      slotIndex === 1 ? { ...slot, faceUpCard: null } : slot,
    ),
  },
};

export const OnlyFaceDownCardsLeft: Story = {
  args: {
    cardCount: 0,
    tableCards: buildTableCards().map((slot) => ({
      ...slot,
      faceUpCard: null,
    })),
  },
};

export const OneFaceDownCardLeft: Story = {
  args: {
    cardCount: 0,
    tableCards: [
      { faceUpCard: null, hasFaceDownCard: false },
      { faceUpCard: null, hasFaceDownCard: true },
      { faceUpCard: null, hasFaceDownCard: false },
    ],
  },
};

export const FinishedFirst: Story = {
  args: { cardCount: 0, tableCards: emptyTableCards, finishingPosition: 1 },
};

export const FinishedFourth: Story = {
  args: { cardCount: 0, tableCards: emptyTableCards, finishingPosition: 4 },
};

type FivePlayer = {
  name: string;
  color: PlayerColor;
  finishingPosition: FinishingPosition;
};

const longestNamePlayers = [
  { name: 'WWWWWWWWWWWW', color: 'red', finishingPosition: 1 },
  { name: 'MMMMMMMMMMMM', color: 'cyan', finishingPosition: 2 },
  { name: 'Christophers', color: 'purple', finishingPosition: 3 },
  { name: 'WWWWWWWWWWWW', color: 'green', finishingPosition: 4 },
  { name: 'MMMMMMMMMMMM', color: 'plum', finishingPosition: 5 },
] as const satisfies FivePlayer[];

const normalNamePlayers = [
  { name: 'Al', color: 'red', finishingPosition: 1 },
  { name: 'Kevin', color: 'cyan', finishingPosition: 2 },
  { name: 'Paul', color: 'purple', finishingPosition: 3 },
  { name: 'Viola', color: 'green', finishingPosition: 4 },
  { name: 'Sarah', color: 'plum', finishingPosition: 5 },
] as const satisfies FivePlayer[];

const renderFivePlayers =
  (
    players: readonly FivePlayer[],
    { isFinished }: { isFinished: boolean },
  ): NonNullable<Story['render']> =>
  (args) => (
    <div className='flex flex-wrap justify-evenly gap-x-4 gap-y-4 p-1.5'>
      {players.map((player, playerIndex) => (
        <PlayerArea
          {...args}
          key={`${player.name}-${player.color}`}
          name={player.name as PlayerName}
          color={player.color}
          isUser={playerIndex === 0}
          isPlayersTurn={!isFinished && playerIndex === 1}
          finishingPosition={isFinished ? player.finishingPosition : null}
        />
      ))}
    </div>
  );

export const FivePlayers: Story = {
  parameters: { controls: { disable: true } },
  render: renderFivePlayers(normalNamePlayers, { isFinished: false }),
};

/** The worst case for overlaps: 5 long names, every card on the table. */
export const FivePlayersLongestNames: Story = {
  parameters: { controls: { disable: true } },
  render: renderFivePlayers(longestNamePlayers, { isFinished: false }),
};

export const FivePlayersAllFinished: Story = {
  parameters: { controls: { disable: true } },
  args: { cardCount: 0, tableCards: emptyTableCards },
  render: renderFivePlayers(longestNamePlayers, { isFinished: true }),
};
