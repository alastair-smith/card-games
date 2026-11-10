import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import HalvingMarkers from '.';

describe('HalvingMarkers', () => {
  test('marks both totals as still to come for a player who has not been halved', () => {
    render(
      <HalvingMarkers
        isFiftyScoreHalved={false}
        isHundredScoreHalved={false}
      />,
    );

    expect(
      screen.getByText('50 score has not been halved'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('100 score has not been halved'),
    ).toBeInTheDocument();
  });

  test('marks fifty as halved for a player who has been halved there', () => {
    render(<HalvingMarkers isFiftyScoreHalved isHundredScoreHalved={false} />);

    expect(screen.getByText('50 score has been halved')).toBeInTheDocument();
    expect(
      screen.getByText('100 score has not been halved'),
    ).toBeInTheDocument();
  });

  test('marks a hundred as halved for a player who has been halved there', () => {
    render(<HalvingMarkers isFiftyScoreHalved isHundredScoreHalved />);

    expect(screen.getByText('100 score has been halved')).toBeInTheDocument();
  });
});
