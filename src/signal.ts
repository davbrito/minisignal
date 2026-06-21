import { enqueue } from "./_internal/batch";
import { consumeSignal } from "./_internal/consume";
import { Subscription } from "./_internal/subscription";

export type Signal<T> = {
  value: T;
  subscribe(listener: () => void): () => void;
};

export function signal<T>(value: T): Signal<T> {
  const subscription = Subscription();

  return Object.freeze({
    get value() {
      consumeSignal(this);
      return value;
    },
    set value(newValue) {
      if (newValue === value) return;
      value = newValue;
      enqueue(this, subscription.notify);
    },
    subscribe: subscription.subscribe,
  });
}
