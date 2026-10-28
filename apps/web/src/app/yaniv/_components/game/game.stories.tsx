import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from '~/components/ui/button';
import { buildClientPlayer, buildRoundScore } from '~/test-utils/yaniv';
import { Rank, Suit } from '~/types/cards';
import {
  type EmojiReactionId,
  MAX_NAME_LENGTH,
  type PlayerName,
  type UserId,
} from '~/types/entities';
import {
  GameStep,
  GameViewStage,
  type YanivPlayingCard,
} from '~/types/games/yaniv';
import Game from '.';

type GameProps = React.ComponentProps<typeof Game>;
type Player = GameProps['players'][number];

const players: Player[] = [
  buildClientPlayer({
    id: '1' as UserId,
    color: 'red',
    cardCount: 7,
    name: 'Al' as PlayerName,
    score: 9,
    roundScores: [
      buildRoundScore({ original: 9 }),
      buildRoundScore({ original: 5, adjusted: 0 }),
    ],
  }),
  buildClientPlayer({
    id: '2' as UserId,
    color: 'cyan',
    cardCount: 5,
    isFiftyScoreHalved: true,
    name: 'Kevin' as PlayerName,
    score: 25,
    roundScores: [
      buildRoundScore({ original: 38 }),
      buildRoundScore({ original: 12, halvedBy: 25 }),
    ],
  }),
  buildClientPlayer({
    id: '3' as UserId,
    color: 'purple',
    cardCount: 3,
    name: 'Paul' as PlayerName,
    score: 36,
    roundScores: [
      buildRoundScore({ original: 11 }),
      buildRoundScore({ original: 7, adjusted: 25 }),
    ],
  }),
  buildClientPlayer({
    id: '4' as UserId,
    color: 'green',
    cardCount: 6,
    name: 'Viola' as PlayerName,
    score: 10,
    roundScores: [
      buildRoundScore({ original: 6 }),
      buildRoundScore({ original: 4 }),
    ],
  }),
  buildClientPlayer({
    id: '5' as UserId,
    color: 'indigo',
    cardCount: 7,
    name: 'Duncan' as PlayerName,
    score: 13,
    roundScores: [
      buildRoundScore({ original: 2, adjusted: 0 }),
      buildRoundScore({ original: 13 }),
    ],
  }),
  buildClientPlayer({
    id: '6' as UserId,
    color: 'fuchsia',
    cardCount: 4,
    name: Array.from({ length: MAX_NAME_LENGTH }, () => 'W').join(
      '',
    ) as PlayerName,
    score: 25,
    roundScores: [
      buildRoundScore({ original: 15 }),
      buildRoundScore({ original: 10 }),
    ],
  }),
];

const withTurn = (playerIndex: number, playersToUse = players) =>
  playersToUse.map((player, index) => ({
    ...player,
    isPlayersTurn: index === playerIndex,
  }));

const withYanivCalledBy = (callerIndex: number, turnIndex: number) =>
  withTurn(turnIndex).map((player, index) =>
    index === callerIndex ? { ...player, isYanivCalled: true } : player,
  );

const userCards: YanivPlayingCard[] = [
  { suit: Suit.CLUBS, rank: Rank.ACE },
  { suit: Suit.HEARTS, rank: Rank.KING },
  { suit: Suit.SPADES, rank: Rank.QUEEN },
  { suit: Suit.DIAMONDS, rank: Rank.JACK },
  { suit: Suit.CLUBS, rank: Rank.TEN },
  { suit: Suit.HEARTS, rank: Rank.NINE },
  { suit: Suit.SPADES, rank: Rank.EIGHT },
];

const DESKTOP = { viewport: { value: undefined } };

const meta = {
  title: 'Yaniv / Game',
  component: Game,
  parameters: { isFullScreen: true },
  globals: { viewport: { value: 'phone' } },
  args: {
    onEmojiClick: fn(),
    onEndTurnClick: fn(),
    onYanivClick: fn(),
    onPlayCards: fn(),
    onCardToggle: fn(),
    onPickupFromDeck: fn(),
    onPickupFromDiscard: fn(),
    stage: GameViewStage.PICKING_CARDS,
    step: GameStep.PLAY_CARDS,
    players: withTurn(0),
    cards: userCards,
    userId: '1' as UserId,
    playedCards: [
      { suit: Suit.HEARTS, rank: Rank.SEVEN },
      { suit: Suit.DIAMONDS, rank: Rank.SEVEN },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
    ],
    discardCard: { suit: Suit.CLUBS, rank: Rank.FOUR },
  },
  argTypes: {
    stage: { control: 'select', options: Object.values(GameViewStage) },
    step: { control: 'select', options: Object.values(GameStep) },
  },
} satisfies Meta<typeof Game>;

export default meta;

type Story = StoryObj<typeof meta>;

const otherPlayersTurnArgs = {
  players: withTurn(4),
  stage: GameViewStage.WAITING_FOR_PLAYER,
  step: GameStep.PICKUP_CARD,
} satisfies Story['args'];

