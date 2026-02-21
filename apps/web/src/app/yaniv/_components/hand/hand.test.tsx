import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Rank, Suit } from '~/types/cards';
import Hand from '.';

vi.mock('~/components/ui/playing-card', () => ({
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
      data-testid={`card-${card.suit}-${card.rank}`}
      data-highlighted={highlighted}
      type='button'
      onClick={onClick}
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
  cards,
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
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('50.')).toBeInTheDocument();
    });

    test('targets 100 when fifty has been halved and total score is below 100', () => {
      render(
        <Hand {...defaultProps} isFiftyScoreHalved={true} totalScore={60} />,
      );
      // away = 100 - 60 = 40
      expect(screen.getByText('40')).toBeInTheDocument();
      expect(screen.getByText('100.')).toBeInTheDocument();
    });

    test('targets 200 when both milestones have been halved', () => {
      render(
        <Hand
          {...defaultProps}
          isFiftyScoreHalved={true}
          isHundredScoreHalved={true}
          totalScore={150}
        />,
      );
      // away = 200 - 150 = 50
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('200.')).toBeInTheDocument();
    });
  });

  describe('cards', () => {
    test('renders all cards in hand', () => {
      render(<Hand {...defaultProps} />);
      expect(
        screen.getByTestId(`card-${Suit.CLUBS}-${Rank.ACE}`),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`card-${Suit.HEARTS}-${Rank.FIVE}`),
      ).toBeInTheDocument();
      expect(
        screen.getByTestId(`card-${Suit.SPADES}-${Rank.KING}`),
      ).toBeInTheDocument();
    });

    test('calls the card handler with the clicked card', () => {
      const onCardClick = vi.fn();
      render(<Hand {...defaultProps} onCardClick={onCardClick} />);
      fireEvent.click(screen.getByTestId(`card-${Suit.CLUBS}-${Rank.ACE}`));
      expect(onCardClick).toHaveBeenCalledWith(cards[0]);
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
          .getByTestId(`card-${Suit.CLUBS}-${Rank.ACE}`)
          .getAttribute('data-highlighted'),
      ).toBe('true');
      expect(
        screen
          .getByTestId(`card-${Suit.HEARTS}-${Rank.FIVE}`)
          .getAttribute('data-highlighted'),
      ).toBe('false');
    });
  });
});
