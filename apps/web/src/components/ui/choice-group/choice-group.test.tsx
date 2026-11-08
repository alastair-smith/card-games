import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import {
  ChoiceCard,
  ChoiceCardDescription,
  ChoiceCardTitle,
  ChoiceGroup,
} from '.';

const noop = () => {};

const renderHandSizes = ({
  onValueChange = noop,
  isDisabled = false,
  isSevenDisabled = false,
}: {
  onValueChange?: (value: string) => void;
  isDisabled?: boolean;
  isSevenDisabled?: boolean;
} = {}) =>
  render(
    <ChoiceGroup
      label='Hand size'
      defaultValue='5'
      isDisabled={isDisabled}
      onValueChange={onValueChange}
    >
      <ChoiceCard value='5'>
        <ChoiceCardTitle>5 cards</ChoiceCardTitle>
        <ChoiceCardDescription>The standard game.</ChoiceCardDescription>
      </ChoiceCard>
      <ChoiceCard value='7' isDisabled={isSevenDisabled}>
        <ChoiceCardTitle>7 cards</ChoiceCardTitle>
        <ChoiceCardDescription>Longer rounds.</ChoiceCardDescription>
      </ChoiceCard>
    </ChoiceGroup>,
  );

describe('Choice group', () => {
  test('names the group of choices', () => {
    renderHandSizes();

    expect(
      screen.getByRole('group', { name: 'Hand size' }),
    ).toBeInTheDocument();
  });

  test('starts with the default choice made', () => {
    renderHandSizes();

    expect(screen.getByRole('radio', { name: /5 cards/ })).toBeChecked();
    expect(screen.getByRole('radio', { name: /7 cards/ })).not.toBeChecked();
  });

  test('makes the choice when the text on a card is clicked', () => {
    const handleValueChange = vi.fn();
    renderHandSizes({ onValueChange: handleValueChange });

    fireEvent.click(screen.getByText('Longer rounds.'));

    expect(handleValueChange).toHaveBeenCalledWith('7');
    expect(screen.getByRole('radio', { name: /7 cards/ })).toBeChecked();
  });

  test('shows the chosen value when it is set from outside', () => {
    render(
      <ChoiceGroup label='Hand size' value='7' onValueChange={noop}>
        <ChoiceCard value='5'>5 cards</ChoiceCard>
        <ChoiceCard value='7'>7 cards</ChoiceCard>
      </ChoiceGroup>,
    );

    expect(screen.getByRole('radio', { name: '7 cards' })).toBeChecked();
  });

  describe('when disabled', () => {
    test('turns off every choice when the group is disabled', () => {
      renderHandSizes({ isDisabled: true });

      expect(screen.getByRole('radio', { name: /5 cards/ })).toBeDisabled();
      expect(screen.getByRole('radio', { name: /7 cards/ })).toBeDisabled();
    });

    test('turns off only the disabled choice', () => {
      renderHandSizes({ isSevenDisabled: true });

      expect(screen.getByRole('radio', { name: /5 cards/ })).toBeEnabled();
      expect(screen.getByRole('radio', { name: /7 cards/ })).toBeDisabled();
    });
  });
});
