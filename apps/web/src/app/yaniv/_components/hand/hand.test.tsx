import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import { Hand } from '.';

vi.mock('~/components/ui/playing-card', () => ({
  PlayingCard: ({
    card,
    highlighted,
    onClick,
  }: {
    card: { suit: string; rank: string } | null;
    highlighted?: boolean;
    onClick?: () => void;
  }) =>
    card ? (
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
    ) : (
      <div role='img' aria-label='Face down card' />
    ),
}));

// ACE=1, FIVE=5, KING=10 → total = 16
const cards = [
  { suit: Suit.CLUBS, rank: Rank.ACE },
  { suit: Suit.HEARTS, rank: Rank.FIVE },
  { suit: Suit.SPADES, rank: Rank.KING },
];

const noop = () => {};

const defaultProps = {
  color: 'cyan' as const,
  cards,
  handTotal: 16,
  isFiftyScoreHalved: false,
  totalScore: 0,
  isActive: false,
  isFaceDown: false,
  onVisibilityToggle: noop,
};

const getHand = () => screen.getByRole('list', { name: 'Your hand' });

describe('Hand', () => {
  describe('cards', () => {
    test('renders all cards in hand', () => {
      render(<Hand {...defaultProps} />);
      expect(within(getHand()).getAllByRole('button')).toHaveLength(3);
    });

    test('calls the card handler with the clicked card', () => {
      const handleCardClick = vi.fn();
      render(<Hand {...defaultProps} onCardClick={handleCardClick} />);
      fireEvent.click(
        screen.getByRole('button', { name: `${Rank.ACE} of ${Suit.CLUBS}` }),
      );
      expect(handleCardClick).toHaveBeenCalledWith(cards[0]);
    });

    test('renders cards in sorted order with highest rank first', () => {
      render(<Hand {...defaultProps} />);
      const buttons = within(getHand()).getAllByRole('button');
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
      expect(within(getHand()).getAllByRole('button')).toHaveLength(2);
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

  describe('summary', () => {
    test('shows the hand total', () => {
      render(<Hand {...defaultProps} />);
      expect(screen.getByLabelText('Hand total')).toHaveTextContent('16');
    });

    test('shows the total score', () => {
      render(<Hand {...defaultProps} totalScore={23} />);
      expect(screen.getByText('23')).toBeInTheDocument();
    });

    test('shows how far the score is from being halved at 50', () => {
      render(<Hand {...defaultProps} totalScore={23} />);
      expect(screen.getByText('27 points to 50')).toBeInTheDocument();
    });

    test('counts towards 100 once the 50 score has been halved', () => {
      render(<Hand {...defaultProps} totalScore={30} isFiftyScoreHalved />);
      expect(screen.getByText('70 points to 100')).toBeInTheDocument();
    });

    test('counts past 100 once the score goes over it', () => {
      render(<Hand {...defaultProps} totalScore={104} isFiftyScoreHalved />);
      expect(screen.getByText('4 points past 100')).toBeInTheDocument();
    });
  });

  describe('face down', () => {
    test('turns every card face down', () => {
      render(<Hand {...defaultProps} isFaceDown />);
      expect(within(getHand()).queryAllByRole('button')).toHaveLength(0);
      expect(within(getHand()).getAllByRole('img')).toHaveLength(3);
    });

    test('hides the hand total', () => {
      render(<Hand {...defaultProps} isFaceDown />);
      expect(screen.getByText(', hidden')).toBeInTheDocument();
      expect(screen.getByLabelText('Hand total')).toHaveClass('invisible');
    });

    test('still shows the total score', () => {
      render(<Hand {...defaultProps} totalScore={23} isFaceDown />);
      expect(screen.getByText('23')).toBeInTheDocument();
    });

    test('calls the visibility handler when visibility is toggled', () => {
      const handleVisibilityToggle = vi.fn();
      render(
        <Hand {...defaultProps} onVisibilityToggle={handleVisibilityToggle} />,
      );
      fireEvent.click(
        screen.getByRole('button', { name: /Toggle visibility/ }),
      );
      expect(handleVisibilityToggle).toHaveBeenCalledOnce();
    });
  });
});
