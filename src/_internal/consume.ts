import type { Signal } from "../signal";

const MINISIGNAL_SCOPE = Symbol.for("minisignal.scope");
const EMPTY_ARRAY: ReadonlyArray<Signal<unknown>> = Object.freeze([]);

const current: Set<Signal<unknown>> = ((globalThis as any)[MINISIGNAL_SCOPE] ||=
  new Set());
let isConsuming = false;

export function consume<T>(fn: () => T): [T, ReadonlyArray<Signal<unknown>>] {
  isConsuming = true;
  current.clear();
  try {
    const result = fn();

    if (current.size > 0) {
      const signals = Array.from(current);
      return [result, signals];
    }

    return [result, EMPTY_ARRAY];
  } finally {
    current.clear();
    isConsuming = false;
  }
}

export function consumeSignal(signal: Signal<unknown>): void {
  if (!isConsuming) {
    return;
  }

  current.add(signal);
}
