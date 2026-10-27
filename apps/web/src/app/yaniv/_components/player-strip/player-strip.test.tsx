import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { buildClientPlayer } from '~/test-utils/yaniv';
import type { PlayerName, UserId } from '~/types/entities';
import { GameStep } from '~/types/games/yaniv';
import { PlayerStrip } from '.';

const players = [
  buildClientPlayer({ id: '1' as UserId, name: 'Alice' as PlayerName }),
  {
    ...buildClientPlayer({ id: '2' as UserId, name: 'Bob' as PlayerName }),
    isPlayersTurn: true,
  },
];

describe('PlayerStrip', () => {
  test('lists every player', () => {
    render(
      <PlayerStrip
        players={players}
        userId={'1' as UserId}
        step={GameStep.PLAY_CARDS}
      />,
    );
    const items = within(
      screen.getByRole('list', { name: 'Players' }),
    ).getAllByRole('listitem');
    expect(items).toHaveLength(2);
  });

  test('marks whose turn it is', () => {
    render(
      <PlayerStrip
        players={players}
        userId={'1' as UserId}
        step={GameStep.PLAY_CARDS}
      />,
    );
    const currentPlayer = screen
      .getAllByRole('listitem')
      .find((item) => item.getAttribute('aria-current') === 'step');
    expect(currentPlayer).toHaveTextContent('Bob');
    expect(currentPlayer).toHaveTextContent('their turn');
  });

  test('says what the player taking their turn is doing', () => {
    render(
      <PlayerStrip
        players={players}
        userId={'1' as UserId}
        step={GameStep.PICKUP_CARD}
      />,
    );
    expect(screen.getByText('Bob needs to pick up')).toBeInTheDocument();
  });
});