const runCards: YanivPlayingCard[] = [
  { suit: Suit.CLUBS, rank: Rank.THREE },
  { suit: Suit.CLUBS, rank: Rank.FOUR },
  { suit: Suit.CLUBS, rank: Rank.FIVE },
];

const runSelectedArgs = {
  cards: [...runCards, ...userCards.slice(0, 4)],
  selectedCards: runCards,
  isRunSelected: true,
} satisfies Story['args'];

/* Phones ------------------------------------------------------------------ */

export const YourTurnToPlay: Story = {};

export const FiveCardHand: Story = { args: { cards: userCards.slice(0, 5) } };

export const ThirteenCardHand: Story = {
  args: {
    cards: [
      ...userCards,
      { suit: Suit.DIAMONDS, rank: Rank.TWO },
      { suit: Suit.SPADES, rank: Rank.THREE },
      { suit: Suit.HEARTS, rank: Rank.FOUR },
      { suit: Suit.CLUBS, rank: Rank.FIVE },
      { suit: Suit.DIAMONDS, rank: Rank.SIX },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
    ],
  },
};

export const RunSelected: Story = { args: runSelectedArgs };

export const PickupCard: Story = {
  args: { stage: GameViewStage.DRAWING_CARDS, step: GameStep.PICKUP_CARD },
};

export const EndTurn: Story = {
  args: { stage: GameViewStage.END_TURN, step: GameStep.PROCEED },
};

export const OtherPlayersTurn: Story = { args: otherPlayersTurnArgs };

export const YanivCalled: Story = {
  args: {
    players: withYanivCalledBy(2, 3),
    stage: GameViewStage.WAITING_FOR_PLAYER,
  },
};

export const LongestNames: Story = {
  args: {
    players: withTurn(
      2,
      players.map((player, index) => ({
        ...player,
        name: (
          [
            'Al',
            'Christophers',
            'WWWWWWWWWWWW',
            'Maximiliana',
            'MMMMMMMMMMMM',
            'Bartholomew',
          ] as const
        )[index] as PlayerName,
      })),
    ),
    stage: GameViewStage.WAITING_FOR_PLAYER,
  },
};

export const TwoPlayers: Story = {
  args: { players: withTurn(0, players.slice(0, 2)) },
};

