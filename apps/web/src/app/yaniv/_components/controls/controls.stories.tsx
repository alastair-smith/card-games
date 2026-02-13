import { action } from '@ladle/react';
import type { PlayerName } from '~/types/entities';
import Controls from '.';

export default {
  title: 'Yaniv / Controls',
};

const defaultProps: React.ComponentProps<typeof Controls> = {
  onEmojiClick: action('Emoji clicked'),
  onEndTurnClick: action('End turn clicked'),
  onYanivClick: action('Yaniv clicked'),
  onPlayCards: action('Play cards clicked'),
  stage: 'waiting-for-player',
};

export function WaitForPlayers() {
  return (
    <Controls {...defaultProps} playerTakingTurn={'Kevin' as PlayerName} />
  );
}

export function PickCards() {
  return <Controls {...defaultProps} stage='picking-cards' />;
}

export function EndTurn() {
  return <Controls {...defaultProps} stage='end-turn' />;
}
