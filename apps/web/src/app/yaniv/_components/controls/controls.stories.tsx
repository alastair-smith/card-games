import { action } from '@ladle/react';
import Controls from '.';

export default {
  title: 'Yaniv / Controls',
};

const defaultProps: React.ComponentProps<typeof Controls> = {
  onEmojiClick: action('Emoji clicked'),
  onEndTurnClick: action('End turn clicked'),
  onYanivClick: action('Yaniv clicked'),
};

export function YourTurn() {
  return <Controls {...defaultProps} />;
}
