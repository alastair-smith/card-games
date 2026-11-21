import { fireEvent, render, screen, within } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { buildTableCards } from '~/test-utils/shithead';
import { Rank, type StandardPlayingCard, Suit } from '~/types/cards';
import { GameStage, type TableCardSlot } from '~/types/games/shithead';
import { Hand } from '.';

const noop = () => {};

const FOUR_OF_CLUBS = { suit: Suit.CLUBS, rank: Rank.FOUR };
const NINE_OF_HEARTS = { suit: Suit.HEARTS, rank: Rank.NINE };
const NINE_OF_SPADES = { suit: Suit.SPADES, rank: Rank.NINE };
const QUEEN_OF_DIAMONDS = { suit: Suit.DIAMONDS, rank: Rank.QUEEN };

const HAND: StandardPlayingCard[] = [
  QUEEN_OF_DIAMONDS,
  NINE_OF_SPADES,
  FOUR_OF_CLUBS,
  NINE_OF_HEARTS,
];

const EMPTY_TABLE: TableCardSlot[] = buildTableCards().map(() => ({
  faceUpCard: null,
  hasFaceDownCard: false,
}));

const FACE_DOWN_ONLY: TableCardSlot[] = buildTableCards().map((slot) => ({
  ...slot,
  faceUpCard: null,
}));

// The table's 7 and King, with a 9 in place of the 10, which goes on any card
const FACE_UP_WITHOUT_TEN: TableCardSlot[] = buildTableCards().map((slot) =>
  slot.faceUpCard?.rank === Rank.TEN
    ? { ...slot, faceUpCard: { suit: Suit.DIAMONDS, rank: Rank.NINE } }
    : slot,
);

// 2s, 5s and 10s go on any card
const PLAYABLE_ON_ANYTHING = [Rank.TWO, Rank.FIVE, Rank.TEN];
const PLAYABLE_ON_NINE = [
  ...PLAYABLE_ON_ANYTHING,
  Rank.NINE,
  Rank.JACK,
  Rank.QUEEN,
  Rank.KING,
  Rank.ACE,
];
const PLAYABLE_ON_KING = [...PLAYABLE_ON_ANYTHING, Rank.KING, Rank.ACE];
const PLAYABLE_ON_ACE = [...PLAYABLE_ON_ANYTHING, Rank.ACE];

function renderHand(props: Partial<ComponentProps<typeof Hand>> = {}) {
  return render(
    <Hand
      color='cyan'
      gameStage={GameStage.IN_PROGRESS}
      cards={HAND}
      tableCards={buildTableCards()}
      isSwapConfirmed
      isPlayersTurn
      playableRanks={PLAYABLE_ON_NINE}
      onSwapCards={noop}
      onConfirmSwap={noop}
      onPlayCards={noop}
      onPickUpPile={noop}
      {...props}
    />,
  );
}

const cardButton = (name: string) => screen.getByRole('button', { name });

