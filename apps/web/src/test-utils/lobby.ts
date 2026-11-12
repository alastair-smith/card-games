import type { PlayerName, UserId } from '~/types/entities';
import type { Player } from '~/types/game';

export const buildPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'user-1' as UserId,
  name: 'Player 1' as PlayerName,
  color: 'cyan',
  isReady: false,
  isUser: false,
  isHost: false,
  ...overrides,
});
