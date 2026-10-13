import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { PlayerName, UserId } from '~/types/entities';
import Setup from '.';

const ADA_ID = crypto.randomUUID() as UserId;
const UNNAMED_ID = crypto.randomUUID() as UserId;

const players = [
  { id: ADA_ID, name: 'Ada' as PlayerName },
  { id: UNNAMED_ID, name: '' as PlayerName },
];

const noop = vi.fn();

const renderSetup = (
  handlers: Partial<{
    errors: Partial<Record<UserId, string>>;
    updatePlayerName: (playerId: UserId, newName: PlayerName) => void;
    reorderPlayers: (newPlayerIds: string[]) => void;
    removePlayer: (playerId: UserId) => void;
    addPlayer: (name: PlayerName) => void;
  }> = {},
) =>
  render(
    <Setup
      players={players}
      errors={handlers.errors}
      updatePlayerName={handlers.updatePlayerName ?? noop}
      reorderPlayers={handlers.reorderPlayers ?? noop}
      removePlayer={handlers.removePlayer ?? noop}
      addPlayer={handlers.addPlayer ?? noop}
    />,
  );

describe('Setup', () => {
  test('names the button that removes a player', () => {
    renderSetup();

    expect(
      screen.getByRole('button', { name: 'Remove Ada' }),
    ).toBeInTheDocument();
  });

  test('names the button that removes a player who is yet to be named', () => {
    renderSetup();

    expect(
      screen.getByRole('button', { name: 'Remove this player' }),
    ).toBeInTheDocument();
  });

  test('names the button that adds a player', () => {
    renderSetup();

    expect(
      screen.getByRole('button', { name: 'Add player' }),
    ).toBeInTheDocument();
  });

  test('removes the player it was asked to', () => {
    const handleRemovePlayer = vi.fn();
    renderSetup({ removePlayer: handleRemovePlayer });

    fireEvent.click(screen.getByRole('button', { name: 'Remove Ada' }));

    expect(handleRemovePlayer).toHaveBeenCalledWith(ADA_ID);
  });

  test('says which player still needs a name when asked', () => {
    renderSetup({
      errors: { [UNNAMED_ID]: 'Enter a name for this player' },
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Enter a name for this player',
    );
  });

  test('marks the box a missing name belongs in', () => {
    renderSetup({
      errors: { [UNNAMED_ID]: 'Enter a name for this player' },
    });

    expect(screen.getByLabelText('Player 2 name')).toBeInvalid();
    expect(screen.getByLabelText('Player 1 name')).toBeValid();
  });

  test('adds a player waiting to be named', () => {
    const handleAddPlayer = vi.fn();
    renderSetup({ addPlayer: handleAddPlayer });

    fireEvent.click(screen.getByRole('button', { name: 'Add player' }));

    expect(handleAddPlayer).toHaveBeenCalledWith('');
  });
});
