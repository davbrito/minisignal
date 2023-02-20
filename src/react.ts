import type { ReactElement } from "react";
import { createElement, useSyncExternalStore } from "react";
import { batch } from "./_internal/batch.js";
import { derived as coreDerived } from "./derived.js";
import type { Signal } from "./signal.js";
import { signal as coreSignal } from "./signal.js";

export type ReactSignal<T> = Signal<T> & ReactElement<Record<string, never>>;

export function signal<T>(value: T): ReactSignal<T> {
  return reactizeSignal(coreSignal(value));
}

export function derived<T, U>(
  baseSignal: Signal<T>,
  fn: (value: T) => U
): Readonly<ReactSignal<U>> {
  return reactizeSignal(coreDerived(baseSignal, fn));
}

function reactizeSignal<T>(signal: Signal<T>): ReactSignal<T> {
  const getSnapshot = () => signal.value;

  const Signal = () => {
    return useSyncExternalStore(
      signal.subscribe,
      getSnapshot
    ) as JSX.Element | null;
  };

  return Object.freeze({
    ...createElement(Signal),
    get value() {
      return signal.value;
    },
    set value(newValue) {
      batch(() => {
        signal.value = newValue;
      });
    },
    subscribe: signal.subscribe.bind(signal),
  });
}
