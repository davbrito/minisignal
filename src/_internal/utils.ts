export function invariant(
  condition: unknown,
  message?: string
): asserts condition {
  /* c8 ignore next 5 */
  if (!condition) {
    throw new Error(
      message ? `Invariant violation: ${message}` : "Invariant violation"
    );
  }
}

export function noop(): void {
  // This function intentionally does nothing.
  // It can be used as a placeholder or to satisfy type requirements.
}
