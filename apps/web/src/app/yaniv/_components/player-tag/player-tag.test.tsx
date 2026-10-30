import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { EmojiReactionId, PlayerName } from '~/types/entities';
import { PlayerTag } from '.';

const baseProps = {
  name: 'Kevin' as PlayerName,
  color: 'cyan' as const,
  cardCount: 5,
  isUser: false,
  isPlayersTurn: false,
  isYanivCalled: false,
};

describe('PlayerTag', () => {
  test('shows the player’s name in full', () => {
    render(<PlayerTag {...baseProps} name={'WWWWWWWWWWWW' as PlayerName} />);
    expect(screen.getByText('WWWWWWWWWWWW')).toBeInTheDocument();
  });

  test('shows how many cards they hold', () => {
    render(<PlayerTag {...baseProps} />);
    expect(screen.getByText(', 5 cards', { exact: false })).toBeInTheDocument();
  });

  test('marks your own tag', () => {
    render(<PlayerTag {...baseProps} isUser />);
    expect(screen.getByText('You:')).toBeInTheDocument();
  });

  test('does not mark other players’ tags as yours', () => {
    render(<PlayerTag {...baseProps} />);
    expect(screen.queryByText('You:')).not.toBeInTheDocument();
  });

  describe('Yaniv called', () => {
    test('shows a Yaniv sticker on the caller’s tag', () => {
      render(<PlayerTag {...baseProps} isYanivCalled />);
      expect(screen.getByText('Yaniv!')).toBeInTheDocument();
      expect(screen.getByText(', has called Yaniv')).toBeInTheDocument();
    });

    test('shows no sticker before Yaniv is called', () => {
      render(<PlayerTag {...baseProps} />);
      expect(screen.queryByText('Yaniv!')).not.toBeInTheDocument();
    });
  });

  test('shows an emoji reaction over the tag', () => {
    render(
      <PlayerTag
        {...baseProps}
        emojiReaction={{ emoji: '🎉', id: 'reaction-1' as EmojiReactionId }}
      />,
    );
    expect(screen.getByText('🎉')).toBeInTheDocument();
  });
});
