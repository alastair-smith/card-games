import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import {
  ChoiceCard,
  ChoiceCardDescription,
  ChoiceCardTitle,
  ChoiceGroup,
} from '.';

const noop = () => {};

const renderHandSizes = (onValueChange: (value: string) => void = noop) =>
  render(
    <ChoiceGroup
      label='Hand size'
      defaultValue='5'
      onValueChange={onValueChange}
    >
      <ChoiceCard value='5'>
        <ChoiceCardTitle>5 cards</ChoiceCardTitle>
        <ChoiceCardDescription>The standard game.</ChoiceCardDescription>
      </ChoiceCard>
      <ChoiceCard value='7'>
        <ChoiceCardTitle>7 cards</ChoiceCardTitle>
        <ChoiceCardDescription>Longer rounds.</ChoiceCardDescription>
      </ChoiceCard>
    </ChoiceGroup>,
  );

describe('Choice group', () => {
  test('makes the choice when the text on a card is clicked', () => {
    const handleValueChange = vi.fn();
    renderHandSizes(handleValueChange);

    fireEvent.click(screen.getByText('Longer rounds.'));

    expect(handleValueChange).toHaveBeenCalledWith('7');
    expect(screen.getByRole('radio', { name: /7 cards/ })).toBeChecked();
  });

  describe('panel', () => {
    const renderWithPanel = (value?: string) =>
      render(
        <ChoiceGroup
          label='Hand size'
          defaultValue='5'
          {...(value === undefined ? {} : { value })}
        >
          <ChoiceCard value='5'>
            <ChoiceCardTitle>5 cards</ChoiceCardTitle>
          </ChoiceCard>
          <ChoiceCard
            value='random'
            panel={<button type='button'>Change the range</button>}
          >
            <ChoiceCardTitle>Random</ChoiceCardTitle>
          </ChoiceCard>
        </ChoiceGroup>,
      );

    // Includes hidden elements, as a closed panel is hidden from screen readers
    const getPanel = () =>
      screen
        .getByRole('button', { name: 'Change the range', hidden: true })
        .closest('[data-slot="choice-card-panel"]');

    test('keeps the panel out of reach while its choice is not selected', () => {
      renderWithPanel();

      expect(getPanel()).toHaveAttribute('inert');
      expect(
        screen.queryByRole('button', { name: 'Change the range' }),
      ).not.toBeInTheDocument();
    });

    test('opens the panel when its choice is selected', () => {
      renderWithPanel('random');

      expect(getPanel()).not.toHaveAttribute('inert');
    });

    test('opens the panel once its choice is clicked', () => {
      renderWithPanel();

      fireEvent.click(screen.getByRole('radio', { name: /Random/ }));

      expect(getPanel()).not.toHaveAttribute('inert');
    });

    test('lets the controls in an open panel be used', () => {
      const handleClick = vi.fn();
      render(
        <ChoiceGroup label='Hand size' defaultValue='random'>
          <ChoiceCard
            value='random'
            panel={
              <button type='button' onClick={handleClick}>
                Change the range
              </button>
            }
          >
            <ChoiceCardTitle>Random</ChoiceCardTitle>
          </ChoiceCard>
        </ChoiceGroup>,
      );

      fireEvent.click(screen.getByRole('button', { name: 'Change the range' }));

      expect(handleClick).toHaveBeenCalledOnce();
    });
  });
});
