import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { PlayerName, UserId } from '~/types/entities';
import { type DrawSource, GameStep } from '~/types/games/yaniv';
import { TurnStatus } from '.';

const OTHER_PLAYER_MESSAGES = [
  { step: GameStep.PLAY_CARDS, drawnFrom: null },
  { step: GameStep.PICKUP_CARD, drawnFrom: null },
  { step: GameStep.PROCEED, drawnFrom: 'deck' },
  { step: GameStep.PROCEED, drawnFrom: 'discard' },
  { step: GameStep.PROCEED, drawnFrom: null },
  { step: GameStep.REDEAL, drawnFrom: null },
] as const satisfies { step: GameStep; drawnFrom: DrawSource | null }[];

const playersWithTurnFor = (name: PlayerName) => [
  {
    id: '1' as UserId,
    name: 'Al' as PlayerName,
    isYanivCalled: false,
  },
  { id: '2' as UserId, name, isYanivCalled: false, isPlayersTurn: true },
];

const meta = {
  title: 'Yaniv / Turn Status',
  component: TurnStatus,
  args: {
    players: playersWithTurnFor('Kevin' as PlayerName),
    userId: '1' as UserId,
    step: GameStep.PLAY_CARDS,
    drawnFrom: null,
  },
} satisfies Meta<typeof TurnStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OtherPlayersTurn: Story = {};

/** Every message for another player's turn, to compare their lengths. */
export const EveryMessage: Story = {
  render: (args) => (
    <div className='flex flex-col gap-4'>
      {OTHER_PLAYER_MESSAGES.map(({ step, drawnFrom }) => (
        <TurnStatus
          key={`${step}-${drawnFrom}`}
          {...args}
          step={step}
          drawnFrom={drawnFrom}
        />
      ))}
    </div>
  ),
};

export const EveryMessageLongestName: Story = {
  ...EveryMessage,
  args: { players: playersWithTurnFor('WWWWWWWWWWWW' as PlayerName) },
};

/** Every message for your own turn. */
export const EveryMessageOnYourTurn: Story = {
  args: { userId: '2' as UserId },
  render: (args) => (
    <div className='flex flex-col gap-4'>
      {Object.values(GameStep).map((step) => (
        <TurnStatus key={step} {...args} step={step} />
      ))}
    </div>
  ),
};
