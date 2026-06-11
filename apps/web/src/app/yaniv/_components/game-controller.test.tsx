import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { toast } from '~/components/ui/toast';
import type { ClientGameState } from '~/server/state/game/yaniv/get-game-state';
import { Rank, Suit } from '~/types/cards';
import type { PlayerName, UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import { GameStage, GameStep, GameViewStage } from '~/types/games/yaniv';
import YanivGameController from './game-controller';

vi.mock('~/components/ui/toast', () => ({
  toast: { info: vi.fn(), error: vi.fn(), success: vi.fn() },
}));

const mutate = vi.fn();
vi.mock('~/trpc/react', () => ({
  api: {
    yaniv: {
      playCards: { useMutation: () => ({ mutate }) },
      pickupCard: { useMutation: () => ({ mutate }) },
      callYaniv: { useMutation: () => ({ mutate }) },
      startNewRound: { useMutation: () => ({ mutate }) },
      endTurn: { useMutation: () => ({ mutate }) },
      triggerEmoji: { useMutation: () => ({ mutate }) },
    },
  },
}));

let capturedGameProps: Record<string, unknown> = {};
vi.mock('./game', () => ({
  default: (props: Record<string, unknown>) => {
    capturedGameProps = props;
    return (
      <div data-testid='game'>
        <button
          type='button'
          data-testid='play-cards'
          onClick={() => (props.onPlayCards as () => void)()}
        />
        <button
          type='button'
          data-testid='yaniv'
          onClick={props.onYanivClick as () => void}
        />
        <button
          type='button'
          data-testid='end-turn'
          onClick={props.onEndTurnClick as () => void}
        />
        <button
          type='button'
          data-testid='pickup-from-discard'
          onClick={props.onPickupFromDiscard as () => void}
        />
        <button
          type='button'
          data-testid='play-ascending'
          onClick={() =>
            (
              props.onPlayCards as (
                direction: 'ascending' | 'descending',
              ) => void
            )('ascending')
          }
        />
        <button
          type='button'
          data-testid='play-descending'
          onClick={() =>
            (
              props.onPlayCards as (
                direction: 'ascending' | 'descending',
              ) => void
            )('descending')
          }
        />
      </div>
    );
  },
}));

vi.mock('./game-over', () => ({
  default: () => <div data-testid='game-over' />,
}));

const USER_ID = 'user-1' as UserId;
const OPPONENT_ID = 'user-2' as UserId;
const CODE = 'ABCD' as GameCode;

const basePlayer = {
  cardCount: 5,
  isFiftyScoreHalved: false,
  isHundredScoreHalved: false,
  score: 0,
  roundScore: { original: 0, adjusted: 0 },
  isYanivCalled: false,
};

const players = [
  { ...basePlayer, id: USER_ID, name: 'Alice' as PlayerName, isUser: true },
  { ...basePlayer, id: OPPONENT_ID, name: 'Bob' as PlayerName, isUser: false },
];

function inProgressState(
  overrides: Partial<{
    gameStep: GameStep;
    currentPlayerId: UserId;
    hand: { suit: Suit; rank: Rank }[];
    playedCards: { suit: Suit; rank: Rank }[];
    topDiscardCard: { suit: Suit; rank: Rank } | null;
    drawnCard: { suit: Suit; rank: Rank };
    deckOnlyPickup: boolean;
  }> = {},
): ClientGameState {
  return {
    gameStage: GameStage.IN_PROGRESS,
    gameStep: GameStep.PLAY_CARDS,
    currentPlayerId: USER_ID,
    hand: [
      { suit: Suit.HEARTS, rank: Rank.KING },
      { suit: Suit.SPADES, rank: Rank.QUEEN },
    ],
    playedCards: [],
    topDiscardCard: { suit: Suit.CLUBS, rank: Rank.FOUR },
    players,
    ...overrides,
  } as ClientGameState;
}

const baseProps = {
  code: CODE,
  reactions: {},
};

afterEach(() => {
  vi.mocked(toast.info).mockClear();
  mutate.mockClear();
});

describe('YanivGameController', () => {
  describe('stage derivation', () => {
    test('derives waiting for player stage when it is not your turn', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({ currentPlayerId: OPPONENT_ID })}
        />,
      );
      expect(capturedGameProps.stage).toBe(GameViewStage.WAITING_FOR_PLAYER);
    });

    test('derives picking cards stage during play cards step', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({ gameStep: GameStep.PLAY_CARDS })}
        />,
      );
      expect(capturedGameProps.stage).toBe(GameViewStage.PICKING_CARDS);
    });

    test('derives drawing cards stage during pickup card step', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({ gameStep: GameStep.PICKUP_CARD })}
        />,
      );
      expect(capturedGameProps.stage).toBe(GameViewStage.DRAWING_CARDS);
    });

    test('derives end turn stage during proceed step', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({ gameStep: GameStep.PROCEED })}
        />,
      );
      expect(capturedGameProps.stage).toBe(GameViewStage.END_TURN);
    });

    test('derives end of round stage during redeal when it is your turn', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({ gameStep: GameStep.REDEAL })}
        />,
      );
      expect(capturedGameProps.stage).toBe(GameViewStage.END_OF_ROUND);
    });

    test('derives waiting for new round stage during redeal when it is not your turn', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({
            gameStep: GameStep.REDEAL,
            currentPlayerId: OPPONENT_ID,
          })}
        />,
      );
      expect(capturedGameProps.stage).toBe(GameViewStage.WAITING_FOR_NEW_ROUND);
    });
  });

  describe('playing cards', () => {
    test('shows a toast when no cards are selected', () => {
      render(
        <YanivGameController {...baseProps} gameState={inProgressState()} />,
      );
      fireEvent.click(screen.getByTestId('play-cards'));
      expect(toast.info).toHaveBeenCalledWith(
        'Select at least one card to play',
      );
      expect(mutate).not.toHaveBeenCalled();
    });

    test('sends only suit and rank in the mutation payload', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({
            hand: [{ suit: Suit.HEARTS, rank: Rank.THREE }],
            topDiscardCard: null,
          })}
        />,
      );

      const toggle = capturedGameProps.onCardToggle as (card: unknown) => void;
      act(() =>
        toggle({
          suit: Suit.HEARTS,
          rank: Rank.THREE,
          selected: false,
          hidden: false,
        }),
      );

      fireEvent.click(screen.getByTestId('play-cards'));

      expect(mutate).toHaveBeenCalledWith({
        code: CODE,
        cards: [{ suit: Suit.HEARTS, rank: Rank.THREE }],
      });
    });

    test('shows a toast for an invalid card combination', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({
            hand: [
              { suit: Suit.HEARTS, rank: Rank.THREE },
              { suit: Suit.SPADES, rank: Rank.KING },
            ],
            topDiscardCard: { suit: Suit.CLUBS, rank: Rank.FOUR },
          })}
        />,
      );

      // Select both cards (different suits and ranks — not a valid combo)
      const toggle = capturedGameProps.onCardToggle as (card: {
        suit: Suit;
        rank: Rank;
      }) => void;
      act(() => toggle({ suit: Suit.HEARTS, rank: Rank.THREE }));
      act(() => toggle({ suit: Suit.SPADES, rank: Rank.KING }));

      fireEvent.click(screen.getByTestId('play-cards'));
      expect(toast.info).toHaveBeenCalledWith(
        "You can't play that combination of cards",
      );
    });
  });

  describe('run direction', () => {
    const runHand = [
      { suit: Suit.HEARTS, rank: Rank.THREE },
      { suit: Suit.HEARTS, rank: Rank.FOUR },
      { suit: Suit.HEARTS, rank: Rank.FIVE },
    ];

    test('signals a run is selected when all selected cards form a standalone run', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({ hand: runHand })}
        />,
      );
      const toggle = capturedGameProps.onCardToggle as (card: unknown) => void;
      act(() => toggle(runHand[0]));
      act(() => toggle(runHand[1]));
      act(() => toggle(runHand[2]));
      expect(capturedGameProps.isRunSelected).toBe(true);
    });

    test('signals a run is selected when 2 cards form a run extension shape', () => {
      const extensionHand = [
        { suit: Suit.HEARTS, rank: Rank.FOUR },
        { suit: Suit.HEARTS, rank: Rank.FIVE },
      ];
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({ hand: extensionHand })}
        />,
      );
      const toggle = capturedGameProps.onCardToggle as (card: unknown) => void;
      act(() => toggle(extensionHand[0]));
      act(() => toggle(extensionHand[1]));
      expect(capturedGameProps.isRunSelected).toBe(true);
    });

    test('does not signal a run when selected cards are not a run', () => {
      render(
        <YanivGameController {...baseProps} gameState={inProgressState()} />,
      );
      const toggle = capturedGameProps.onCardToggle as (card: unknown) => void;
      act(() => toggle({ suit: Suit.HEARTS, rank: Rank.KING }));
      expect(capturedGameProps.isRunSelected).toBe(false);
    });

    test('shows other-direction toast when a run extension is played in the wrong direction', () => {
      // discard is SIX of hearts — sits above FOUR+FIVE, so only descending is valid
      const extensionHand = [
        { suit: Suit.HEARTS, rank: Rank.FOUR },
        { suit: Suit.HEARTS, rank: Rank.FIVE },
      ];
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({
            hand: extensionHand,
            topDiscardCard: { suit: Suit.HEARTS, rank: Rank.SIX },
          })}
        />,
      );
      const toggle = capturedGameProps.onCardToggle as (card: unknown) => void;
      act(() => toggle(extensionHand[0]));
      act(() => toggle(extensionHand[1]));
      fireEvent.click(screen.getByTestId('play-ascending'));
      expect(toast.info).toHaveBeenCalledWith(
        'Run is only valid in the other direction as it depends on the discard card.',
      );
      expect(mutate).not.toHaveBeenCalled();
    });

    test('calls the mutation with ascending direction when play ascending is clicked', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({ hand: runHand, topDiscardCard: null })}
        />,
      );
      const toggle = capturedGameProps.onCardToggle as (card: unknown) => void;
      act(() => toggle(runHand[0]));
      act(() => toggle(runHand[1]));
      act(() => toggle(runHand[2]));
      fireEvent.click(screen.getByTestId('play-ascending'));
      expect(mutate).toHaveBeenCalledWith({
        code: CODE,
        cards: runHand,
        direction: 'ascending',
      });
    });

    test('calls the mutation with descending direction when play descending is clicked', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({ hand: runHand, topDiscardCard: null })}
        />,
      );
      const toggle = capturedGameProps.onCardToggle as (card: unknown) => void;
      act(() => toggle(runHand[0]));
      act(() => toggle(runHand[1]));
      act(() => toggle(runHand[2]));
      fireEvent.click(screen.getByTestId('play-descending'));
      expect(mutate).toHaveBeenCalledWith({
        code: CODE,
        cards: runHand,
        direction: 'descending',
      });
    });
  });

  describe('picking up a card', () => {
    test('shows a toast and does not pick up when discard is clicked after a run extension', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({
            gameStep: GameStep.PICKUP_CARD,
            deckOnlyPickup: true,
          })}
        />,
      );
      fireEvent.click(screen.getByTestId('pickup-from-discard'));
      expect(toast.info).toHaveBeenCalledWith(
        'The discard card is part of your run, you can only pick up from the deck',
      );
      expect(mutate).not.toHaveBeenCalled();
    });
  });

  describe('ending turn', () => {
    test('shows a toast when ending turn with no cards in hand', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({
            gameStep: GameStep.PROCEED,
            hand: [],
          })}
        />,
      );
      fireEvent.click(screen.getByTestId('end-turn'));
      expect(toast.info).toHaveBeenCalledWith(
        'You must call Yaniv when you have no cards',
      );
      expect(mutate).not.toHaveBeenCalled();
    });
  });

  describe('calling Yaniv', () => {
    test('shows a toast when hand total is above the threshold', () => {
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({
            gameStep: GameStep.PROCEED,
            hand: [
              { suit: Suit.HEARTS, rank: Rank.KING },
              { suit: Suit.SPADES, rank: Rank.QUEEN },
            ],
          })}
        />,
      );
      fireEvent.click(screen.getByTestId('yaniv'));
      expect(toast.info).toHaveBeenCalledWith(
        'You need a hand total of 7 or less to call Yaniv',
      );
      expect(mutate).not.toHaveBeenCalled();
    });

    test('calls the mutation when hand total is at the threshold', () => {
      mutate.mockClear();
      render(
        <YanivGameController
          {...baseProps}
          gameState={inProgressState({
            gameStep: GameStep.PROCEED,
            hand: [
              { suit: Suit.HEARTS, rank: Rank.THREE },
              { suit: Suit.SPADES, rank: Rank.FOUR },
            ],
          })}
        />,
      );
      fireEvent.click(screen.getByTestId('yaniv'));
      expect(toast.info).not.toHaveBeenCalled();
      expect(mutate).toHaveBeenCalledWith({ code: CODE });
    });
  });

  describe('game over', () => {
    test('renders the game over screen when the game is finished', () => {
      const finishedState = {
        gameStage: GameStage.FINISHED,
        winners: [USER_ID],
        hand: [],
        players,
      } as ClientGameState;

      render(<YanivGameController {...baseProps} gameState={finishedState} />);
      expect(screen.getByTestId('game-over')).toBeInTheDocument();
    });
  });
});
