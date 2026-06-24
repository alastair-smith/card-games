import { action } from '@ladle/react';
import { useState } from 'react';
import { ColorPicker } from '.';
import { CANDIDATE_PLAYER_COLORS } from './candidate-colors';

export default {
  title: 'Components / Color Picker',
};

const onColorSelect = action('onColorSelect');

const colorValues = CANDIDATE_PLAYER_COLORS.map(({ value }) => value);

export const Default = () => {
  const [color, setColor] = useState<string>();

  return (
    <ColorPicker
      colors={colorValues}
      value={color}
      onColorSelect={(selected) => {
        setColor(selected);
        onColorSelect(selected);
      }}
    />
  );
};

export const PreSelected = () => {
  const [color, setColor] = useState<string | undefined>(colorValues[3]);

  return (
    <ColorPicker
      colors={colorValues}
      value={color}
      onColorSelect={(selected) => {
        setColor(selected);
        onColorSelect(selected);
      }}
    />
  );
};
