import { isBatching } from "./_internal/batch";
import { invariant } from "./_internal/utils";

export type Signal<T> = {
  value: T;
  subscribe(listener: (value: T) => void): () => void;
};

export function signal<T>(value: T): Signal<T> {
  const listeners = new Set<(value: T) => void>();

  let queue: T[] | null = null;

  return Object.freeze({
    get value() {
      return value;
    },
    set value(newValue) {
      if (newValue === value) return;
      value = newValue;

      if (isBatching) {
        if (!queue) queue = [];
        queue.push(newValue);

        queueMicrotask(() => {
          if (!queue || queue.length === 0) return;
          invariant(
            value === queue?.[queue.length - 1],
            "queue is out of sync (this is a bug)"
          );
          queue = null;
          listeners.forEach((listener) => listener(value));
        });
      } else {
        if (queue) queue = null;
        listeners.forEach((listener) => listener(value));
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}
