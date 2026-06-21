import type { Signal } from "../signal";

const MINISIGNAL_STACK = Symbol.for("minisignal.stack");

/**
 * Stack of tracking scopes, stored on globalThis via a well-known Symbol so
 * that multiple versions of the library share the same tracking stack.
 * Each nested consume() call pushes its own scope, ensuring that signals
 * are attributed to the correct consumer without leaking across levels.
 */
const scopeStack: Array<Set<Signal<unknown>>> = ((globalThis as any)[
  MINISIGNAL_STACK
] ??= []);

export function consume<T>(fn: () => T): [T, ReadonlySet<Signal<unknown>>] {
  const scope = new Set<Signal<unknown>>();
  scopeStack.push(scope);
  try {
    const result = fn();
    return [result, scope];
  } finally {
    scopeStack.pop();
  }
}

export function consumeSignal(signal: Signal<unknown>): void {
  if (scopeStack.length === 0) return;
  const scope = scopeStack[scopeStack.length - 1];
  scope.add(signal);
}
