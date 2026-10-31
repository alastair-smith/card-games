import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { GameViewStage } from '~/types/games/yaniv';
import { TurnActions } from '.';

const noop = vi.fn();
const baseProps = {
  onEndTurnClick: noop,
  onYanivClick: noop,
  onPlayCards: noop,
  onStartNewRoundClick: noop,
};

describe('TurnActions', () => {
  describe('waiting for player', () => {
    test('shows no buttons', () => {
      render(
        <TurnActions {...baseProps} stage={GameViewStage.WAITING_FOR_PLAYER} />,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('picking cards', () => {
    test('shows Play Cards button', () => {
      render(
        <TurnActions {...baseProps} stage={GameViewStage.PICKING_CARDS} />,
      );
      expect(
        screen.getByRole('button', { name: /play cards/i }),
      ).toBeInTheDocument();
    });

    test('calls the play handler when cards are played', () => {
      const handlePlayCards = vi.fn();
      render(
        <TurnActions
          {...baseProps}
          stage={GameViewStage.PICKING_CARDS}
          onPlayCards={handlePlayCards}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /play cards/i }));
      expect(handlePlayCards).toHaveBeenCalledOnce();
    });

    test('shows direction buttons instead of Play Cards when a run is selected', () => {
      render(
        <TurnActions
          {...baseProps}
          stage={GameViewStage.PICKING_CARDS}
          isRunSelected
        />,
      );
      expect(
        screen.queryByRole('button', { name: /play cards/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /play ascending/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /play descending/i }),
      ).toBeInTheDocument();
    });

    test('plays a run ascending', () => {
      const handlePlayCards = vi.fn();
      render(
        <TurnActions
          {...baseProps}
          stage={GameViewStage.PICKING_CARDS}
          isRunSelected
          onPlayCards={handlePlayCards}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /play ascending/i }));
      expect(handlePlayCards).toHaveBeenCalledWith('ascending');
    });

    test('plays a run descending', () => {
      const handlePlayCards = vi.fn();
      render(
        <TurnActions
          {...baseProps}
          stage={GameViewStage.PICKING_CARDS}
          isRunSelected
          onPlayCards={handlePlayCards}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /play descending/i }));
      expect(handlePlayCards).toHaveBeenCalledWith('descending');
    });
  });

  describe('end of turn', () => {
    test('calls the Yaniv handler when Yaniv is called', () => {
      const handleYanivClick = vi.fn();
      render(
        <TurnActions
          {...baseProps}
          stage={GameViewStage.END_TURN}
          onYanivClick={handleYanivClick}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /yaniv/i }));
      expect(handleYanivClick).toHaveBeenCalledOnce();
    });

    test('calls the end turn handler when the turn is ended', () => {
      const handleEndTurnClick = vi.fn();
      render(
        <TurnActions
          {...baseProps}
          stage={GameViewStage.END_TURN}
          onEndTurnClick={handleEndTurnClick}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /end turn/i }));
      expect(handleEndTurnClick).toHaveBeenCalledOnce();
    });

    test('shows your hand total in the Yaniv button', () => {
      render(
        <TurnActions
          {...baseProps}
          stage={GameViewStage.END_TURN}
          handTotal={12}
        />,
      );
      const yanivButton = screen.getByRole('button', { name: /yaniv/i });
      expect(yanivButton).toHaveTextContent('(12)');
      expect(yanivButton).toHaveAccessibleName('Yaniv!, hand total 12');
    });

    test('leaves the hand total out of the Yaniv button when it is hidden', () => {
      render(<TurnActions {...baseProps} stage={GameViewStage.END_TURN} />);
      expect(
        screen.getByRole('button', { name: /yaniv/i }),
      ).not.toHaveTextContent(/\d/);
    });
  });

  describe('waiting for new round', () => {
    test('shows no buttons', () => {
      render(
        <TurnActions
          {...baseProps}
          stage={GameViewStage.WAITING_FOR_NEW_ROUND}
        />,
      );
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('end of round', () => {
    test('calls the new round handler when a new round is started', () => {
      const handleStartNewRoundClick = vi.fn();
      render(
        <TurnActions
          {...baseProps}
          stage={GameViewStage.END_OF_ROUND}
          onStartNewRoundClick={handleStartNewRoundClick}
        />,
      );
      fireEvent.click(screen.getByRole('button', { name: /start new round/i }));
      expect(handleStartNewRoundClick).toHaveBeenCalledOnce();
    });
  });
});
