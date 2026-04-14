import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { HowTo, HowToDialog } from '.';

vi.mock('~/components/ui/playing-card', () => ({
  PlayingCard: ({ card }: { card: { suit: string; rank: string } }) => (
    <span>{card.rank}</span>
  ),
}));

describe('HowTo', () => {
  test('renders the game description', () => {
    render(<HowTo />);
    expect(screen.getByText(/Yaniv is a card game/)).toBeInTheDocument();
  });

  test('renders the Taking a turn section', () => {
    render(<HowTo />);
    expect(screen.getByText('Taking a turn')).toBeInTheDocument();
  });

  test('renders the Calling Yaniv section', () => {
    render(<HowTo />);
    expect(screen.getByText('Calling Yaniv')).toBeInTheDocument();
  });

  test('renders the Scoring section', () => {
    render(<HowTo />);
    expect(screen.getByText('Scoring')).toBeInTheDocument();
  });

  test('renders the card values table', () => {
    render(<HowTo />);
    expect(screen.getByText('Card values')).toBeInTheDocument();
  });
});

describe('HowToDialog', () => {
  test('renders a How to play button as the trigger', () => {
    render(<HowToDialog />);
    expect(
      screen.getByRole('button', { name: 'How to play' }),
    ).toBeInTheDocument();
  });

  test('shows the dialog content when How to play is clicked', () => {
    render(<HowToDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'How to play' }));
    expect(screen.getByText('How to play Yaniv')).toBeInTheDocument();
  });
});
