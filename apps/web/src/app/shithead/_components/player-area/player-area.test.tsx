import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { buildTableCards } from '~/test-utils/shithead';
import type { EmojiReactionId, PlayerName } from '~/types/entities';
import { PlayerArea } from '.';

const baseProps = {
  name: 'Kevin' as PlayerName,
  color: 'cyan' as const,
  cardCount: 3,
  isUser: false,
  isPlayersTurn: false,
  tableCards: buildTableCards(),
  finishingPosition: null,
};

describe('PlayerArea', () => {
  test('shows the player’s name and how many cards they hold', () => {
    render(<PlayerArea {...baseProps} />);
    expect(screen.getByText('Kevin')).toBeInTheDocument();
    expect(screen.getByText(', 3 cards', { exact: false })).toBeInTheDocument();
  });

  test('marks your own area', () => {
    render(<PlayerArea {...baseProps} isUser />);
    expect(screen.getByText('You:')).toBeInTheDocument();
  });

  test('says when it is the player’s turn', () => {
    render(<PlayerArea {...baseProps} isPlayersTurn />);
    expect(screen.getByText(', their turn')).toBeInTheDocument();
  });

  test('does not announce a turn for other players', () => {
    render(<PlayerArea {...baseProps} />);
    expect(screen.queryByText(', their turn')).not.toBeInTheDocument();
  });

  test('shows an emoji reaction', () => {
    render(
      <PlayerArea
        {...baseProps}
        emojiReaction={{ emoji: '🎉', id: 'reaction-1' as EmojiReactionId }}
      />,
    );
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });

  test('describes the cards on the table', () => {
    render(<PlayerArea {...baseProps} />);
    expect(screen.getByText(/Face up: Seven of Hearts/)).toBeInTheDocument();
  });

  describe('when the player has run out of cards', () => {
    const finishedProps = {
      ...baseProps,
      cardCount: 0,
      tableCards: buildTableCards().map(() => ({
        faceUpCard: null,
        hasFaceDownCard: false,
      })),
    };

    test.each([
      [1, '1st', '🥇'],
      [2, '2nd', '🥈'],
      [3, '3rd', '🥉'],
    ] as const)('shows a medal for finishing %i', (position, label, medal) => {
      render(<PlayerArea {...finishedProps} finishingPosition={position} />);
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(medal)).toBeInTheDocument();
    });

    test.each([
      [4, '4th'],
      [5, '5th'],
    ] as const)('shows finishing %i without a medal', (position, label) => {
      render(<PlayerArea {...finishedProps} finishingPosition={position} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });

    test('replaces the card count with the finishing position', () => {
      render(<PlayerArea {...finishedProps} finishingPosition={1} />);
      expect(screen.queryByText(/cards$/)).not.toBeInTheDocument();
    });
  });
});
