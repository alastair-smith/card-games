import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import HandTotal from '.';

const defaultProps = {
  color: 'cyan' as const,
  handTotal: 16,
  isFiftyScoreHalved: false,
  totalScore: 0,
};

describe('HandTotal', () => {
  describe('hand total', () => {
    test('shows the hand total', () => {
      render(<HandTotal {...defaultProps} />);
      expect(screen.getByText('16')).toBeInTheDocument();
    });
  });

  describe('score note', () => {
    test('targets 50 when total score is below 50 and not yet halved', () => {
      render(<HandTotal {...defaultProps} totalScore={30} />);
      // away = 50 - 30 = 20
      expect(screen.getByText(/20 away from 50\./)).toBeInTheDocument();
    });

    test('targets 100 when fifty has been halved and total score is below 100', () => {
      render(
        <HandTotal
          {...defaultProps}
          isFiftyScoreHalved={true}
          totalScore={60}
        />,
      );
      // away = 100 - 60 = 40
      expect(screen.getByText(/40 away from 100\./)).toBeInTheDocument();
    });

    test('shows how much beyond the max has passed', () => {
      render(
        <HandTotal
          {...defaultProps}
          isFiftyScoreHalved={true}
          totalScore={120}
        />,
      );
      // beyond = 120 - 100
      expect(screen.getByText(/20 beyond 100\./)).toBeInTheDocument();
    });
  });
});
