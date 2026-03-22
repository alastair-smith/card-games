import { action } from '@ladle/react';
import type { PlayerName } from '~/types/entities';
import { GameViewStage } from '~/types/games/yaniv';
import Controls from '.';

export default {
  title: 'Yaniv / Controls',
};

const defaultProps: React.ComponentProps<typeof Controls> = {
  onEmojiClick: action('Emoji clicked'),
  onEndTurnClick: action('End turn clicked'),
  onYanivClick: action('Yaniv clicked'),
  onPlayCards: action('Play cards clicked'),
  stage: GameViewStage.WAITING_FOR_PLAYER,
};

export function WaitForPlayers() {
  return (
    <Controls {...defaultProps} playerTakingTurn={'Kevin' as PlayerName} />
  );
}

export function PickCards() {
  return <Controls {...defaultProps} stage={GameViewStage.PICKING_CARDS} />;
}

export function EndTurn() {
  return <Controls {...defaultProps} stage={GameViewStage.END_TURN} />;
}

export function EndOfRound() {
  return <Controls {...defaultProps} stage={GameViewStage.END_OF_ROUND} />;
}
