import type { Span } from '@opentelemetry/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { UserId } from '~/types/entities';
import type { GameCode } from '~/types/game';
import {
  createGameAttributesSetter,
  GAME_CODE_ATTR,
  GAME_PLAYER_ID_ATTR,
  hashField,
  SENSITIVE_INPUT_FIELDS,
  setGameAttributes,
  setInputAttributes,
} from './attributes';

const GAME_CODE = 'ABCDE1' as GameCode;
const USER_ID = '123e4567-e89b-12d3-a456-426614174000' as UserId;

function makeSpan() {
  return { setAttribute: vi.fn() } as unknown as Span;
}

describe('SENSITIVE_INPUT_FIELDS', () => {
  test('includes playerId', () => {
    expect(SENSITIVE_INPUT_FIELDS.has('playerId')).toBe(true);
  });

  test('includes playerName', () => {
    expect(SENSITIVE_INPUT_FIELDS.has('playerName')).toBe(true);
  });

  test('does not include non-sensitive fields', () => {
    expect(SENSITIVE_INPUT_FIELDS.has('code')).toBe(false);
    expect(SENSITIVE_INPUT_FIELDS.has('emoji')).toBe(false);
    expect(SENSITIVE_INPUT_FIELDS.has('source')).toBe(false);
  });
});

describe('hashField', () => {
  test('returns a 32-character hex string', async () => {
    const result = await hashField('some-value', GAME_CODE);
    expect(result).toHaveLength(32);
    expect(result).toMatch(/^[0-9a-f]+$/);
  });

  test('is deterministic for the same inputs', async () => {
    const first = await hashField('value', GAME_CODE);
    const second = await hashField('value', GAME_CODE);
    expect(first).toBe(second);
  });

  test('produces different results for different values', async () => {
    const first = await hashField('value-a', GAME_CODE);
    const second = await hashField('value-b', GAME_CODE);
    expect(first).not.toBe(second);
  });

  test('produces different results for different game codes', async () => {
    const first = await hashField('value', 'ABCDE1' as GameCode);
    const second = await hashField('value', 'FGHIJ2' as GameCode);
    expect(first).not.toBe(second);
  });
});

describe('setGameAttributes', () => {
  let span: Span;

  beforeEach(() => {
    span = makeSpan();
  });

  test('sets the game code attribute', async () => {
    await setGameAttributes(span, GAME_CODE);
    expect(span.setAttribute).toHaveBeenCalledWith(GAME_CODE_ATTR, GAME_CODE);
  });

  test('does not set player id when no user id is provided', async () => {
    await setGameAttributes(span, GAME_CODE);
    expect(span.setAttribute).toHaveBeenCalledOnce();
    expect(span.setAttribute).not.toHaveBeenCalledWith(
      GAME_PLAYER_ID_ATTR,
      expect.anything(),
    );
  });

  test('sets a hashed player id when user id is provided', async () => {
    await setGameAttributes(span, GAME_CODE, USER_ID);
    const expected = await hashField(USER_ID, GAME_CODE);
    expect(span.setAttribute).toHaveBeenCalledWith(
      GAME_PLAYER_ID_ATTR,
      expected,
    );
  });

  test('never sets the raw user id as an attribute', async () => {
    await setGameAttributes(span, GAME_CODE, USER_ID);
    const values = vi.mocked(span.setAttribute).mock.calls.map(([, v]) => v);
    expect(values).not.toContain(USER_ID);
  });
});

describe('createGameAttributesSetter', () => {
  test('hashes the player id once across spans', async () => {
    const importKey = vi.spyOn(crypto.subtle, 'importKey');
    const setAttributes = createGameAttributesSetter(GAME_CODE, USER_ID);
    const firstSpan = makeSpan();
    const secondSpan = makeSpan();

    await setAttributes(firstSpan);
    await setAttributes(secondSpan);
    expect(importKey).toHaveBeenCalledOnce();
    importKey.mockRestore();

    expect(secondSpan.setAttribute).toHaveBeenCalledWith(
      GAME_PLAYER_ID_ATTR,
      await hashField(USER_ID, GAME_CODE),
    );
  });
});

