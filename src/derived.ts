import { DerivedSignal } from "./_internal/signals.js";
import type { Signal } from "./signal.js";

export function derived<U>(fn: () => U): Readonly<Signal<U>> {
  return new DerivedSignal(fn);
}
