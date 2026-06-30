import { action } from '@ladle/react';
import { useState } from 'react';
import { PLAYER_COLOR_OPTIONS } from '~/utils/player-color';
import { ColorPicker } from '.';

export default {
  title: 'Components / Color Picker',
};

const onColorSelect = action('onColorSelect');

const FIRST_COLOR = PLAYER_COLOR_OPTIONS[0]?.key;

// The picker is a swatch button showing the current colour; open it to reveal
// the colour popover.
export const Default = () => {
  const [color, setColor] = useState<string | undefined>(FIRST_COLOR);

  return (
    <ColorPicker
      colors={PLAYER_COLOR_OPTIONS}
      value={color}
      onColorSelect={(selected) => {
        setColor(selected);
        onColorSelect(selected);
      }}
    />
  );
};

// Colours taken by other players are shown disabled in the popover.
export const WithTakenColours = () => {
  const [color, setColor] = useState<string | undefined>(FIRST_COLOR);

  return (
    <ColorPicker
      colors={PLAYER_COLOR_OPTIONS}
      value={color}
      disabledColors={['cyan', 'green', 'indigo']}
      onColorSelect={(selected) => {
        setColor(selected);
        onColorSelect(selected);
      }}
    />
  );
};
