import type { Span } from '@opentelemetry/api';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';

export const GAME_CODE_ATTR = 'game.code';
export const GAME_PLAYER_ID_ATTR = 'game.player.id';

export const SENSITIVE_INPUT_FIELDS = new Set(['playerId', 'playerName']);

async function truncatedHmacSha256Hex(
  value: string,
  key: string,
): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

export async function hashField(
  value: string,
  gameCode: GameCode,
): Promise<string> {
  return truncatedHmacSha256Hex(value, gameCode);
}

/** Hashes the player id once, on first use, and reuses it for every span. */
export function createGameAttributesSetter(
  gameCode: GameCode,
  userId?: UserId,
): (span: Span) => Promise<void> {
  let hashedId: Promise<string> | undefined;

  return async (span) => {
    span.setAttribute(GAME_CODE_ATTR, gameCode);

    if (userId) {
      hashedId ??= hashField(userId, gameCode);
      span.setAttribute(GAME_PLAYER_ID_ATTR, await hashedId);
    }
  };
}

export async function setGameAttributes(
  span: Span,
  gameCode: GameCode,
  userId?: UserId,
): Promise<void> {
  await createGameAttributesSetter(gameCode, userId)(span);
}

export async function setInputAttributes(
  span: Span,
  input: Record<string, unknown>,
  gameCode?: GameCode,
): Promise<void> {
  if (gameCode) {
    span.setAttribute(GAME_CODE_ATTR, gameCode);
  }

  for (const [key, rawValue] of Object.entries(input)) {
    if (key === 'code') continue;

    if (
      SENSITIVE_INPUT_FIELDS.has(key) &&
      typeof rawValue === 'string' &&
      gameCode
    ) {
      span.setAttribute(
        `trpc.input.${key}`,
        await hashField(rawValue, gameCode),
      );
      continue;
    }

    if (SENSITIVE_INPUT_FIELDS.has(key)) continue;

    if (
      typeof rawValue === 'string' ||
      typeof rawValue === 'number' ||
      typeof rawValue === 'boolean'
    ) {
      span.setAttribute(`trpc.input.${key}`, rawValue);
      continue;
    }

    if (typeof rawValue === 'object' && rawValue !== null) {
      span.setAttribute(`trpc.input.${key}`, JSON.stringify(rawValue));
    }
  }
}
