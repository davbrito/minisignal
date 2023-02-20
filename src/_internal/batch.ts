export let isBatching = false;

export function batch(fn: () => void): void {
  try {
    isBatching = true;
    fn();
  } finally {
    isBatching = false;
  }
}
