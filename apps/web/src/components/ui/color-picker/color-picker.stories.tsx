import { action } from '@ladle/react';
import { useState } from 'react';
import { PLAYER_COLOR_OPTIONS } from '~/utils/player-color';
import { ColorPicker } from '.';

export default {
  title: 'Components / Color Picker',
};

const onColorSelect = action('onColorSelect');

export const Default = () => {
  const [color, setColor] = useState<string>();

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

export const PreSelected = () => {
  const [color, setColor] = useState<string | undefined>(
    PLAYER_COLOR_OPTIONS[3]?.key,
  );

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
