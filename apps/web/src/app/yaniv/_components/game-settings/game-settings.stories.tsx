import { action } from '@ladle/react';
import { useState } from 'react';
import {
  DEFAULT_HAND_SIZE,
  type HandSize,
  handSizeSchema,
} from '~/types/games/yaniv';
import GameSettings from '.';

export default {
  title: 'Yaniv / Game Settings',
};

const onHandSizeChange = action('onHandSizeChange');

// The host picks the settings the game is played with.
export const Host = () => {
  const [handSize, setHandSize] = useState<HandSize>(DEFAULT_HAND_SIZE);

  return (
    <GameSettings
      className='m-4 w-100 max-w-full'
      handSize={handSize}
      isHost
      onHandSizeChange={(value) => {
        setHandSize(handSizeSchema.parse(Number(value)));
        onHandSizeChange(value);
      }}
    />
  );
};

// Everyone else sees the host's choice, but cannot change it.
export const Player = () => (
  <GameSettings
    className='m-4 w-100 max-w-full'
    handSize={7}
    isHost={false}
    onHandSizeChange={onHandSizeChange}
  />
);
