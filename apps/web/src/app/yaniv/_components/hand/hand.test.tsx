import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
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
  handTotal: 16,
  isFiftyScoreHalved: false,
  isHundredScoreHalved: false,
  totalScore: 0,
};

describe('Hand', () => {
  describe('hand total', () => {
    test('shows the sum of card values', () => {
      render(<Hand {...defaultProps} />);
      expect(screen.getByText('16')).toBeInTheDocument();
    });
  });

  describe('score note', () => {
    test('targets 50 when total score is below 50 and not yet halved', () => {
      render(<Hand {...defaultProps} totalScore={30} />);
      // away = 50 - 30 = 20
      expect(screen.getByText(/20 away from 50\./)).toBeInTheDocument();
    });

    test('targets 100 when fifty has been halved and total score is below 100', () => {
      render(
        <Hand {...defaultProps} isFiftyScoreHalved={true} totalScore={60} />,
      );
      // away = 100 - 60 = 40
      expect(screen.getByText(/40 away from 100\./)).toBeInTheDocument();
    });

    test('still targets 100 when both milestones have been halved', () => {
      render(
        <Hand {...defaultProps} isFiftyScoreHalved={true} totalScore={60} />,
      );
      // away = 100 - 60 = 40
      expect(screen.getByText(/40 away from 100\./)).toBeInTheDocument();
    });

    test('shows how much beyond the max has passed', () => {
      render(
        <Hand {...defaultProps} isFiftyScoreHalved={true} totalScore={120} />,
      );
      // beyond = 120 - 100
      expect(screen.getByText(/20 beyond 100\./)).toBeInTheDocument();
    });
  });

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
});
