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
