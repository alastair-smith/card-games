import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { PlayerName } from '~/types/entities';
import Controls from '.';

vi.mock('~/components/emoji-reactions', () => ({
  EmojiReactions: () => <div data-testid='emoji-reactions' />,
}));

const noop = vi.fn();
const baseProps = {
  onEmojiClick: noop,
  onEndTurnClick: noop,
  onYanivClick: noop,
  onPlayCards: noop,
  playerTakingTurn: 'Alice' as PlayerName,
};

describe('Controls', () => {
  describe('waiting for player', () => {
    test('shows whose turn it is', () => {
      render(<Controls {...baseProps} stage='waiting-for-player' />);
      expect(screen.getByText(/Alice is thinking/)).toBeInTheDocument();
    });

    test('does not show action buttons', () => {
      render(<Controls {...baseProps} stage='waiting-for-player' />);
      expect(
        screen.queryByRole('button', { name: /play cards/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /yaniv/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /end turn/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /start new round/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('picking cards', () => {
    test('shows Play Cards button', () => {
      render(<Controls {...baseProps} stage='picking-cards' />);
      expect(
        screen.getByRole('button', { name: /play cards/i }),
      ).toBeInTheDocument();
    });

    test('calls the play handler when Play Cards is clicked', () => {
      const onPlayCards = vi.fn();
      render(
        <Controls
          {...baseProps}
          stage='picking-cards'
          onPlayCards={onPlayCards}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /play cards/i }));
      expect(onPlayCards).toHaveBeenCalledOnce();
    });
  });

  describe('end of turn', () => {
    test('shows Yaniv! button', () => {
      render(<Controls {...baseProps} stage='end-turn' />);
      expect(
        screen.getByRole('button', { name: /yaniv/i }),
      ).toBeInTheDocument();
    });

    test('shows End Turn button', () => {
      render(<Controls {...baseProps} stage='end-turn' />);
      expect(
        screen.getByRole('button', { name: /end turn/i }),
      ).toBeInTheDocument();
    });

    test('calls the Yaniv handler when Yaniv is called', () => {
      const onYanivClick = vi.fn();
      render(
        <Controls
          {...baseProps}
          stage='end-turn'
          onYanivClick={onYanivClick}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /yaniv/i }));
      expect(onYanivClick).toHaveBeenCalledOnce();
    });

    test('calls the end turn handler when End Turn is clicked', () => {
      const onEndTurnClick = vi.fn();
      render(
        <Controls
          {...baseProps}
          stage='end-turn'
          onEndTurnClick={onEndTurnClick}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /end turn/i }));
      expect(onEndTurnClick).toHaveBeenCalledOnce();
    });
  });

  describe('end of round', () => {
    test('shows Start new round button', () => {
      render(<Controls {...baseProps} stage='end-of-round' />);
      expect(
        screen.getByRole('button', { name: /start new round/i }),
      ).toBeInTheDocument();
    });

    test('calls the play handler when Start new round is clicked', () => {
      const onPlayCards = vi.fn();
      render(
        <Controls
          {...baseProps}
          stage='end-of-round'
          onPlayCards={onPlayCards}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /start new round/i }));
      expect(onPlayCards).toHaveBeenCalledOnce();
    });
  });
});