describe('setInputAttributes', () => {
  let span: Span;

  beforeEach(() => {
    span = makeSpan();
  });

  describe('game code', () => {
    test('sets game.code when gameCode is provided', async () => {
      await setInputAttributes(span, { code: GAME_CODE }, GAME_CODE);
      expect(span.setAttribute).toHaveBeenCalledWith(GAME_CODE_ATTR, GAME_CODE);
    });

    test('does not set game.code when no gameCode is provided', async () => {
      await setInputAttributes(span, { code: GAME_CODE });
      const keys = vi.mocked(span.setAttribute).mock.calls.map(([k]) => k);
      expect(keys).not.toContain(GAME_CODE_ATTR);
    });

    test('does not set trpc.input.code for the code field', async () => {
      await setInputAttributes(span, { code: GAME_CODE }, GAME_CODE);
      const keys = vi.mocked(span.setAttribute).mock.calls.map(([k]) => k);
      expect(keys).not.toContain('trpc.input.code');
    });
  });

  describe('primitive fields', () => {
    test('sets string fields as trpc.input attributes', async () => {
      await setInputAttributes(span, { source: 'deck' });
      expect(span.setAttribute).toHaveBeenCalledWith(
        'trpc.input.source',
        'deck',
      );
    });

    test('sets number fields as trpc.input attributes', async () => {
      await setInputAttributes(span, { count: 3 });
      expect(span.setAttribute).toHaveBeenCalledWith('trpc.input.count', 3);
    });

    test('sets boolean fields as trpc.input attributes', async () => {
      await setInputAttributes(span, { isReady: true });
      expect(span.setAttribute).toHaveBeenCalledWith(
        'trpc.input.isReady',
        true,
      );
    });

    test('sets multiple fields in a single input', async () => {
      await setInputAttributes(span, { field: 'name', isReady: false });
      expect(span.setAttribute).toHaveBeenCalledWith(
        'trpc.input.field',
        'name',
      );
      expect(span.setAttribute).toHaveBeenCalledWith(
        'trpc.input.isReady',
        false,
      );
    });
  });

  describe('sensitive fields', () => {
    test('hashes playerId when gameCode is available', async () => {
      await setInputAttributes(span, { playerId: USER_ID }, GAME_CODE);
      const expected = await hashField(USER_ID, GAME_CODE);
      expect(span.setAttribute).toHaveBeenCalledWith(
        'trpc.input.playerId',
        expected,
      );
    });

    test('hashes playerName when gameCode is available', async () => {
      await setInputAttributes(span, { playerName: 'Alice' }, GAME_CODE);
      const expected = await hashField('Alice', GAME_CODE);
      expect(span.setAttribute).toHaveBeenCalledWith(
        'trpc.input.playerName',
        expected,
      );
    });

    test('omits playerId when no gameCode is available', async () => {
      await setInputAttributes(span, { playerId: USER_ID });
      const keys = vi.mocked(span.setAttribute).mock.calls.map(([k]) => k);
      expect(keys).not.toContain('trpc.input.playerId');
    });

    test('omits playerName when no gameCode is available', async () => {
      await setInputAttributes(span, { playerName: 'Alice' });
      const keys = vi.mocked(span.setAttribute).mock.calls.map(([k]) => k);
      expect(keys).not.toContain('trpc.input.playerName');
    });

    test('does not record a sensitive value in raw form', async () => {
      await setInputAttributes(span, { playerId: USER_ID }, GAME_CODE);
      const values = vi.mocked(span.setAttribute).mock.calls.map(([, v]) => v);
      expect(values).not.toContain(USER_ID);
    });
  });

  describe('nested structures', () => {
    test('serialises arrays as JSON string attributes', async () => {
      const cards = [
        { suit: 'HEARTS', rank: '5' },
        { suit: 'SPADES', rank: 'A' },
      ];
      await setInputAttributes(span, { cards });
      expect(span.setAttribute).toHaveBeenCalledWith(
        'trpc.input.cards',
        JSON.stringify(cards),
      );
    });

    test('serialises nested objects as JSON string attributes', async () => {
      const config = { maxPlayers: 4, allowSpectators: false };
      await setInputAttributes(span, { config });
      expect(span.setAttribute).toHaveBeenCalledWith(
        'trpc.input.config',
        JSON.stringify(config),
      );
    });

    test('does not set an attribute for null values', async () => {
      await setInputAttributes(span, { field: null });
      const keys = vi.mocked(span.setAttribute).mock.calls.map(([k]) => k);
      expect(keys).not.toContain('trpc.input.field');
    });
  });
});
