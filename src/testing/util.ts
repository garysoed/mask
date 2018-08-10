interface Key {
  alt?: boolean;
  ctrl?: boolean;
  key: string;
  meta?: boolean;
  shift?: boolean;
}

export function simulateKeypress(keys: Key[], element: HTMLElement): void {
  for (const {key, alt, ctrl, meta, shift} of keys) {
    const keydownEvent = new KeyboardEvent('keydown', {
      altKey: alt,
      ctrlKey: ctrl,
      key,
      metaKey: meta,
      shiftKey: shift,
    });
    element.dispatchEvent(keydownEvent);

    const keyupEvent = new KeyboardEvent('keyup', {
      altKey: alt,
      ctrlKey: ctrl,
      key,
      metaKey: meta,
      shiftKey: shift,
    });
    element.dispatchEvent(keyupEvent);
  }
}
