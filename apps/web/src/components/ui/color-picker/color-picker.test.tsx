import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ColorPicker } from '.';

const colors = [
  { key: 'red', name: 'Red', value: 'hsl(0 70% 50%)' },
  { key: 'cyan', name: 'Cyan', value: 'hsl(190 70% 40%)' },
  { key: 'green', name: 'Green', value: 'hsl(140 55% 38%)' },
];

const noop = () => {};

describe('ColorPicker', () => {
  test('renders a selectable swatch for each colour, labelled by name', () => {
    render(<ColorPicker colors={colors} onColorSelect={noop} />);
    expect(screen.getByRole('radio', { name: 'Red' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Cyan' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Green' })).toBeInTheDocument();
  });

  test('marks the active colour as selected', () => {
    render(<ColorPicker colors={colors} value='cyan' onColorSelect={noop} />);
    expect(screen.getByRole('radio', { name: 'Cyan' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Red' })).not.toBeChecked();
  });

  test('reports the chosen colour key to the handler', () => {
    const onColorSelect = vi.fn();
    render(<ColorPicker colors={colors} onColorSelect={onColorSelect} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Green' }));
    expect(onColorSelect).toHaveBeenCalledWith('green');
  });

  test('prevents selecting a colour taken by another player', () => {
    render(
      <ColorPicker
        colors={colors}
        disabledColors={['green']}
        onColorSelect={noop}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Green' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Red' })).toBeEnabled();
  });

  test('still allows re-selecting the colour you already have', () => {
    render(
      <ColorPicker
        colors={colors}
        value='green'
        disabledColors={['green']}
        onColorSelect={noop}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Green' })).toBeEnabled();
  });
});
