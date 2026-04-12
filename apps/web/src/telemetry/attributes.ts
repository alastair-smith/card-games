import type { Span } from '@opentelemetry/api';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';

export const GAME_CODE_ATTR = 'game.code';
export const GAME_PLAYER_ID_ATTR = 'game.player.id';

export async function hashUserId(
  userId: UserId,
  gameCode: GameCode,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(gameCode),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(userId),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 16);
}

export async function setGameAttributes(
  span: Span,
  gameCode: GameCode,
  userId?: UserId,
): Promise<void> {
  span.setAttribute(GAME_CODE_ATTR, gameCode);

  if (userId) {
    const hashedId = await hashUserId(userId, gameCode);
    span.setAttribute(GAME_PLAYER_ID_ATTR, hashedId);
  }
}
