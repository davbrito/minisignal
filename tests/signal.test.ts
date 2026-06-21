import { expect, it, test, vi } from "vitest";
import { signal } from "../src/signal.js";

test("has the initial value on initialize", () => {
  const s = signal(1);

  expect(s.value).toBe(1);
});

test("has the new value after set", () => {
  const s = signal(1);

  s.value = 2;

  expect(s.value).toBe(2);
});

test("calls the listener when the value changes", () => {
  const s = signal(1);
  const listener = vi.fn();

  s.subscribe(listener);

  s.value = 2;

  expect(listener).toHaveBeenCalledTimes(1);
});

test("does not call the listener when the value does not change", () => {
  const s = signal(1);
  const listener = vi.fn();

  s.subscribe(listener);

  expect(listener).not.toHaveBeenCalled();

  s.value = 1;

  expect(listener).not.toHaveBeenCalled();
});

test("does not call the listener when unsubscribed", () => {
  const s = signal(1);
  const listener = vi.fn();

  const unsubscribe = s.subscribe(listener);

  unsubscribe();

  s.value = 2;

  expect(listener).not.toHaveBeenCalled();
});

it("should not call the listener when the value assigned is referentially equal to the current value", () => {
  const s = signal(12);
  const listener = vi.fn();

  s.subscribe(listener);

  s.value = 12;

  expect(listener).not.toHaveBeenCalled();
});

test("multiple subscribers are all notified", () => {
  const s = signal(1);
  const listener1 = vi.fn();
  const listener2 = vi.fn();

  s.subscribe(listener1);
  s.subscribe(listener2);

  s.value = 2;

  expect(listener1).toHaveBeenCalledTimes(1);
  expect(listener2).toHaveBeenCalledTimes(1);
});

test("unsubscribe and resubscribe works", () => {
  const s = signal(1);
  const listener = vi.fn();

  const unsub1 = s.subscribe(listener);
  unsub1();

  s.value = 2;
  expect(listener).not.toHaveBeenCalled();

  const unsub2 = s.subscribe(listener);
  s.value = 3;

  expect(listener).toHaveBeenCalledTimes(1);
  expect(s.value).toBe(3);
  unsub2();
});

test("signal with undefined initial value", () => {
  const s = signal<number | undefined>(undefined);
  expect(s.value).toBeUndefined();

  s.value = undefined; // same value, should not notify
  const listener = vi.fn();
  s.subscribe(listener);

  s.value = 42;
  expect(listener).toHaveBeenCalledTimes(1);
  expect(s.value).toBe(42);
});
