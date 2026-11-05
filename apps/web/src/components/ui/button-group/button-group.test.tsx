import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ButtonGroupChoice, ButtonGroupChoiceItem } from '.';

const noop = vi.fn();

const renderChoice = ({
  value = 'medium',
  onValueChange = noop,
  isDisabled = false,
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  isDisabled?: boolean;
} = {}) =>
  render(
    <ButtonGroupChoice
      label='Size'
      value={value}
      onValueChange={onValueChange}
      isDisabled={isDisabled}
    >
      <ButtonGroupChoiceItem value='small'>Small</ButtonGroupChoiceItem>
      <ButtonGroupChoiceItem value='medium'>Medium</ButtonGroupChoiceItem>
      <ButtonGroupChoiceItem value='large'>Large</ButtonGroupChoiceItem>
    </ButtonGroupChoice>,
  );

describe('ButtonGroupChoice', () => {
  test('is a group of radio buttons named by its label', () => {
    renderChoice();
    expect(screen.getByRole('group', { name: 'Size' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
  });

  test('shows the chosen button as checked', () => {
    renderChoice({ value: 'large' });
    expect(screen.getByRole('radio', { name: 'Large' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Medium' })).not.toBeChecked();
  });

  test('calls the change handler with the value of the button clicked', () => {
    const handleValueChange = vi.fn();
    renderChoice({ onValueChange: handleValueChange });

    fireEvent.click(screen.getByRole('radio', { name: 'Small' }));

    expect(handleValueChange).toHaveBeenCalledOnce();
    expect(handleValueChange).toHaveBeenCalledWith('small');
  });

  test('cannot be changed when turned off', () => {
    renderChoice({ isDisabled: true });
    for (const radio of screen.getAllByRole('radio')) {
      expect(radio).toBeDisabled();
    }
  });
});