/** Five players' scores fit without scrolling. */
export const ScoresFivePlayers: Story = {
  args: {
    players: withTurn(2, players.slice(0, 5)),
    stage: GameViewStage.WAITING_FOR_PLAYER,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Scores' }));
    await expect(canvas.getByRole('tab', { name: 'Scores' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  },
};

export const EndOfRound: Story = {
  args: { stage: GameViewStage.END_OF_ROUND, step: GameStep.REDEAL },
};

export const WaitingForNewRound: Story = {
  args: {
    players: withTurn(2),
    stage: GameViewStage.WAITING_FOR_NEW_ROUND,
    step: GameStep.REDEAL,
  },
};

export const SingleCardPlayed: Story = {
  args: {
    ...otherPlayersTurnArgs,
    playedCards: [{ suit: Suit.DIAMONDS, rank: Rank.NINE }],
  },
};

export const BigHandPlayed: Story = {
  args: {
    ...otherPlayersTurnArgs,
    playedCards: [
      { suit: Suit.SPADES, rank: Rank.TWO },
      { suit: Suit.SPADES, rank: Rank.THREE },
      { suit: Suit.SPADES, rank: Rank.FOUR },
      { suit: Suit.SPADES, rank: Rank.FIVE },
      { suit: Suit.SPADES, rank: Rank.SIX },
      { suit: Suit.SPADES, rank: Rank.SEVEN },
      { suit: Suit.SPADES, rank: Rank.EIGHT },
    ],
  },
};

export const EmojiReaction: Story = {
  args: otherPlayersTurnArgs,
  render: ({ players: initialPlayers, onEmojiClick, ...args }) => {
    const [reactingPlayers, setReactingPlayers] = useState(initialPlayers);

    return (
      <Game
        {...args}
        players={reactingPlayers}
        onEmojiClick={(emoji) => {
          setReactingPlayers((previousPlayers) =>
            previousPlayers.map((player, index) =>
              index === 0
                ? {
                    ...player,
                    emojiReaction: {
                      emoji,
                      id: crypto.randomUUID() as EmojiReactionId,
                    },
                  }
                : player,
            ),
          );
          onEmojiClick(emoji);
        }}
      />
    );
  },
};

export const CallYaniv: Story = {
  args: { stage: GameViewStage.END_TURN, step: GameStep.PROCEED },
  render: ({ players: initialPlayers, onYanivClick, ...args }) => {
    const [yanivPlayers, setYanivPlayers] = useState(initialPlayers);

    const handleYaniv = () => {
      setYanivPlayers((previousPlayers) =>
        previousPlayers.map((player, index) =>
          index === 0 ? { ...player, isYanivCalled: true } : player,
        ),
      );
      onYanivClick();
    };

    return <Game {...args} players={yanivPlayers} onYanivClick={handleYaniv} />;
  },
};

export const InstaPlayCard: Story = {
  args: {
    stage: GameViewStage.END_TURN,
    step: GameStep.PROCEED,
    drawnCard: { suit: Suit.SPADES, rank: Rank.ACE },
    onAutoPlayDrawnCard: fn(),
    canAutoPlay: true,
  },
};

export const NotInstaPlayCard: Story = {
  args: {
    stage: GameViewStage.END_TURN,
    step: GameStep.PROCEED,
    drawnCard: { suit: Suit.SPADES, rank: Rank.ACE },
    onAutoPlayDrawnCard: fn(),
    canAutoPlay: false,
  },
};

/* Stage walkthrough ------------------------------------------------------- */

const withYanivCalledByKevin = (turnIndex: number) =>
  withYanivCalledBy(1, turnIndex);

const WALKTHROUGH_STAGES = [
  {
    label: 'Your turn: play',
    players: withTurn(0),
    stage: GameViewStage.PICKING_CARDS,
    step: GameStep.PLAY_CARDS,
  },
  {
    label: 'Your turn: pick up',
    players: withTurn(0),
    stage: GameViewStage.DRAWING_CARDS,
    step: GameStep.PICKUP_CARD,
  },
  {
    label: 'Your turn: end turn',
    players: withTurn(0),
    stage: GameViewStage.END_TURN,
    step: GameStep.PROCEED,
  },
  {
    label: 'Kevin plays',
    players: withTurn(1),
    stage: GameViewStage.WAITING_FOR_PLAYER,
    step: GameStep.PLAY_CARDS,
  },
  {
    label: 'Kevin picks up',
    players: withTurn(1),
    stage: GameViewStage.WAITING_FOR_PLAYER,
    step: GameStep.PICKUP_CARD,
  },
  {
    label: 'Kevin called Yaniv, Paul plays',
    players: withYanivCalledByKevin(2),
    stage: GameViewStage.WAITING_FOR_PLAYER,
    step: GameStep.PLAY_CARDS,
  },
  {
    label: 'Your last turn: play',
    players: withYanivCalledByKevin(0),
    stage: GameViewStage.PICKING_CARDS,
    step: GameStep.PLAY_CARDS,
  },
  {
    label: 'End of round: you deal',
    players: withYanivCalledByKevin(0),
    stage: GameViewStage.END_OF_ROUND,
    step: GameStep.REDEAL,
  },
  {
    label: 'Waiting for Kevin to deal',
    players: withYanivCalledByKevin(1),
    stage: GameViewStage.WAITING_FOR_NEW_ROUND,
    step: GameStep.REDEAL,
  },
] as const satisfies (Pick<GameProps, 'players' | 'stage' | 'step'> & {
  label: string;
})[];

/**
 * Steps through a round with the buttons over the header, keeping the game
 * mounted so its tabs switch as they would in play. Use it to check nothing
 * shifts between stages.
 */
export const StageWalkthrough: Story = {
  render: function Render(args) {
    const [stageIndex, setStageIndex] = useState(0);
    const stageCount = WALKTHROUGH_STAGES.length;
    const { label, ...stage } =
      WALKTHROUGH_STAGES[stageIndex] ?? WALKTHROUGH_STAGES[0];

    const moveBy = (offset: number) =>
      setStageIndex((index) => (index + offset + stageCount) % stageCount);

    return (
      <>
        <Game {...args} {...stage} />
        {/* Fixed over the header, so it takes no space in the layout */}
        <div className='fixed top-1 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-black/80 p-1 text-xs text-white'>
          <Button
            size='sm'
            variant='secondary'
            onClick={() => moveBy(-1)}
            aria-label='Previous stage'
          >
            <ArrowLeftIcon />
          </Button>
          <span className='w-36 text-center' aria-live='polite'>
            {stageIndex + 1}/{stageCount}: {label}
          </span>
          <Button
            size='sm'
            variant='secondary'
            onClick={() => moveBy(1)}
            aria-label='Next stage'
          >
            <ArrowRightIcon />
          </Button>
        </div>
      </>
    );
  },
};

export const DesktopStageWalkthrough: Story = {
  ...StageWalkthrough,
  globals: DESKTOP,
};

/* Larger screens ---------------------------------------------------------- */

/** Fills the window, so resizing it shows where the layout changes. */
export const Desktop: Story = { globals: DESKTOP };

export const DesktopRunSelected: Story = {
  args: runSelectedArgs,
  globals: DESKTOP,
};

export const DesktopOtherPlayersTurn: Story = {
  args: otherPlayersTurnArgs,
  globals: DESKTOP,
};

export const DesktopPickedUpCard: Story = {
  args: {
    stage: GameViewStage.END_TURN,
    step: GameStep.PROCEED,
    drawnCard: { suit: Suit.SPADES, rank: Rank.ACE },
  },
  globals: DESKTOP,
};

export const DesktopEndOfRound: Story = {
  args: { stage: GameViewStage.END_OF_ROUND, step: GameStep.REDEAL },
  globals: DESKTOP,
};
