import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { PlayerName } from '~/types/entities';
import ScoreCard from '.';

const defaultProps = {
  cardCount: 7,
  isFiftyScoreHalved: false,
  isHundredScoreHalved: false,
  name: 'Kevin' as PlayerName,
  score: 42,
  isYanivCalled: false,
};

describe('ScoreCard', () => {
  test('shows player name', () => {
    render(<ScoreCard {...defaultProps} />);
    expect(screen.getByText('Kevin')).toBeInTheDocument();
  });

  test('shows score', () => {
    render(<ScoreCard {...defaultProps} />);
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  test('shows card count and label when count is provided', () => {
    render(<ScoreCard {...defaultProps} cardCount={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('cards')).toBeInTheDocument();
  });

  test('hides card count when no count is provided', () => {
    render(<ScoreCard {...defaultProps} cardCount={null} />);
    expect(screen.queryByText('cards')).not.toBeInTheDocument();
  });

  test('shows halved indicator for 50 when fifty score has been halved', () => {
    render(<ScoreCard {...defaultProps} isFiftyScoreHalved={true} />);
    expect(screen.getAllByText(/score has been halved/)[0]).toBeInTheDocument();
  });

  test('shows not-halved indicator for 50 when fifty score has not been halved', () => {
    render(<ScoreCard {...defaultProps} isFiftyScoreHalved={false} />);
    expect(
      screen.getAllByText(/score has not been halved/)[0],
    ).toBeInTheDocument();
  });

  test('shows halved indicator for 100 when hundred score has been halved', () => {
    render(<ScoreCard {...defaultProps} isHundredScoreHalved={true} />);
    expect(screen.getAllByText(/score has been halved/)[0]).toBeInTheDocument();
  });

  test('shows Yaniv called marquee when Yaniv has been called', () => {
    render(<ScoreCard {...defaultProps} isYanivCalled={true} />);
    expect(screen.getAllByText(/has called Yaniv!/)[0]).toBeInTheDocument();
  });

  test('shows static name footer when Yaniv has not been called', () => {
    render(<ScoreCard {...defaultProps} isYanivCalled={false} />);
    expect(screen.queryByText(/has called Yaniv!/)).not.toBeInTheDocument();
    expect(screen.getByText('Kevin')).toBeInTheDocument();
  });

  test('announces whose turn it is when it is this player turn', () => {
    render(<ScoreCard {...defaultProps} isPlayersTurn={true} />);
    expect(screen.getByText("It's Kevin's turn")).toBeInTheDocument();
  });

  test('does not announce a turn when it is not this player turn', () => {
    render(<ScoreCard {...defaultProps} isPlayersTurn={false} />);
    expect(screen.queryByText(/turn/)).not.toBeInTheDocument();
  });
});