describe('Hand', () => {
  describe('swapping', () => {
    test('swaps a hand card with a face-up card', () => {
      const handleSwapCards = vi.fn();
      renderHand({
        gameStage: GameStage.SWAPPING,
        isSwapConfirmed: false,
        onSwapCards: handleSwapCards,
      });

      fireEvent.click(cardButton('Four of Clubs'));
      fireEvent.click(cardButton('King of Spades'));

      expect(handleSwapCards).toHaveBeenCalledExactlyOnceWith({
        handCard: FOUR_OF_CLUBS,
        faceUpCard: { suit: Suit.SPADES, rank: Rank.KING },
      });
    });

    test('swaps when the face-up card is chosen first', () => {
      const handleSwapCards = vi.fn();
      renderHand({
        gameStage: GameStage.SWAPPING,
        isSwapConfirmed: false,
        onSwapCards: handleSwapCards,
      });

      fireEvent.click(cardButton('King of Spades'));
      fireEvent.click(cardButton('Four of Clubs'));

      expect(handleSwapCards).toHaveBeenCalledOnce();
    });

    test('changes the chosen hand card rather than swapping two hand cards', () => {
      const handleSwapCards = vi.fn();
      renderHand({
        gameStage: GameStage.SWAPPING,
        isSwapConfirmed: false,
        onSwapCards: handleSwapCards,
      });

      fireEvent.click(cardButton('Four of Clubs'));
      fireEvent.click(cardButton('Queen of Diamonds'));

      expect(handleSwapCards).not.toHaveBeenCalled();
      expect(cardButton('Queen of Diamonds')).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      expect(cardButton('Four of Clubs')).toHaveAttribute(
        'aria-pressed',
        'false',
      );
    });

    test('confirms the swaps', () => {
      const handleConfirmSwap = vi.fn();
      renderHand({
        gameStage: GameStage.SWAPPING,
        isSwapConfirmed: false,
        onConfirmSwap: handleConfirmSwap,
      });

      fireEvent.click(screen.getByRole('button', { name: 'Confirm Cards' }));

      expect(handleConfirmSwap).toHaveBeenCalledOnce();
    });

    test('locks the cards once confirmed', () => {
      renderHand({ gameStage: GameStage.SWAPPING, isSwapConfirmed: true });
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('playing from the hand', () => {
    test('sorts the hand by rank, then suit', () => {
      renderHand({ isPlayersTurn: false });
      const cardNames = within(screen.getByRole('list', { name: 'Your hand' }))
        .getAllByRole('img')
        .map((card) => card.getAttribute('aria-label'));

      expect(cardNames).toEqual([
        'Four of Clubs',
        'Nine of Hearts',
        'Nine of Spades',
        'Queen of Diamonds',
      ]);
    });

    test('plays the chosen cards of a rank', () => {
      const handlePlayCards = vi.fn();
      renderHand({ onPlayCards: handlePlayCards });

      fireEvent.click(cardButton('Nine of Hearts'));
      fireEvent.click(cardButton('Nine of Spades'));
      fireEvent.click(screen.getByRole('button', { name: 'Play Cards' }));

      expect(handlePlayCards).toHaveBeenCalledExactlyOnceWith({
        source: 'hand',
        cards: [NINE_OF_HEARTS, NINE_OF_SPADES],
      });
    });

    test('starts again when a card of another rank is chosen', () => {
      const handlePlayCards = vi.fn();
      renderHand({ onPlayCards: handlePlayCards });

      fireEvent.click(cardButton('Nine of Hearts'));
      fireEvent.click(cardButton('Queen of Diamonds'));
      fireEvent.click(screen.getByRole('button', { name: 'Play Cards' }));

      expect(handlePlayCards).toHaveBeenCalledExactlyOnceWith({
        source: 'hand',
        cards: [QUEEN_OF_DIAMONDS],
      });
    });

    test('only lets cards that can be played be chosen', () => {
      renderHand();
      expect(
        screen.queryByRole('button', { name: 'Four of Clubs' }),
      ).not.toBeInTheDocument();
    });

    test('waits for a card to be chosen before playing', () => {
      renderHand();
      expect(screen.getByRole('button', { name: 'Play Cards' })).toBeDisabled();
    });

    test('picks up the pile when nothing in the hand can be played', () => {
      const handlePickUpPile = vi.fn();
      renderHand({
        playableRanks: PLAYABLE_ON_ACE,
        onPickUpPile: handlePickUpPile,
      });

      expect(
        screen.queryByRole('button', { name: 'Play Cards' }),
      ).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Pick Up Pile' }));

      expect(handlePickUpPile).toHaveBeenCalledOnce();
    });

    test('has no pick-up button when a card can be played', () => {
      renderHand();
      expect(
        screen.queryByRole('button', { name: 'Pick Up Pile' }),
      ).not.toBeInTheDocument();
    });

    test('has no buttons on another player’s turn', () => {
      renderHand({ isPlayersTurn: false });
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    test('marks out magic cards', () => {
      renderHand({
        cards: [{ suit: Suit.HEARTS, rank: Rank.TEN }],
        isPlayersTurn: false,
      });
      expect(
        screen.getByRole('img', { name: 'Ten of Hearts, magic card' }),
      ).toBeInTheDocument();
    });
  });

  describe('playing face-up cards', () => {
    test('shows the face-up cards once the hand is empty', () => {
      renderHand({ cards: [] });
      expect(
        screen.getByRole('heading', { name: 'Your face-up cards' }),
      ).toBeInTheDocument();
    });

    test('plays the chosen face-up card', () => {
      const handlePlayCards = vi.fn();
      renderHand({
        cards: [],
        playableRanks: PLAYABLE_ON_KING,
        onPlayCards: handlePlayCards,
      });

      fireEvent.click(cardButton('King of Spades'));
      fireEvent.click(screen.getByRole('button', { name: 'Play Cards' }));

      expect(handlePlayCards).toHaveBeenCalledExactlyOnceWith({
        source: 'faceUp',
        cards: [{ suit: Suit.SPADES, rank: Rank.KING }],
      });
    });

    test('picks up a chosen face-up card with the pile when none can be played', () => {
      const handlePlayCards = vi.fn();
      renderHand({
        cards: [],
        tableCards: FACE_UP_WITHOUT_TEN,
        playableRanks: PLAYABLE_ON_ACE,
        onPlayCards: handlePlayCards,
      });

      fireEvent.click(cardButton('Seven of Hearts'));
      fireEvent.click(screen.getByRole('button', { name: 'Pick Up Pile' }));

      expect(handlePlayCards).toHaveBeenCalledExactlyOnceWith({
        source: 'faceUp',
        cards: [{ suit: Suit.HEARTS, rank: Rank.SEVEN }],
      });
    });

    test('goes back to the hand after picking up', () => {
      const { rerender } = renderHand({ cards: [] });
      rerender(
        <Hand
          color='cyan'
          gameStage={GameStage.IN_PROGRESS}
          cards={HAND}
          tableCards={buildTableCards()}
          isSwapConfirmed
          isPlayersTurn
          playableRanks={PLAYABLE_ON_ACE}
          onSwapCards={noop}
          onConfirmSwap={noop}
          onPlayCards={noop}
          onPickUpPile={noop}
        />,
      );
      expect(
        screen.getByRole('heading', { name: 'Your hand' }),
      ).toBeInTheDocument();
    });
  });

  describe('playing face-down cards', () => {
    test('turns over one chosen face-down card', () => {
      const handlePlayCards = vi.fn();
      renderHand({
        cards: [],
        tableCards: FACE_DOWN_ONLY,
        onPlayCards: handlePlayCards,
      });

      fireEvent.click(cardButton('Face-down card 1'));
      fireEvent.click(cardButton('Face-down card 3'));
      fireEvent.click(screen.getByRole('button', { name: 'Play Card' }));

      expect(handlePlayCards).toHaveBeenCalledExactlyOnceWith({
        source: 'faceDown',
        slotIndex: 2,
      });
    });

    test('has no pick-up button', () => {
      renderHand({
        cards: [],
        tableCards: FACE_DOWN_ONLY,
        playableRanks: PLAYABLE_ON_ACE,
      });
      expect(
        screen.queryByRole('button', { name: 'Pick Up Pile' }),
      ).not.toBeInTheDocument();
    });
  });

  test('says when the player has played all their cards', () => {
    renderHand({ cards: [], tableCards: EMPTY_TABLE });
    expect(
      screen.getByText("You've played all your cards"),
    ).toBeInTheDocument();
  });
});
