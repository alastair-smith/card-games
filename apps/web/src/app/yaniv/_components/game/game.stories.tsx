import { action } from '@ladle/react';
import Game from '.';

export default {
  title: 'Yaniv / Game',
};

const defaultProps: React.ComponentProps<typeof Game> = {
  onEmojiClick: action('Emoji clicked'),
  onEndTurnClick: action('End turn clicked'),
  onYanivClick: action('Yaniv clicked'),
};

export const GameStart = () => {
  return <Game {...defaultProps} />;
};
