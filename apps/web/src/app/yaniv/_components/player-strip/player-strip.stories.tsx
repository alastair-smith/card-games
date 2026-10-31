import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { buildClientPlayer } from '~/test-utils/yaniv';
import type { PlayerName, UserId } from '~/types/entities';
import { GameStep } from '~/types/games/yaniv';
import { PlayerStrip } from '.';

const players = [
  buildClientPlayer({
    id: '1' as UserId,
    color: 'red',
    cardCount: 7,
    name: 'Al' as PlayerName,
  }),
  buildClientPlayer({
    id: '2' as UserId,
    color: 'cyan',
    cardCount: 5,
    name: 'Kevin' as PlayerName,
  }),
  buildClientPlayer({
    id: '3' as UserId,
    color: 'purple',
    cardCount: 3,
    name: 'Paul' as PlayerName,
  }),
  buildClientPlayer({
    id: '4' as UserId,
    color: 'green',
    cardCount: 6,
    name: 'Viola' as PlayerName,
  }),
];

const withTurn = (turnIndex: number, yanivCallerIndex?: number) =>
  players.map((player, index) => ({
    ...player,
    isPlayersTurn: index === turnIndex,
    isYanivCalled: index === yanivCallerIndex,
  }));

const meta = {
  title: 'Yaniv / Player Strip',
  component: PlayerStrip,
  args: {
    players: withTurn(1),
    userId: '1' as UserId,
    step: GameStep.PICKUP_CARD,
  },
  argTypes: {
    step: { control: 'select', options: Object.values(GameStep) },
  },
} satisfies Meta<typeof PlayerStrip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OtherPlayersTurn: Story = {};

export const YourTurn: Story = {
  args: { players: withTurn(0), step: GameStep.PLAY_CARDS },
};

export const MightCallYaniv: Story = {
  args: { step: GameStep.PROCEED },
};

export const YanivCalled: Story = {
  args: { players: withTurn(3, 2), step: GameStep.PLAY_CARDS },
};

/** The worst case for overlaps: a sticker on every tag. */
export const EveryoneCalledYaniv: Story = {
  args: {
    players: withTurn(3).map((player) => ({ ...player, isYanivCalled: true })),
    step: GameStep.PLAY_CARDS,
  },
};

export const LongestNames: Story = {
  args: {
    players: withTurn(2).map((player, index) => ({
      ...player,
      name: (['Al', 'Christophers', 'WWWWWWWWWWWW', 'MMMMMMMMMMMM'] as const)[
        index
      ] as PlayerName,
    })),
  },
};
