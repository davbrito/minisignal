import { expect, test, vi } from "vitest";
import { derived } from "../src/derived";
import { signal } from "../src/signal";

test("has the initial value on initialize", () => {
  const s = signal(1);
  const d = derived(() => s.value * 2);

  expect(d.value).toBe(2);
});

test("has the new value after set", () => {
  const s = signal(1);
  const d = derived(() => s.value * 2);

  s.value = 10;

  expect(d.value).toBe(20);
});

test("has fresh values after unsubscribe", () => {
  const s = signal(1);
  const d = derived(() => s.value * 2);

  const unsub = d.subscribe(() => {});

  unsub();

  s.value = 10;

  expect(d.value).toBe(20);
});

test("calls the listener when the value changes", () => {
  const s = signal(1);
  const d = derived(() => s.value * 2);
  const listener = vi.fn();

  d.subscribe(listener);

  expect(listener).not.toHaveBeenCalled();

  s.value = 10;

  expect(listener).toHaveBeenCalledTimes(1);
  expect(d).toHaveProperty("value", 20);
});

test("does not call the listener when the value does not change", () => {
  const s = signal(1);
  const d = derived(() => s.value * 2);
  const listener = vi.fn();

  d.subscribe(listener);

  expect(listener).not.toHaveBeenCalled();

  s.value = 1;

  expect(listener).not.toHaveBeenCalled();
});

test("does not call the listener when unsubscribed", () => {
  const s = signal(1);
  const d = derived(() => s.value * 2);
  const listener = vi.fn();

  const unsubscribe = d.subscribe(listener);

  unsubscribe();

  s.value = 10;

  expect(listener).not.toHaveBeenCalled();
});

test("can't set the value of a derived signal", () => {
  const s = signal(1);
  const d = derived(() => s.value * 2);

  expect(() => {
    // @ts-expect-error - this is expected to fail
    d.value = 10;
  }).toThrow();
});

test("subscribing to a derived with no signal dependencies returns a noop", () => {
  const d = derived(() => 42);

  const unsub = d.subscribe(() => {});

  expect(unsub).toBeTypeOf("function");
  expect(() => unsub()).not.toThrow();
});

test("derived from multiple signals", () => {
  const s1 = signal(1);
  const s2 = signal(10);
  const d = derived(() => s1.value + s2.value);

  expect(d.value).toBe(11);

  s1.value = 5;
  expect(d.value).toBe(15);

  s2.value = 20;
  expect(d.value).toBe(25);
});

test("chained derived (derived depending on another derived)", () => {
  const s = signal(2);
  const d1 = derived(() => s.value * 3);
  const d2 = derived(() => d1.value + 1);

  expect(d2.value).toBe(7);

  s.value = 3;
  expect(d1.value).toBe(9);
  expect(d2.value).toBe(10);
});

test("chained derived notifies listeners", () => {
  const s = signal(2);
  const d1 = derived(() => s.value * 3);
  const d2 = derived(() => d1.value + 1);
  const listener = vi.fn();

  d2.subscribe(listener);

  s.value = 5;

  expect(listener).toHaveBeenCalledTimes(1);
  expect(d2.value).toBe(16);
});

test("derived does not notify listeners if the value doesn't change even if dependencies change", () => {
  const s = signal(1);
  const d = derived(() => (s.value > 0 ? 10 : 20));
  const listener = vi.fn();

  expect(d.value).toBe(10);

  d.subscribe(listener);

  s.value = 2;

  expect(listener).not.toHaveBeenCalled();

  s.value = -1;

  expect(listener).toHaveBeenCalledTimes(1);
  expect(d.value).toBe(20);

  s.value = -2;

  expect(listener).toHaveBeenCalledTimes(1);
  expect(d.value).toBe(20);
});

test("cannot set the value of a derived react signal", () => {
  const s = signal(1);
  const d = derived(() => s.value * 10);

  expect(() => {
    (d as any).value = 100;
  }).toThrow("Can't set the value of a derived signal");
});

test("subscribe after unsubscribe re-tracks signal dependencies", () => {
  const s = signal(1);
  const d = derived(() => s.value * 2);
  const listener = vi.fn();

  // First subscription
  const unsub1 = d.subscribe(listener);
  unsub1();

  // All listeners gone — tracker should have disposed
  // Second subscription should re-track
  s.value = 5;
  const unsub2 = d.subscribe(listener);

  expect(d.value).toBe(10);
  expect(listener).not.toHaveBeenCalled();

  s.value = 10;
  expect(listener).toHaveBeenCalledTimes(1);
  expect(d.value).toBe(20);

  unsub2();
});
