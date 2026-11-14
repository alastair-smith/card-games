import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { buildTableCards } from '~/test-utils/shithead';
import {
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import { GameStage } from '~/types/games/shithead';
import { TurnStatus } from '.';

const LONGEST_NAME = Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
  '',
) as PlayerName;

const buildPlayers = ({
  turnIndex = null,
  isUserSwapConfirmed = false,
  cardCount = 3,
}: {
  turnIndex?: number | null;
  isUserSwapConfirmed?: boolean;
  cardCount?: number;
}) =>
  (['Al', LONGEST_NAME, 'Paul'] as PlayerName[]).map((name, index) => ({
    id: String(index + 1) as UserId,
    name,
    isUser: index === 0,
    isPlayersTurn: index === turnIndex,
    isSwapConfirmed: index === 0 ? isUserSwapConfirmed : index === 2,
    cardCount,
    tableCards: buildTableCards(),
  }));

const meta = {
  title: 'Shithead / Turn Status',
  component: TurnStatus,
  args: {
    gameStage: GameStage.IN_PROGRESS,
    players: buildPlayers({ turnIndex: 0 }),
  },
} satisfies Meta<typeof TurnStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const YourTurn: Story = {};

export const YourTurnFaceUpCards: Story = {
  args: { players: buildPlayers({ turnIndex: 0, cardCount: 0 }) },
};

export const OtherPlayersTurn: Story = {
  args: { players: buildPlayers({ turnIndex: 1 }) },
};

export const OtherPlayersTurnFaceUpCards: Story = {
  args: { players: buildPlayers({ turnIndex: 1, cardCount: 0 }) },
};

export const Swapping: Story = {
  args: { gameStage: GameStage.SWAPPING, players: buildPlayers({}) },
};

export const WaitingForSwaps: Story = {
  args: {
    gameStage: GameStage.SWAPPING,
    players: buildPlayers({ isUserSwapConfirmed: true }),
  },
};

const faceDownOnly = buildTableCards().map((slot) => ({
  ...slot,
  faceUpCard: null,
}));

const withFaceDownOnly = (players: ReturnType<typeof buildPlayers>) =>
  players.map((player) => ({ ...player, tableCards: faceDownOnly }));

const ALL_STATUSES = [
  {
    gameStage: GameStage.SWAPPING,
    players: buildPlayers({}),
  },
  {
    gameStage: GameStage.SWAPPING,
    players: buildPlayers({ isUserSwapConfirmed: true }),
  },
  {
    gameStage: GameStage.SWAPPING,
    players: buildPlayers({ isUserSwapConfirmed: true }).map((player) => ({
      ...player,
      isSwapConfirmed: player.isUser,
    })),
  },
  { gameStage: GameStage.IN_PROGRESS, players: buildPlayers({ turnIndex: 0 }) },
  {
    gameStage: GameStage.IN_PROGRESS,
    players: buildPlayers({ turnIndex: 0, cardCount: 0 }),
  },
  {
    gameStage: GameStage.IN_PROGRESS,
    players: withFaceDownOnly(buildPlayers({ turnIndex: 0, cardCount: 0 })),
  },
  { gameStage: GameStage.IN_PROGRESS, players: buildPlayers({ turnIndex: 1 }) },
  {
    gameStage: GameStage.IN_PROGRESS,
    players: buildPlayers({ turnIndex: 1, cardCount: 0 }),
  },
  {
    gameStage: GameStage.IN_PROGRESS,
    players: withFaceDownOnly(buildPlayers({ turnIndex: 1, cardCount: 0 })),
  },
] as const satisfies Story['args'][];

/** Every message, with the longest name, to compare them at once. */
export const AllStatuses: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className='flex flex-col gap-4'>
      {ALL_STATUSES.map((status, statusIndex) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: the list never changes
        <TurnStatus key={statusIndex} {...status} />
      ))}
    </div>
  ),
};
