import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearListenerCountProvider,
  readListenerCounts,
  setListenerCountProvider,
} from './listener-counts';

afterEach(() => {
  clearListenerCountProvider();
});

describe('sharing listener counts between layers', () => {
  it('reports no counts before a provider is registered', () => {
    expect(readListenerCounts()).toEqual({});
  });

  it('reads counts through a registered provider', () => {
    setListenerCountProvider(() => ({ 'yaniv:ABC123': 2 }));

    expect(readListenerCounts()).toEqual({ 'yaniv:ABC123': 2 });
  });

  it('reads counts live rather than caching them', () => {
    const counts: Record<string, number> = { 'yaniv:ABC123': 1 };
    setListenerCountProvider(() => counts);

    counts['yaniv:ABC123'] = 4;

    expect(readListenerCounts()).toEqual({ 'yaniv:ABC123': 4 });
  });

  it('reaches a provider registered by a separate copy of the module', async () => {
    // The app and instrumentation layers each get their own instance of this
    // module, so the registry has to survive the module itself being reloaded.
    setListenerCountProvider(() => ({ 'yaniv:ABC123': 3 }));

    vi.resetModules();
    const reloaded = await import('./listener-counts');

    expect(reloaded.readListenerCounts()).toEqual({ 'yaniv:ABC123': 3 });
  });

  it('stops reporting counts once the provider is cleared', () => {
    setListenerCountProvider(() => ({ 'yaniv:ABC123': 2 }));
    clearListenerCountProvider();

    expect(readListenerCounts()).toEqual({});
  });
});
