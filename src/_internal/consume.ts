import type { SignalValue } from "./value";

const MINISIGNAL_STACK = Symbol.for("minisignal.stack");

/**
 * Stack of tracking scopes, stored on globalThis via a well-known Symbol so
 * that multiple versions of the library share the same tracking stack.
 * Each nested consume() call pushes its own scope, ensuring that signals
 * are attributed to the correct consumer without leaking across levels.
 */
const scopeStack: Array<Set<SignalValue<unknown>>> = ((globalThis as any)[
  MINISIGNAL_STACK
] ??= []);

export function consume<T>(
  fn: () => T,
): [T, ReadonlySet<SignalValue<unknown>>] {
  const scope = new Set<SignalValue<unknown>>();
  scopeStack.push(scope);
  try {
    const result = fn();
    return [result, scope];
  } finally {
    scopeStack.pop();
  }
}

export function consumeSignal(signal: SignalValue<unknown>): void {
  if (scopeStack.length === 0) return;
  const scope = scopeStack[scopeStack.length - 1];
  scope.add(signal);
}

export class SignalTracker {
  #listener: () => void;
  #cleanup: (() => void) | undefined;

  constructor(listener: () => void) {
    this.#listener = listener;
  }

  track<T>(fn: () => T): T {
    this.#cleanup?.();
    const [result, signals] = consume(fn);

    const cleanups = Array.from(signals, (s) => s.subscribe(this.#listener));

    this.#cleanup = () => {
      cleanups.forEach((unsub) => unsub());
    };

    return result;
  }

  dispose() {
    this.#cleanup?.();
    this.#cleanup = undefined;
  }
}
