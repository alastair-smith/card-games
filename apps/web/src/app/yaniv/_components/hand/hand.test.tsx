import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import { DEFAULT_HAND_SIZE } from '~/types/games/yaniv';
import Hand from '.';

vi.mock('~/components/ui/playing-card', () => ({
  PLAYING_CARD_PROPORTIONS: 'w-[3.75em] h-[5.25em]',
  PlayingCard: ({
    card,
    highlighted,
    onClick,
  }: {
    card: { suit: string; rank: string };
    highlighted?: boolean;
    onClick?: () => void;
  }) => (
    <button
      data-suit={card.suit}
      data-rank={card.rank}
      data-highlighted={highlighted}
      type='button'
      onClick={onClick}
      aria-label={`${card.rank} of ${card.suit}`}
    >
      {card.rank}
    </button>
  ),
}));

// ACE=1, FIVE=5, KING=10 → total = 16
const cards = [
  { suit: Suit.CLUBS, rank: Rank.ACE },
  { suit: Suit.HEARTS, rank: Rank.FIVE },
  { suit: Suit.SPADES, rank: Rank.KING },
];

const defaultProps = {
  color: 'cyan' as const,
  cards,
  handSize: DEFAULT_HAND_SIZE,
  handTotal: 16,
  isFiftyScoreHalved: false,
  totalScore: 0,
};

describe('Hand', () => {
  describe('cards', () => {
    test('renders all cards in hand', () => {
      render(<Hand {...defaultProps} />);
      const hand = screen.getByRole('list', { name: 'Your hand' });
      const buttons = within(hand).getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    test('calls the card handler with the clicked card', () => {
      const onCardClick = vi.fn();
      render(<Hand {...defaultProps} onCardClick={onCardClick} />);
      fireEvent.click(
        screen.getByRole('button', { name: `${Rank.ACE} of ${Suit.CLUBS}` }),
      );
      expect(onCardClick).toHaveBeenCalledWith(cards[0]);
    });

    test('renders cards in sorted order with highest rank first', () => {
      render(<Hand {...defaultProps} />);
      const hand = screen.getByRole('list', { name: 'Your hand' });
      const buttons = within(hand).getAllByRole('button');
      // defaultProps cards: ACE of CLUBS, FIVE of HEARTS, KING of SPADES
      // sorted order: KING, FIVE, ACE
      expect(buttons[0]?.getAttribute('data-rank')).toBe(String(Rank.KING));
      expect(buttons[1]?.getAttribute('data-rank')).toBe(String(Rank.FIVE));
      expect(buttons[2]?.getAttribute('data-rank')).toBe(String(Rank.ACE));
    });

    test('does not render a hidden card in the hand', () => {
      const cardsWithHidden = [
        // biome-ignore lint/style/noNonNullAssertion: test data is guaranteed to be present
        { ...cards[0]!, hidden: true },
        // biome-ignore lint/style/noNonNullAssertion: test data is guaranteed to be present
        { ...cards[1]! },
        // biome-ignore lint/style/noNonNullAssertion: test data is guaranteed to be present
        { ...cards[2]! },
      ];
      render(<Hand {...defaultProps} cards={cardsWithHidden} />);
      const hand = screen.getByRole('list', { name: 'Your hand' });
      const buttons = within(hand).getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    test('passes highlighted state to selected cards', () => {
      const cardsWithSelection = [
        // biome-ignore lint/style/noNonNullAssertion: test data is guaranteed to be present
        { ...cards[0]!, selected: true },
        // biome-ignore lint/style/noNonNullAssertion: test data is guaranteed to be present
        { ...cards[1]!, selected: false },
        // biome-ignore lint/style/noNonNullAssertion: test data is guaranteed to be present
        { ...cards[2]!, selected: false },
      ];
      render(<Hand {...defaultProps} cards={cardsWithSelection} />);
      expect(
        screen
          .getByRole('button', { name: `${Rank.ACE} of ${Suit.CLUBS}` })
          .getAttribute('data-highlighted'),
      ).toBe('true');
      expect(
        screen
          .getByRole('button', { name: `${Rank.FIVE} of ${Suit.HEARTS}` })
          .getAttribute('data-highlighted'),
      ).toBe('false');
    });
  });

  describe('layout', () => {
    const getSlots = () =>
      within(screen.getByRole('list', { name: 'Your hand' })).getAllByRole(
        'listitem',
        { hidden: true },
      );

    test('keeps space for a full hand of five', () => {
      render(<Hand {...defaultProps} handSize={5} />);
      expect(getSlots()).toHaveLength(5);
    });

    test('keeps space for a full hand of seven', () => {
      render(<Hand {...defaultProps} handSize={7} />);
      expect(getSlots()).toHaveLength(7);
    });

    test('keeps no spare space when holding more cards than were dealt', () => {
      const pickedUpCards = [
        ...cards,
        { suit: Suit.CLUBS, rank: Rank.TWO },
        { suit: Suit.HEARTS, rank: Rank.THREE },
        { suit: Suit.SPADES, rank: Rank.FOUR },
        { suit: Suit.DIAMONDS, rank: Rank.SIX },
      ];
      render(<Hand {...defaultProps} cards={pickedUpCards} handSize={5} />);
      expect(getSlots()).toHaveLength(pickedUpCards.length);
    });
  });
});
