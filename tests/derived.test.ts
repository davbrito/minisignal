import { expect, test, vi } from "vitest";
import { derived } from "../src/derived";
import { signal } from "../src/signal";

test("has the initial value on initialize", () => {
  const s = signal(1);
  const d = derived(s, (value) => value * 2);

  expect(d.value).toBe(2);
});

test("has the new value after set", () => {
  const s = signal(1);
  const d = derived(s, (value) => value * 2);

  s.value = 10;

  expect(d.value).toBe(20);
});

test("calls the listener when the value changes", () => {
  const s = signal(1);
  const d = derived(s, (value) => value * 2);
  const listener = vi.fn();

  d.subscribe(listener);

  s.value = 10;

  expect(listener).toHaveBeenCalledWith(20);
});

test("does not call the listener when the value does not change", () => {
  const s = signal(1);
  const d = derived(s, (value) => value * 2);
  const listener = vi.fn();

  d.subscribe(listener);

  expect(listener).not.toHaveBeenCalled();

  s.value = 1;

  expect(listener).not.toHaveBeenCalled();
});

test("does not call the listener when unsubscribed", () => {
  const s = signal(1);
  const d = derived(s, (value) => value * 2);
  const listener = vi.fn();

  const unsubscribe = d.subscribe(listener);

  unsubscribe();

  s.value = 10;

  expect(listener).not.toHaveBeenCalled();
});

test("can't set the value of a derived signal", () => {
  const s = signal(1);
  const d = derived(s, (value) => value * 2);

  expect(() => {
    // @ts-expect-error - this is expected to fail
    d.value = 10;
  }).toThrow();
});
