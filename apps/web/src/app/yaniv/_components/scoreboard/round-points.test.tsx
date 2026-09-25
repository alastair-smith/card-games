import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { buildRoundScore } from '~/test-utils/yaniv';
import { RoundPoints } from './round-points';

describe('RoundPoints', () => {
  describe('points', () => {
    test('shows only the points when they match the hand value', () => {
      const { container } = render(
        <RoundPoints roundScore={buildRoundScore({ original: 8 })} />,
      );
      expect(container).toHaveTextContent(/^8$/);
    });
  });

  describe('hand value', () => {
    test('shows the hand value when a penalty replaced it', () => {
      render(
        <RoundPoints
          roundScore={buildRoundScore({ original: 7, adjusted: 30 })}
        />,
      );
      expect(screen.getByText('(7)')).toBeInTheDocument();
      expect(screen.getByText(', hand worth 7')).toBeInTheDocument();
    });

    test('shows the hand value when a Yaniv call scored nothing', () => {
      render(
        <RoundPoints
          roundScore={buildRoundScore({ original: 5, adjusted: 0 })}
        />,
      );
      expect(screen.getByText('(5)')).toBeInTheDocument();
    });
  });

  describe('halving', () => {
    test('shows how much the score dropped when it was halved', () => {
      render(
        <RoundPoints
          roundScore={buildRoundScore({ original: 12, halvedBy: 25 })}
        />,
      );
      expect(screen.getByText('(−25)')).toBeInTheDocument();
      expect(screen.getByText(', score halved by 25')).toBeInTheDocument();
    });

    test('shows the hand value and the drop together', () => {
      const { container } = render(
        <RoundPoints
          roundScore={buildRoundScore({
            original: 7,
            adjusted: 30,
            halvedBy: 50,
          })}
        />,
      );
      expect(container).toHaveTextContent(
        '30(7), hand worth 7(−50), score halved by 50',
      );
    });
  });
});
