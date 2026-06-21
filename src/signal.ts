import { SignalValue } from "./_internal/value";

export type Signal<T> = {
  value: T;
  peek(): T;
  valueOf(): T;
  toString(): string;
  toJSON(): T;
  subscribe(listener: () => void): () => void;
};

export function signal<T>(value: T): Signal<T> {
  const signalValue = new SignalValue<T>();
  signalValue.value = value;
  return signalValue;
}
