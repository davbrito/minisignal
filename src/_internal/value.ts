import { enqueue } from "./batch";
import { consumeSignal, untracked } from "./consume";
import { invariant } from "./utils";

const EMPTY = Symbol("minisignal.empty");

export class SignalValue<T> {
  #cache: T | typeof EMPTY = EMPTY;
  #listeners = new Set<() => void>();

  get value() {
    consumeSignal(this);
    invariant(this.#cache !== EMPTY, "SignalValue is not initialized");
    return this.#cache;
  }

  set value(value: T) {
    if (this.#cache !== EMPTY && Object.is(this.#cache, value)) {
      return;
    }
    this.#cache = value;
    this.#notify();
  }

  peek(): T {
    return untracked(() => this.value);
  }

  valueOf(): T {
    return this.value;
  }

  toString(): string {
    return this.value + "";
  }

  toJSON(): T {
    return this.value;
  }

  subscribe = (callback: () => void): (() => void) => {
    this.#listeners.add(callback);
    return () => {
      this.#listeners.delete(callback);
    };
  };

  #notify() {
    const listeners = Array.from(this.#listeners);
    enqueue(this, () => {
      for (const listener of listeners) {
        listener();
      }
    });
  }
}
