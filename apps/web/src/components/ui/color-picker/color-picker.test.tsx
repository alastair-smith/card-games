import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ColorPicker, ColorSwatch } from '.';
import { ColorSwatches } from './color-swatches';

const colors = [
  { key: 'red', name: 'Red', value: 'hsl(0 70% 50%)' },
  { key: 'cyan', name: 'Cyan', value: 'hsl(190 70% 40%)' },
  { key: 'green', name: 'Green', value: 'hsl(140 55% 38%)' },
];

const noop = () => {};

describe('ColorSwatches', () => {
  test('renders a selectable swatch for each colour, labelled by name', () => {
    render(<ColorSwatches colors={colors} onColorSelect={noop} />);
    expect(screen.getByRole('radio', { name: 'Red' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Cyan' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Green' })).toBeInTheDocument();
  });

  test('marks the active colour as selected', () => {
    render(<ColorSwatches colors={colors} value='cyan' onColorSelect={noop} />);
    expect(screen.getByRole('radio', { name: 'Cyan' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Red' })).not.toBeChecked();
  });

  test('reports the chosen colour key to the handler', () => {
    const onColorSelect = vi.fn();
    render(<ColorSwatches colors={colors} onColorSelect={onColorSelect} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Green' }));
    expect(onColorSelect).toHaveBeenCalledWith('green');
  });

  test('prevents selecting a colour taken by another player', () => {
    render(
      <ColorSwatches
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
      <ColorSwatches
        colors={colors}
        value='green'
        disabledColors={['green']}
        onColorSelect={noop}
      />,
    );
    expect(screen.getByRole('radio', { name: 'Green' })).toBeEnabled();
  });
});

describe('ColorPicker', () => {
  test('renders a trigger button with the given label', () => {
    render(
      <ColorPicker
        colors={colors}
        label='Change your colour'
        onColorSelect={noop}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Change your colour' }),
    ).toBeInTheDocument();
  });

  test('keeps the colour options hidden until the picker is opened', () => {
    render(<ColorPicker colors={colors} onColorSelect={noop} />);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });
});

describe('ColorSwatch', () => {
  test('fills the swatch with the given colour', () => {
    render(<ColorSwatch color='hsl(0 70% 50%)' />);
    expect(document.querySelector('span')).toHaveStyle({
      backgroundColor: 'hsl(0 70% 50%)',
    });
  });
});
