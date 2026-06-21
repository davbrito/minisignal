import { consume, consumeSignal } from "./_internal/consume.js";
import { noop } from "./_internal/utils.js";
import type { Signal } from "./signal.js";

export function derived<U>(fn: () => U): Readonly<Signal<U>> {
  let base: ReadonlySet<Signal<unknown>>;
  let valid = false;
  let currentValue: U | undefined;

  const invalidate = () => {
    valid = false;
    currentValue = undefined;
  };

  const get = () => {
    if (valid) return currentValue!;
    const [value, signals] = consume(fn);
    base = signals;
    valid = true;
    currentValue = value;
    return value;
  };

  const subscribe = (callback: () => void): (() => void) => {
    if (!valid) {
      get(); // Ensure the value is computed before subscribing
    }

    if (base === undefined || base.size === 0) {
      return noop;
    }

    const subscriptions = Array.from(base, (s) =>
      s.subscribe(() => {
        invalidate();
        callback();
      }),
    );

    return () => {
      for (const unsubscribe of subscriptions) {
        unsubscribe();
      }
      invalidate();
    };
  };

  return Object.freeze({
    subscribe,
    get value() {
      consumeSignal(this);
      return get();
    },
    set value(_v) {
      throw new Error("Can't set the value of a derived signal");
    },
  });
}
