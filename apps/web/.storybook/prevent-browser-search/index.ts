/**
 * Storybook forwards Ctrl/⌘+K from a story to its search without preventing
 * the browser's own shortcut, which focuses the address bar:
 * https://github.com/storybookjs/storybook/issues/25815
 */
export function preventBrowserSearch(event: KeyboardEvent) {
  const isSearchShortcut =
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    !event.shiftKey &&
    event.key.toLowerCase() === 'k';

  if (isSearchShortcut && !isTypingTarget(event.composedPath()[0])) {
    event.preventDefault();
  }
}

// Storybook doesn't forward key presses from these, so the browser keeps them
function isTypingTarget(target: EventTarget | undefined) {
  return (
    target instanceof HTMLElement &&
    (/input|textarea/i.test(target.tagName) ||
      target.hasAttribute('contenteditable'))
  );
}
