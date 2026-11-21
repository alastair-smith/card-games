import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { EmojiReactionId } from '~/types/entities';
import {
  PlayerTag,
  PlayerTagCardCount,
  PlayerTagHostIcon,
  PlayerTagReaction,
  PlayerTagUserIcon,
} from '.';

describe('PlayerTag', () => {
  test('tells screen readers the player is the host', () => {
    render(
      <PlayerTag color='cyan' isPlayersTurn={false}>
        <PlayerTagHostIcon />
      </PlayerTag>,
    );
    expect(screen.getByText('Host:')).toBeInTheDocument();
  });

  test('tells screen readers the tag is yours', () => {
    render(
      <PlayerTag color='cyan' isPlayersTurn={false}>
        <PlayerTagUserIcon />
      </PlayerTag>,
    );
    expect(screen.getByText('You:')).toBeInTheDocument();
  });

  describe('card count', () => {
    test('says how many cards the player holds', () => {
      render(
        <PlayerTag color='cyan' isPlayersTurn={false}>
          <PlayerTagCardCount cardCount={5} />
        </PlayerTag>,
      );
      expect(screen.getByText(', 5 cards')).toBeInTheDocument();
    });

    test('says card rather than cards for a single card', () => {
      render(
        <PlayerTag color='cyan' isPlayersTurn={false}>
          <PlayerTagCardCount cardCount={1} />
        </PlayerTag>,
      );
      expect(screen.getByText(', 1 card')).toBeInTheDocument();
    });

    test('says nothing about cards while the count is hidden', () => {
      render(
        <PlayerTag color='cyan' isPlayersTurn={false}>
          <PlayerTagCardCount cardCount={null} />
        </PlayerTag>,
      );
      expect(screen.queryByText(/cards$/)).not.toBeInTheDocument();
    });
  });

  describe('emoji reaction', () => {
    test('shows the reaction over the tag', () => {
      render(
        <PlayerTag color='cyan' isPlayersTurn={false}>
          <PlayerTagReaction
            emojiReaction={{
              emoji: '🎉',
              id: 'reaction-1' as EmojiReactionId,
            }}
          />
        </PlayerTag>,
      );
      expect(screen.getByText('🎉')).toBeInTheDocument();
    });
  });
});
