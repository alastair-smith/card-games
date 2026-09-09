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
});
