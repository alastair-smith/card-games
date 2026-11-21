import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { preventBrowserSearch } from '.';

function pressKeys(target: HTMLElement, init: KeyboardEventInit) {
  const event = new KeyboardEvent('keydown', {
    bubbles: true,
    cancelable: true,
    composed: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

describe('preventBrowserSearch', () => {
  beforeEach(() => {
    window.addEventListener('keydown', preventBrowserSearch);
  });

  afterEach(() => {
    window.removeEventListener('keydown', preventBrowserSearch);
    document.body.innerHTML = '';
  });

  it('stops the browser handling Ctrl+K', () => {
    const event = pressKeys(document.body, { key: 'k', ctrlKey: true });

    expect(event.defaultPrevented).toBe(true);
  });

  it('stops the browser handling ⌘K', () => {
    const event = pressKeys(document.body, { key: 'k', metaKey: true });

    expect(event.defaultPrevented).toBe(true);
  });

  it('leaves K without a modifier to the browser', () => {
    const event = pressKeys(document.body, { key: 'k' });

    expect(event.defaultPrevented).toBe(false);
  });

  it('leaves other shortcuts with K to the browser', () => {
    const event = pressKeys(document.body, {
      key: 'K',
      ctrlKey: true,
      shiftKey: true,
    });

    expect(event.defaultPrevented).toBe(false);
  });

  it('leaves Ctrl+K to the browser while typing in an input', () => {
    const input = document.createElement('input');
    document.body.append(input);

    const event = pressKeys(input, { key: 'k', ctrlKey: true });

    expect(event.defaultPrevented).toBe(false);
  });

  it('leaves Ctrl+K to the browser while typing in editable content', () => {
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', '');
    document.body.append(editable);

    const event = pressKeys(editable, { key: 'k', ctrlKey: true });

    expect(event.defaultPrevented).toBe(false);
  });
});
