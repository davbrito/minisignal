import type { Signal } from "./signal.js";
import { signal } from "./signal.js";

export function derived<T, U>(
  base: Signal<T>,
  fn: (value: T) => U
): Readonly<Signal<U>> {
  const derivedSignal = signal(fn(base.value));

  base.subscribe((value) => {
    derivedSignal.value = fn(value);
  });

  return Object.freeze({
    ...derivedSignal,
    get value() {
      return derivedSignal.value;
    },
    set value(_v) {
      throw new Error("Can't set the value of a derived signal");
    },
  });
}
