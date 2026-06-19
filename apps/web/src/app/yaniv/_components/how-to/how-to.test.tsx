import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { HowTo, HowToDialog } from '.';

vi.mock('~/components/ui/playing-card', () => ({
  PlayingCard: ({ card }: { card: { suit: string; rank: string } }) => (
    <span>{card.rank}</span>
  ),
}));

describe('HowTo', () => {
  test('shows overview content on the first slide', () => {
    render(<HowTo />);
    expect(screen.getByText(/Yaniv is a card game/)).toBeInTheDocument();
  });

  test('shows slide counter starting at 1 of 5', () => {
    render(<HowTo />);
    expect(screen.getByText('1 of 5')).toBeInTheDocument();
  });

  test('does not show Back button on the first slide', () => {
    render(<HowTo />);
    expect(
      screen.queryByRole('button', { name: 'Back' }),
    ).not.toBeInTheDocument();
  });

  test('shows Next button on the first slide', () => {
    render(<HowTo />);
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  test('advances to second slide and updates counter when Next is clicked', () => {
    render(<HowTo />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Card values')).toBeInTheDocument();
    expect(screen.getByText('2 of 5')).toBeInTheDocument();
  });

  test('shows Back button after advancing past the first slide', () => {
    render(<HowTo />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('button', { name: 'Back' })).toBeInTheDocument();
  });

  test('returns to the first slide when Back is clicked', () => {
    render(<HowTo />);
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText(/Yaniv is a card game/)).toBeInTheDocument();
    expect(screen.getByText('1 of 5')).toBeInTheDocument();
  });

  test('does not show Next button on the last slide', () => {
    render(<HowTo />);
    // Advance to the last slide (slide 5)
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    }
    expect(screen.getByText('Scoring')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next' }),
    ).not.toBeInTheDocument();
  });
});

describe('HowToDialog', () => {
  test('renders a How to play button as the trigger', () => {
    render(<HowToDialog />);
    expect(
      screen.getByRole('button', { name: 'How to play' }),
    ).toBeInTheDocument();
  });

  test('shows the first slide content when opened', () => {
    render(<HowToDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'How to play' }));
    expect(screen.getByText('How to play Yaniv')).toBeInTheDocument();
    expect(screen.getByText(/Yaniv is a card game/)).toBeInTheDocument();
  });

  test('shows Close instead of Next on the last slide', () => {
    render(<HowToDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'How to play' }));
    for (let i = 0; i < 4; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    }
    expect(
      screen.queryByRole('button', { name: 'Next' }),
    ).not.toBeInTheDocument();
    // The slide nav Close button appears alongside the dialog's built-in X close button
    expect(screen.getAllByRole('button', { name: 'Close' })).toHaveLength(2);
  });
});
